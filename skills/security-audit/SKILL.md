---
name: security-audit
description: Run the full six-phase security audit. Use only when the user explicitly asks for an audit, a source pen-test, or a full end-to-end security review.
---

# Security audit

This is the audit intensity of [security](../security/SKILL.md). Read that skill and follow its audit level, including [the finding standard](../security/references/finding-standard.md), [the level instructions](../security/references/levels.md), and [the auditor](../security/references/auditor.md). Do not use this skill for a quick look at the current diff.

Scope is the repository, or the paths the user names. Do not probe production systems or other live shared services. Do not execute repository code without a sandbox.

Use the read-only `security-auditor` to try to disprove each candidate. In Cursor, use that agent. In Codex or OpenCode, delegate a read-only pass with the auditor reference as its instructions. If delegation is unavailable, do the refutation in the current session and label it as not independent. A finding stays `confirmed` only if that pass does not disprove it. Do not round `needs_validation` up to `confirmed`.

Validate the final `findings.json` with [the report script](../security/scripts/validate-report.mjs), then derive `security-summary.md` from those records. State what was not checked and the confidence of the run.
