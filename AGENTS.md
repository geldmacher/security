# Security repository instructions

OpenCode configuration and commands are shared. Change or remove only this plugin's entries. Preserve unrelated settings, skill paths, and commands. Keep `opencode.jsonc` untouched. If an existing command's ownership is unclear, stop before overwriting it and leave it in place on uninstall. See [OpenCode installation](docs/installation.md#opencode) for recovery and validation.

The optional OpenCode security guard edits only a marked block in `~/.config/opencode/AGENTS.md`. It does not change `opencode.json`.

Deploy and release work for this repository follows `.agents/skills/deploy-local-plugin/SKILL.md`, `.agents/skills/release-plugin/SKILL.md`, and `docs/installation.md`.
