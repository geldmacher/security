# Security for OpenCode

**Review changes for issues that can be abused in this system.**

Security reviews a diff, the affected code, or a repository in OpenCode 2.1.2. Quick is the default. It says when reachability is still unknown instead of promoting that finding.

This package targets [OpenCode 2.1.2](https://opencode.ai/changelog) only (`npm` package `@opencode/cli`). The `opencode-ai` package remains OpenCode 1.x and is not supported. Skill discovery follows the [OpenCode 2.1 skills guide](https://opencode.ai/v2/docs/skills/). Slash commands follow the [commands guide](https://opencode.ai/v2/docs/commands/).

OpenCode configuration and commands are shared. Merge only this plugin's entries and preserve all unrelated settings, skill paths, and commands. Keep originals in memory for recovery within the same run. Uninstall removes only this plugin's entries and package. Roll back by installing an older GitHub release.

## Install or update from a release

Use the [latest stable GitHub Release](https://github.com/geldmacher/security/releases/latest). You need Node.js 22 or newer for the release helper.

**Manually:** download `geldmacher-security-opencode-<tag>.zip`, `SHA256SUMS`, and `provenance.json` from the same release, then follow [manual installation](../../docs/installation.md#manual-installation) or [manual update](../../docs/installation.md#manual-update).

**With your agent:** paste this into OpenCode:

> Install the latest stable Security release from https://github.com/geldmacher/security for OpenCode. Follow https://github.com/geldmacher/security/blob/main/docs/installation.md, section "First installation without the skill". Verify the release before installing.

**Update with your agent:**

> @security-install-release Update Security to the latest stable GitHub Release for OpenCode.

`/security-install-release` sends the same request. Start a new OpenCode session after installation. The [installation guide](../../docs/installation.md) covers recovery.

## How skills are selected

OpenCode lists each skill that has a description. Model auto-invocation stays enabled: these skills do not set `opencode/autoinvoke` or `disable-model-invocation`. You can also select one yourself:

- Type `@security` to load that skill by id. The default intensity is quick.
- Type `/security` to run the matching command, which loads the same skill.
- Type `@security-audit` or `/security-audit` for the full six-phase audit.

The same pair works for `security-install-release` and `security-guard-setup`.

Try a quick review:

> @security Review my current changes for issues that can be abused in this system.

Files stay unchanged until you ask for a specific fix. See [usage examples](../../docs/usage.md).

This package does not install a global instruction file by itself. `@security-guard-setup` can preview a patch for `~/.config/opencode/AGENTS.md`. It does not edit `opencode.json`. Cursor's always-applied rule is not copied into this package.
