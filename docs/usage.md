# Using Security

[Back to Security](../README.md) · [Installation](installation.md)

Security reviews a diff, the code around it, or a repository for issues that can be abused in this system. After [installation and activation](installation.md#finish-installation), use the following approach.

## Recommended everyday use

Give your agent an ordinary task with a clear goal and scope. Cursor's short rule accompanies that work and stays silent when the change is not security-sensitive. In Codex and OpenCode, the same guard across projects needs the [optional setup](#make-the-guard-persistent); the skills work without it.

Call a skill when you want findings. The default intensity is **quick**. Ask for **review** or **audit** when you want that intensity. Security does not raise it on its own.

| I want to… | Read this example | Skill |
| --- | --- | --- |
| Complete an ordinary development task | Describe the change and scope as usual | No extra skill needed |
| Check the current diff | [Quick review](#quick-review) | `security` |
| Follow the change into the affected modules | [Review](#review) | `security` |
| Audit the repository or a named scope | [Audit](#audit) | `security-audit` |
| Keep the short guard across Codex or OpenCode projects | [Persistent guard](#make-the-guard-persistent) | `security-guard-setup` |

## Select a skill

In **Cursor**, type `/` followed by the skill name. In **Codex**, use `$geldmacher-security:` followed by the skill name. In **OpenCode 2.1.2**, type `@` or `/` followed by the skill name.

Every result names what was not checked and a confidence of low, medium, or high. Verdicts are `confirmed`, `needs_validation`, and `rejected`. A missing fact stays `needs_validation`.

## Quick review

**When:** you want a few minutes on the current diff or staged changes, and you do not want a written report.

**Cursor:**

```text
/security Review my current changes for issues that can be abused in this system.
```

**Codex:**

```text
$geldmacher-security:security Review my current changes for issues that can be abused in this system.
```

**OpenCode:**

```text
@security Review my current changes for issues that can be abused in this system.
```

`/security` sends the same request in OpenCode.

You get findings for that diff only. Each one names the abuse path and whether it can occur here. Files stay unchanged. To apply a fix, ask for that fix and its scope.

## Review

**When:** the diff is not enough, and you want the affected modules, their data flow, and any scanner that is already available.

**Cursor:**

```text
/security Review the current diff and the modules it affects. Use review intensity. Run scanners only if they are already available.
```

**Codex:**

```text
$geldmacher-security:security Review the current diff and the modules it affects. Use review intensity. Run scanners only if they are already available.
```

**OpenCode:**

```text
@security Review the current diff and the modules it affects. Use review intensity. Run scanners only if they are already available.
```

The scanners are `composer audit`, `npm audit`, `pnpm audit`, `pip-audit`, `gitleaks`, `semgrep`, and `osv-scanner`. A missing scanner is listed under what was not checked. Scanner output is deduplicated and still has to pass the reachability standard. The agent writes `findings.json` and `security-summary.md` outside the repository and validates the JSON before treating the report as done. It does not install a scanner globally unless you agree, and it does not add the scanner as a project dependency.

## Audit

**When:** you explicitly want the six-phase pass over the repository or a scope you name. This is not the default.

**Cursor:**

```text
/security-audit Audit this repository. Do not probe production. Keep a finding confirmed only if the auditor cannot disprove it.
```

**Codex:**

```text
$geldmacher-security:security-audit Audit this repository. Do not probe production. Keep a finding confirmed only if the auditor cannot disprove it.
```

**OpenCode:**

```text
@security-audit Audit this repository. Do not probe production. Keep a finding confirmed only if the auditor cannot disprove it.
```

`/security-audit` sends the same request in OpenCode.

A named scope is the same request with the paths added, for example `Audit src/auth and its callers.` The report says what was left outside that scope. The pass does not probe production or other live shared systems. It does not execute repository code unless a sandbox with the controls in the vendored method is available. This plugin does not provide that sandbox, so blocked execution stays `needs_validation`.

The audit writes `findings.json` and `security-summary.md`, validates the JSON, and validates a coverage ledger when it writes one. Only findings the adversarial pass does not disprove stay `confirmed`.

## Make the guard persistent

Cursor already applies the guard. Codex and OpenCode do not, until you approve a patch.

**Codex, preview only:**

```text
$geldmacher-security:security-guard-setup Show the current status and preview setup of the persistent security guard. Do not change configuration.
```

**Codex, after you approve the shown diff:**

```text
$geldmacher-security:security-guard-setup Apply the security-guard patch I just approved, and nothing else.
```

**OpenCode, preview only:**

```text
@security-guard-setup Show the current status and preview setup of the persistent security guard. Do not change configuration.
```

**OpenCode, after you approve the shown diff:**

```text
@security-guard-setup Apply the security-guard patch I just approved, and nothing else.
```

The OpenCode setup edits only the marked block in `~/.config/opencode/AGENTS.md`. It does not change `opencode.json` or command files. Start a new Codex task or OpenCode session after a real change. Removing the block is the same skill with a removal request; preview that diff before applying it.

## What a finding contains

Every intensity uses the same standard:

- how the issue can be abused
- whether that abuse path can occur in this system, including reachability, preconditions, existing mitigations, and configuration
- if that cannot be decided, the exact missing fact, and the verdict `needs_validation`

`confirmed` means the path was shown and can occur here. `rejected` means it cannot. The readable summary does not add confirmed findings that are absent from the validated JSON.
