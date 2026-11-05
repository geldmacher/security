# Intensity levels

The default is quick. Do not raise it unless the user asks.

## Quick

Review the current diff, or the staged changes when the user asks for those. Do not tour the rest of the repository. Do not run scanners. Do not write `findings.json`. State the findings in the conversation using the finding standard, then state what was not checked and the confidence.

## Review

Read the diff and the modules it affects, including the data flow from the changed input to the operation that matters. Then run a deterministic scanner only when that scanner is already on `PATH`, or when the package manager can run it once without a global install and without editing the target project, its lockfile, or its dependencies.

The scanners are: `composer audit`, `npm audit`, `pnpm audit`, `pip-audit`, `gitleaks`, `semgrep`, and `osv-scanner`. Use the one that matches the ecosystem. Never install a scanner globally without an explicit yes. Never add it as a project dependency. A missing scanner is something that was not checked, not a clean result.

Do not execute the target project's code, tests, or build. This plugin does not provide a sandbox. If the decisive fact needs that execution, the verdict is `needs_validation` and the missing sandbox is the blocker. Advisory network calls made by a scanner are not a probe of the target's production system. Do not probe production systems or other live shared services.

Deduplicate scanner output with manual findings by root cause. A scanner result still has to pass the finding standard. Unreachable or already-mitigated hits are `rejected` or `needs_validation`, not `confirmed`.

Write `findings.json` and `security-summary.md` outside the target repository, under `~/security-reports/<repo-name>/`, unless the user names another directory. Validate the JSON with the report script before calling the report done. The summary states what was not checked and the confidence.

## Audit

Use this level only when the user explicitly asks for an audit, a source pen-test, or a full end-to-end review, or invokes `security-audit`.

Follow the six phases in [the vendored Cloudflare skill](SKILL.md):

1. Reconnaissance — [RECONNAISSANCE.md](RECONNAISSANCE.md)
2. Coverage-led hunting — [HUNTING.md](HUNTING.md) and [ATTACK-CLASSES.md](ATTACK-CLASSES.md), plus the domain files that the attack-class index selects
3. Candidate validation — [VALIDATION-AND-REPORTING.md](VALIDATION-AND-REPORTING.md)
4. Structured output — `findings.json`, checked with `validate-findings.cjs` through [the report script](../scripts/validate-report.mjs), and `coverage-ledger.json` checked with [validate-coverage-ledger.cjs](validate-coverage-ledger.cjs)
5. Independent record verification — a fresh pass using [auditor.md](auditor.md)
6. The readable summary, derived from the validated records

Scope is the repository, or the paths the user names. A scoped run says what was left out. Do not probe production systems, shared infrastructure, or live control planes. Do not execute target code without the sandbox described in the vendored skill. If that sandbox is not available, keep the blocked lead at `needs_validation`.

In Cursor, the phase 5 pass is the read-only `security-auditor` agent. In Codex or OpenCode, delegate a read-only agent with `auditor.md` and the finding standard as its instructions. If delegation is unavailable, do the refutation in the current session and label it as not independent. A finding stays `confirmed` only when that pass does not disprove it.

Write the artifacts outside the repository unless the user selects a gitignored directory inside it. The summary is `security-summary.md`. It matches the JSON verdicts. State what was not checked and the confidence.
