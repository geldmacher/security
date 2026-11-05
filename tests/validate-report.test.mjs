import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { defaultRoot } from "../scripts/validate-plugin.mjs";
import { validateReport } from "../scripts/validate-report.mjs";

function source(kind = "sink", file = "src/handler.js", line = 10) {
  return { kind, file, line, scope: "handle", description: "Attacker data reaches the operation." };
}

function evidence(file = "src/handler.js", line = 12) {
  return { file, line, description: "The handler writes the record without an ownership check." };
}

function confirmed(reachability = "reachable — the public route calls the handler with the caller's identifier.") {
  return {
    verdict: "confirmed",
    fingerprint: "src-handler-missing-check",
    title: "Missing ownership check",
    description: `An attacker can change another user's record.\nAbuse path: An unprivileged caller submits another user's identifier.\nReachability: ${reachability}`,
    root_cause: "handle omits the ownership check before writing the record.",
    intended_behavior: "Only the record owner can change it.",
    trace: [source()],
    evidence: [evidence()],
    conditions: [],
    execution: {
      attacker_perspective: "An unprivileged remote user with their own account.",
      payloads: ["An identifier owned by another user."],
      instructions: ["Submit the identifier through the public operation."],
      observed_result: "The other user's record changes.",
    },
    remediation: { strategy: "Check ownership before the write." },
    severity: {
      likelihood: { score: "medium", reason: "The operation is directly reachable." },
      impact: { score: "medium", reason: "The attacker changes one protected record." },
      overall_severity: "medium",
    },
    confidence: { score: "high", reason: "The source path is present in the diff." },
  };
}

function needsValidation(reachability = "insufficient — the deployment config that would block this route is not in the repository.") {
  return {
    verdict: "needs_validation",
    fingerprint: "src-parser-size",
    title: "Unchecked parsed size",
    description: `A parsed size may reach an allocation.\nAbuse path: A caller can submit a size the allocator does not cap.\nReachability: ${reachability}`,
    claimed_root_cause: "parse_size may pass an unbounded value to allocate.",
    trace: [source("entrypoint", "src/parse.js", 4)],
    evidence: [evidence("src/parse.js", 8)],
    blockers: ["The generated parser source is absent from this checkout."],
    validation_plan: { local: "Generate the parser and submit one oversized input in a sandbox." },
  };
}

function rejected() {
  return {
    verdict: "rejected",
    fingerprint: "src-query-bound",
    title: "Suspected query concatenation",
    description: "A query looked concatenated.\nAbuse path: A caller could change the SQL sent to the database.\nReachability: not_reachable — the query uses a bound parameter and the role cannot reach the table.",
    claimed_root_cause: "The query string was built from request data.",
    trace: [source("sink", "src/query.js", 3)],
    evidence: [evidence("src/query.js", 5)],
    reason: "The value is passed as a bound parameter.",
  };
}

test("a schema-valid report passes only when verdicts match reachability", () => {
  assert.deepEqual(validateReport([confirmed()]), []);
  assert.deepEqual(validateReport([]), []);
  assert.deepEqual(validateReport([needsValidation(), rejected()].sort((left, right) => left.fingerprint < right.fingerprint ? -1 : 1)).filter((error) => error.includes("sorted")), []);
  const ordered = [needsValidation(), rejected()].sort((left, right) => left.fingerprint < right.fingerprint ? -1 : 1);
  assert.deepEqual(validateReport(ordered), []);
});

test("needs_validation is not accepted as confirmed", () => {
  const upgraded = confirmed("insufficient — the gateway config is not in this repository.");
  const errors = validateReport([upgraded]);
  assert.ok(errors.some((error) => /do not round needs_validation up to confirmed/i.test(error)), errors.join("\n"));
});

test("a confirmed finding without an abuse path fails closed", () => {
  const finding = confirmed();
  finding.description = "Reachability: reachable — the route is public, but the abuse path line was omitted.";
  const errors = validateReport([finding]);
  assert.ok(errors.some((error) => /Abuse path/.test(error)), errors.join("\n"));
});

test("the report CLI rejects invalid JSON and accepts a validated file", () => {
  const directory = mkdtempSync(join(tmpdir(), "security-report-"));
  try {
    const invalid = join(directory, "broken.json");
    writeFileSync(invalid, "{");
    const broken = spawnSync(process.execPath, ["scripts/validate-report.mjs", invalid], { cwd: defaultRoot, encoding: "utf8" });
    assert.equal(broken.status, 1);
    assert.match(broken.stderr, /not JSON/);

    const valid = join(directory, "findings.json");
    writeFileSync(valid, `${JSON.stringify([confirmed()], null, 2)}\n`);
    const passed = spawnSync(process.execPath, ["scripts/validate-report.mjs", valid], { cwd: defaultRoot, encoding: "utf8" });
    assert.equal(passed.status, 0, passed.stderr);
    assert.match(passed.stdout, /PASS: 1 findings valid/);

    const link = join(directory, "linked.json");
    symlinkSync(valid, link);
    const linked = spawnSync(process.execPath, ["scripts/validate-report.mjs", link], { cwd: defaultRoot, encoding: "utf8" });
    assert.equal(linked.status, 1);
    assert.match(linked.stderr, /regular file/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
