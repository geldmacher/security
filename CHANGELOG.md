# Changelog

All notable changes to this project are documented in this file.

## Unreleased

## 0.1.0 - 2026-11-05

### Added

- Initial Security plugin for Cursor, Codex, and OpenCode 2.1.2.
- An always-on guard that stays silent unless the change touches a security-sensitive surface, plus optional Codex and OpenCode setup that previews a patch before editing global instructions.
- The `security` skill with quick, review, and audit intensities. Audit follows the vendored Cloudflare six-phase method and keeps a finding confirmed only after an adversarial pass.
- Report validation that checks `findings.json` against the vendored schema and the abuse-path / reachability standard.
