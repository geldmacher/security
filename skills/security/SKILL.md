---
name: security
description: Review the current diff, the affected code, or a repository for security issues that can be abused in this system. Defaults to a quick pass unless the user asks for review or audit.
---

# Security

Use this skill when the user asks for a security review, names `security`, or asks whether a change can be abused. The default intensity is **quick**. Use **review** or **audit** only when the user asks for that intensity, or when they invoke `security-audit` (that invocation is audit). Do not raise the intensity on your own.

Read [the finding standard](references/finding-standard.md) once per task. It applies at every intensity. Read [the level instructions](references/levels.md) for the selected intensity only.

The always-on security guard still applies. This skill is the explicit pass. It does not replace the user's goal, and it does not change code unless the user asks for a fix. Do not commit, push, or release unless the user separately asks. Do not probe production systems or other live shared services. Do not execute repository code without a sandbox; this plugin does not provide one. If a check needs that execution, record `needs_validation` and name the missing sandbox.

Every result states what was not checked and a confidence of low, medium, or high, with the reason. Quick results stay in the conversation. Review and audit write `findings.json`, validate it, then derive `security-summary.md` from the validated records. Run `node <validator-path> <findings.json-path>` using [the packaged validator](scripts/validate-report.mjs) or `scripts/validate-report.mjs` from the plugin source. If validation fails, correct the records and rerun it. Report any unresolved failure as incomplete. Do not trust unvalidated JSON.

## Quick

Current diff or staged changes only. Spend minutes, not a repository tour. Apply the finding standard to that diff. Do not run scanners and do not write a report file.

## Review

The diff, the affected modules, and their data flows. Run the deterministic scanners named in the level instructions when they are already available or can be run without a global install and without changing the target project. Interpret scanner output through the finding standard, including reachability, and deduplicate it. Then validate the findings and write the summary.

## Audit

Only for an explicit audit, pen-test of the source, or full end-to-end review. Follow the six phases in [the vendored Cloudflare skill](references/SKILL.md), using the phase and attack-class files beside it. Scope is the repository or the paths the user names. No live probing.

After candidates exist, use [the auditor](references/auditor.md). In Cursor, delegate to the read-only `security-auditor` agent. In Codex or OpenCode, delegate a read-only pass with that reference as its instructions. A finding stays `confirmed` only when that pass does not disprove it. Validate the final findings before writing the summary. Also run the vendored coverage-ledger validator when the audit writes a ledger.
