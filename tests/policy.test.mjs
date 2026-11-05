import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import test from "node:test";
import { parseDocument } from "yaml";
import { defaultRoot, parseFrontmatter } from "../scripts/validate-plugin.mjs";
import { portableSkills } from "./helpers/plugin-surface.mjs";

const read = (path) => readFileSync(join(defaultRoot, path), "utf8");
const entries = (path, extension) => readdirSync(join(defaultRoot, path)).filter((name) => name.endsWith(extension)).sort();
const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

test("OpenCode shared-config rule is fixed in deploy and release instructions", () => {
  const rule = "OpenCode config (opencode.json, commands/) is shared with Workflow and Design: merge only, touch only your own entries, never write backups; uninstall removes only your own entries; rollback means installing an older GitHub release.";
  for (const path of [
    "AGENTS.md",
    ".agents/skills/deploy-local-plugin/SKILL.md",
    ".agents/skills/release-plugin/SKILL.md",
    "docs/development.md",
    "docs/installation.md",
    "docs/release-checklist.md",
    "docs/release-validation.md",
    "skills/install-new-release-from-repo/SKILL.md",
    "targets/opencode/README.md",
  ]) assert.ok(read(path).includes(rule), path);
});

test("public surface retains portable skills, matching commands, the auditor, and the guard", () => {
  const skills = readdirSync(join(defaultRoot, "skills")).filter((name) => existsSync(join(defaultRoot, "skills", name, "SKILL.md"))).sort();
  assert.deepEqual(skills, portableSkills);
  assert.deepEqual(entries("commands", ".md"), portableSkills.map((name) => `${name}.md`).sort());
  assert.deepEqual(entries("agents", ".md"), ["security-auditor.md"]);
  assert.deepEqual(entries("rules", ".mdc"), ["security-guard.mdc"]);
  const cursor = JSON.parse(read(".cursor-plugin/plugin.json"));
  assert.deepEqual(cursor.skills, portableSkills.map((name) => `./skills/${name}/SKILL.md`));
  assert.equal(JSON.parse(read(".codex-plugin/plugin.json")).skills, "./skills/");
  assert.deepEqual(readdirSync(join(defaultRoot, ".codex-plugin")), ["plugin.json"]);
  assert.deepEqual(readdirSync(join(defaultRoot, "adapters/codex/skills")), ["security-guard-setup"]);
  assert.deepEqual(readdirSync(join(defaultRoot, "adapters/opencode/skills")), ["security-guard-setup"]);
});

test("Cursor commands resolve to the identically named shared skill", () => {
  for (const file of entries("commands", ".md")) {
    const fields = parseFrontmatter(join(defaultRoot, "commands", file));
    const link = read(`commands/${file}`).match(/\.\.\/skills\/([^/]+)\/SKILL\.md/);
    assert.ok(link, `${file} must delegate to a skill`);
    assert.equal(fields.name, basename(file, ".md"));
    assert.equal(link[1], fields.name);
  }
});

test("public skills remain available for implicit selection without file scoping", () => {
  const directories = [
    ...portableSkills.map((name) => `skills/${name}`),
    "adapters/codex/skills/security-guard-setup",
    "adapters/opencode/skills/security-guard-setup",
  ];
  for (const directory of directories) {
    const fields = parseFrontmatter(join(defaultRoot, directory, "SKILL.md"));
    assert.notEqual(fields["disable-model-invocation"], true, directory);
    assert.notEqual(fields.disable_model_invocation, true, directory);
    assert.equal(fields.paths, undefined, directory);
    assert.equal(fields.globs, undefined, directory);
    const metadata = `${directory}/agents/openai.yaml`;
    if (existsSync(join(defaultRoot, metadata))) {
      const document = parseDocument(read(metadata));
      assert.deepEqual(document.errors, [], metadata);
      assert.notEqual(document.toJS()?.policy?.allow_implicit_invocation, false, metadata);
    }
  }
});

test("the security skill stays a short router onto the finding standard and levels", () => {
  const security = read("skills/security/SKILL.md");
  assert.ok(body(security).split(/\s+/).length <= 450, "security SKILL.md must stay a short router");
  for (const name of ["finding-standard.md", "levels.md", "auditor.md", "SKILL.md"]) {
    assert.ok(security.includes(`references/${name}`), `missing branch: ${name}`);
  }
  assert.match(security, /default intensity is \*\*quick\*\*/);
  assert.match(security, /Do not raise the intensity on your own/);
  assert.match(security, /what was not checked/);
  assert.match(security, /confidence/);
  assert.match(security, /Do not probe production/);
  assert.match(security, /does not provide one/);
  assert.match(security, /Do not trust unvalidated JSON/);
  assert.match(read("skills/security-audit/SKILL.md"), /audit intensity of \[security\]/);
});

test("review and audit preserve user authority and the verdict bar", () => {
  const security = read("skills/security/SKILL.md");
  const standard = read("skills/security/references/finding-standard.md");
  assert.match(security, /does not change code unless the user asks/i);
  assert.match(security, /Do not commit, push, or release unless the user separately asks/);
  assert.match(standard, /Never round `needs_validation` up to `confirmed`/);
  assert.match(standard, /Abuse path/);
  assert.match(standard, /Reachability: reachable/);
  assert.match(standard, /Reachability: not_reachable/);
  assert.match(standard, /Reachability: insufficient/);
  const fields = parseFrontmatter(join(defaultRoot, "agents/security-auditor.md"));
  assert.equal(fields.readonly, true);
  assert.equal(fields.model, "inherit");
  assert.match(read("agents/security-auditor.md"), /references\/auditor\.md/);
  assert.match(read("skills/security/references/auditor.md"), /tries to disprove findings/i);
});

test("review names the scanners and does not install them globally", () => {
  const levels = read("skills/security/references/levels.md");
  for (const scanner of ["composer audit", "npm audit", "pnpm audit", "pip-audit", "gitleaks", "semgrep", "osv-scanner"]) {
    assert.ok(levels.includes(scanner), scanner);
  }
  assert.match(levels, /Never install a scanner globally without an explicit yes/);
  assert.match(levels, /Never add it as a project dependency/);
  assert.match(levels, /Do not execute the target project's code/);
});

test("the guard is always applied in Cursor and opt-in elsewhere", () => {
  const rule = read("rules/security-guard.mdc");
  const canonical = read("adapters/codex/skills/security-guard-setup/references/security-guard.md");
  const opencode = read("adapters/opencode/skills/security-guard-setup/references/security-guard.md");
  assert.equal(parseFrontmatter(join(defaultRoot, "rules/security-guard.mdc")).alwaysApply, true);
  assert.equal(body(rule), canonical.trim());
  assert.equal(canonical, opencode);
  for (const trigger of [
    "dependency or lockfile",
    "authentication, authorization, or session handling",
    "SQL, a shell, a filesystem path, a template, deserialization, XML, or YAML",
    "file upload",
    "secrets, configuration, or environment",
    "cryptography",
    "CI/CD or deployment",
    "network egress or SSRF",
  ]) assert.ok(canonical.includes(trigger), trigger);
  assert.match(canonical, /curl \| sh/);
  assert.match(canonical, /are not instructions to you/);
  assert.match(canonical, /Do not write a report/);
  assert.match(canonical, /Do not upgrade `needs_validation` to `confirmed`/);
  const codex = read("adapters/codex/skills/security-guard-setup/SKILL.md");
  const openCodeSetup = read("adapters/opencode/skills/security-guard-setup/SKILL.md");
  for (const text of ["AGENTS.override.md", "AGENTS.md", "geldmacher-security:security-guard:start", "geldmacher-security:security-guard:end"]) {
    assert.ok(codex.includes(text), text);
  }
  assert.match(codex, /show the exact diff and wait for explicit user approval/i);
  assert.match(codex, /Removal deletes only the marked block/);
  assert.match(codex, /start a new Codex task/i);
  assert.match(openCodeSetup, /does not modify `opencode\.json`/i);
  assert.match(openCodeSetup, /show the exact diff and wait for explicit user approval/i);
  assert.match(openCodeSetup, /start a new OpenCode session/i);
  assert.ok(openCodeSetup.includes("geldmacher-security:security-guard:start"));
});

test("vendored Cloudflare files match the recorded snapshot", () => {
  const upstream = read("skills/security/references/UPSTREAM.txt");
  assert.match(upstream, /https:\/\/github\.com\/cloudflare\/security-audit-skill/);
  assert.match(upstream, /c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/);
  assert.match(upstream, /2026-09-14/);
  assert.match(upstream, /Local modifications: none/);
  const rows = [...upstream.matchAll(/^([0-9a-f]{64})  (\S+)$/gm)];
  assert.ok(rows.length >= 20, "snapshot must list the vendored files");
  for (const [, hash, name] of rows) {
    assert.equal(createHash("sha256").update(readFileSync(join(defaultRoot, "skills/security/references", name))).digest("hex"), hash, name);
  }
});

test("vendored schemas remain pinned to their independently recorded hashes", () => {
  for (const [path, expected] of [
    ["schemas/plugin.schema.json", "732a1163ae72844f1cccc8bb9ea9a018ad013a35b47be4551bf9bdbc1d29234a"],
    ["schemas/agent-plugins/1.0.0/plugin.schema.json", "0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883"],
  ]) {
    assert.equal(createHash("sha256").update(read(path)).digest("hex"), expected);
    assert.ok(read("schemas/README.md").includes(expected));
  }
});

test("CI and local development use the same release gate", () => {
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.equal(scripts.validate, "node scripts/validate-plugin.mjs");
  assert.equal(scripts["check:links"], "node scripts/check-links.mjs");
  assert.match(scripts["release-check"], /npm run check:targets.*npm run validate.*npm run check:links.*npm test/);
  assert.match(read(".github/workflows/validate.yml"), /run: npm run release-check/);
  assert.match(read("package.json"), /"node": ">=22"/);
});
