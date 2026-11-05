---
name: security-guard-setup
description: Check, preview, configure, or remove Security's persistent guard in OpenCode's global AGENTS.md. Use for lasting preferences, not a one-off review. Does not edit opencode.json.
---

# Security Guard Setup

Read [the canonical security guard](references/security-guard.md). Use this skill only for persistent OpenCode guidance. Cursor loads the equivalent rule directly. Codex uses its own setup skill. A one-off security question does not need this setup. Status and preview requests are read-only.

OpenCode config (opencode.json, commands/) is shared with Workflow and Design: merge only, touch only your own entries, never write backups; uninstall removes only your own entries; rollback means installing an older GitHub release. This setup does not modify `opencode.json`, `opencode.jsonc`, or command files.

## Resolve the files

Use `~/.config/opencode` when `OPENCODE_CONFIG_DIR` is unset and `XDG_CONFIG_HOME` is unset or points at `~/.config`. If either variable would select a different directory, stop and report that this setup only edits the standard config directory. Do not create a second config location.

The active file is `AGENTS.md` in that directory. Read the complete file before proposing a change and preserve all existing content. An absent file is a valid first-installation state; create it only as part of an approved patch.

For status, preview, installation, or update, read `opencode.json` only. Select the skills entry that resolves to `<config>/geldmacher-security/skills`. Require that package directory to be an absolute stable install: `.opencode-plugin/plugin.json` names `geldmacher-security`, and `skills/security-guard-setup/references/security-guard.md` matches this skill's bundled guard. Reject `.build` output, versioned caches, temporary directories, development checkouts, and ambiguous or conflicting entries. If that stable source is unavailable, report the missing prerequisite and make no configuration change.

Compare the package version and guard text with this skill. If they differ, report a stale or mismatched installation and make no change. Do not reinstall the plugin as part of setup.

OpenCode does not treat a file inside the package as a global instruction. The setup adds an explicit read instruction to the global `AGENTS.md`.

## Manage the reference

Manage exactly one block delimited by these markers:

```text
<!-- geldmacher-security:security-guard:start -->
<!-- geldmacher-security:security-guard:end -->
```

Between the markers, write one sentence: `Before your first user-facing response in each task, read and follow` followed by an absolute Markdown link labelled `Security guard`, then a period. The link targets the verified package's `skills/security-guard-setup/references/security-guard.md`; enclose the absolute path in angle brackets and URI-encode characters that would break Markdown. Do not inline the guard. This is one read per task, not per response.

- With neither marker present and no equivalent unmarked guidance, append a new block for an approved installation.
- With one correctly ordered marker pair, replace only its contents. An unchanged generated reference is a no-op, with no file write or new approval request.
- If a marker is unpaired, duplicated, malformed, the managed body has user changes, or equivalent unmarked guidance already exists, stop and explain the conflict. Preserve all user changes.
- For status, distinguish absent configuration, an intact reference, a missing or changed target, and a conflict. A reference to a missing target is broken, not active guidance.
- Removal deletes only the marked block. A recognized generated reference can be removed even when its target is missing. Removal with no block is a no-op. Unknown or modified block contents still require the user to resolve the conflict.

Before installing, updating, or removing the block, show the exact diff and wait for explicit user approval unless that exact change has already been approved in the current assignment. Plugin installation does not authorize this global edit. Immediately before applying the approved patch, re-read the file; if it changed, prepare a fresh diff instead of overwriting concurrent edits. Apply only that patch, re-read the complete file, and verify the reference and preservation of unrelated content. Do not rewrite or normalize surrounding content. Do not write a backup copy.

The reference follows plugin updates at the same stable package path without another global edit. It remains configured until removed. Explain this when proposing installation.

Tell the user to start a new OpenCode session after a successful change. A no-op needs no new session solely for this setup. Report verified file configuration separately from observed behavior.
