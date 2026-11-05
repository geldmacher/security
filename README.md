<img src="assets/logo.svg" alt="Security logo" width="72" height="72">

# Security

**Review a change for issues that can be abused in this system.**

Security is a plugin for **Cursor, Codex, and OpenCode 2.1.2**. It gives your agent a short guard for ordinary work and an explicit review when you ask:

- **Quick** looks at the current diff and reports the abuse path and whether it can happen here.
- **Review** follows that diff into the affected modules and reads scanner output when a scanner is already available.
- **Audit** runs a six-phase pass and keeps a finding confirmed only after a separate pass fails to disprove it.

The audit method is the Cloudflare [security-audit skill](https://github.com/cloudflare/security-audit-skill) at commit `c1c8a8c`, vendored under [skills/security/references](skills/security/references/UPSTREAM.txt) with its [MIT license](skills/security/references/LICENSE).

[![Validate](https://github.com/geldmacher/security/actions/workflows/validate.yml/badge.svg)](https://github.com/geldmacher/security/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick start

### 1. Install and activate

Use the [installation request below](#install-from-a-release) or follow the [manual installation steps](docs/installation.md#manual-installation). Complete your app's [activation steps](docs/installation.md#finish-installation): reload Cursor or, after installation is complete in Codex or OpenCode, start a new task or session.

### 2. Choose whether to use the persistent guard

- **Cursor:** the short rule applies automatically. It stays silent unless the change touches a security-sensitive surface.
- **Codex and OpenCode:** the same guard across projects is optional. Plugin installation does not edit global instructions. You can use the skills without this setup.

To preview the Codex setup without changing configuration:

```text
$geldmacher-security:security-guard-setup Show the current status and preview setup of the persistent security guard. Do not change configuration.
```

OpenCode:

```text
@security-guard-setup Show the current status and preview setup of the persistent security guard. Do not change configuration.
```

The preview shows the proposed change. To configure it, approve the displayed patch and request that it be applied, then start a new task or session. See [setup and removal](docs/installation.md#optional-persistent-security-guard).

### 3. Try a quick review

Open a project with code changes and ask:

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

`/security` sends the same request. You get findings tied to this codebase. Files stay unchanged. A finding that still depends on a missing fact is `needs_validation`, not `confirmed`. See [review examples](docs/usage.md#quick-review).

## Recommended everyday use

Give your agent the task you want completed. In Cursor, or once the optional guard is configured, the short rule accompanies ordinary work and stays quiet when the change is not security-sensitive. Call a skill when you want a review.

| Situation | Recommended use |
| --- | --- |
| An ordinary development task | Describe the change as usual. |
| The current diff may be abusable | Ask `security` for a [quick review](docs/usage.md#quick-review). |
| The change crosses a trust boundary and you want the surrounding flow | Ask `security` for a [review](docs/usage.md#review). |
| You want the repository, or a named scope, audited | Ask `security-audit` for an [audit](docs/usage.md#audit). |

The [usage guide](docs/usage.md) has copyable requests for Cursor, Codex, and OpenCode.

## Install from a release

You need Cursor, Codex, or OpenCode 2.1.2 with plugin support, **Node.js 22 or newer**, and access to GitHub. You do not need to clone this repository. OpenCode support is `@opencode/cli` 2.1.2, not the `opencode-ai` 1.x package.

Copy this request into Cursor, Codex, or OpenCode:

```text
Install the latest stable Security release from
https://github.com/geldmacher/security for my current app.
Follow https://github.com/geldmacher/security/blob/main/docs/installation.md,
section "First installation without the skill".
Verify the release before installing and tell me whether a reload or new task is needed.
```

Your agent downloads and verifies the release, installs it for your app, and reports any remaining activation step. For a manual installation, use the [latest stable GitHub Release](https://github.com/geldmacher/security/releases/latest) and follow the [verification and installation procedure](docs/installation.md#manual-installation).

## Update from a release

Use the installed update skill:

**Cursor:**

```text
/install-new-release-from-repo Update Security to the latest stable GitHub Release for Cursor.
```

**Codex:**

```text
$geldmacher-security:install-new-release-from-repo Update Security to the latest stable GitHub Release for Codex.
```

**OpenCode:**

```text
@install-new-release-from-repo Update Security to the latest stable GitHub Release for OpenCode.
```

If the skill is missing, use the installation request above. For manual updates, follow the [replacement and activation steps](docs/installation.md#manual-update). The [installation guide](docs/installation.md) also covers previews and recovery.

## Limits

Security does not ship a sandbox. It does not probe production systems. Scanner commands run only when they are already available or can be started without a global install and without changing the target project. A missing scanner is reported as not checked.

## Learn more

- [Usage and examples](docs/usage.md)
- [Installation, updates, and recovery](docs/installation.md)
- [Contributing and development](https://github.com/geldmacher/security/blob/main/docs/development.md)
- [Changelog](CHANGELOG.md) · [Report an issue](https://github.com/geldmacher/security/issues)

[MIT](LICENSE) · Built by [Dennis Geldmacher](https://github.com/geldmacher)
