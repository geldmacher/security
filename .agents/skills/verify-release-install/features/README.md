# Release installation features

| Feature | Drive | Expected observation |
| --- | --- | --- |
| [First installation](first-install.md) | Packaged CLI, local assets, empty isolated homes | Correct source and controlled Codex cache; preview leaves homes unchanged |
| [Update](update.md) | Older release to current working target; identical repeat | New bytes and current release evidence; no backup directory; repeat is a no-op |
| [Failure and rollback](rollback.md) | Codex driver fails after materializing an update; Cursor then installs the older release | New source stays, marketplace bytes come back from memory, and rollback is that older install |

The single driver exercises these features. These checks complement the existing release, target, policy and link suites; they do not replace real host activation evidence.
