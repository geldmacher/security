import { createRequire } from "node:module";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const references = join(here, "..", "references");
const require = createRequire(import.meta.url);
const { validateDocument } = require(join(references, "validate-findings.cjs"));
const schema = require(join(references, "report-schema.json"));

const abusePattern = /^Abuse path: \S.*$/m;
const reachabilityPattern = /^Reachability: (reachable|not_reachable|insufficient) — \S.*$/m;
const expectedReachability = {
  confirmed: "reachable",
  rejected: "not_reachable",
  needs_validation: "insufficient",
};
const maxBytes = 5 * 1024 * 1024;

export function validateReport(findings, reportSchema = schema) {
  const errors = [...validateDocument(findings, reportSchema)];
  if (errors.length > 0 || !Array.isArray(findings)) return errors;
  findings.forEach((finding, index) => {
    const description = typeof finding?.description === "string" ? finding.description : "";
    if (!abusePattern.test(description)) {
      errors.push(`#${index}: description must contain "Abuse path: " followed by how the issue is abused`);
    }
    const match = description.match(reachabilityPattern);
    if ((description.match(/^Reachability:/gm)?.length ?? 0) > 1) {
      errors.push(`#${index}: description must contain exactly one Reachability line`);
    } else if (!match) {
      errors.push(`#${index}: description must contain "Reachability: reachable|not_reachable|insufficient — " and the reason`);
    } else if (expectedReachability[finding.verdict] && match[1] !== expectedReachability[finding.verdict]) {
      errors.push(`#${index}: verdict ${finding.verdict} requires Reachability: ${expectedReachability[finding.verdict]} (do not round needs_validation up to confirmed); got ${match[1]}`);
    }
  });
  return errors;
}

export function validateReportFile(file) {
  const path = resolve(file);
  let stat;
  try {
    stat = lstatSync(path);
  } catch (error) {
    process.stderr.write(`findings file is not readable: ${error.message}\n`);
    return 1;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    process.stderr.write("findings file must be a regular file\n");
    return 1;
  }
  if (stat.size > maxBytes) {
    process.stderr.write("findings file exceeds 5 MiB\n");
    return 1;
  }
  let findings;
  try {
    findings = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    process.stderr.write(`findings file is not JSON: ${error.message}\n`);
    return 1;
  }
  const errors = validateReport(findings);
  if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`ERROR: ${error}\n`);
    process.stderr.write(`FAIL: ${errors.length} validation error(s)\n`);
    return 1;
  }
  process.stdout.write(`PASS: ${findings.length} findings valid\n`);
  return 0;
}

export function runReportCli(moduleUrl, usagePath) {
  const entrypoint = process.argv[1];
  if (!entrypoint) return;
  const modulePath = fileURLToPath(moduleUrl);
  if (resolve(entrypoint) !== modulePath) {
    try {
      if (realpathSync(entrypoint) !== modulePath) return;
    } catch {
      return;
    }
  }
  if (!process.argv[2]) {
    process.stderr.write(`Usage: node ${usagePath} <findings.json>\n`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = validateReportFile(process.argv[2]);
}

runReportCli(import.meta.url, "skills/security/scripts/validate-report.mjs");
