# Finding standard

Every finding, at every intensity, includes both of these:

1. **Abuse path.** How the issue can be abused: who can do it, what they do, and what security outcome that produces.
2. **Reachability in this system.** Whether that abuse path can actually occur here. Cover how a person reaches it, the preconditions, the mitigations that already exist, and the configuration that matters.

If the code, configuration, or runtime facts are not enough to decide reachability, name the missing fact exactly. Until that fact is known, the finding stays potentially exploitable. The verdict is `needs_validation`. Do not reject it for lack of evidence, and do not call it `confirmed`.

## Verdicts

- `confirmed` — the abuse path is shown, and it can occur in this system.
- `needs_validation` — the abuse path is concrete, and reachability is not established. The record names the missing fact. It has no severity.
- `rejected` — the abuse path cannot occur in this system. The record says which precondition, mitigation, or configuration blocks it.

Never round `needs_validation` up to `confirmed`. A scanner hit, a missing best practice, or a guessed deployment setting is not `confirmed`.

## Report text

In `findings.json`, put both parts in `description`, using these lines:

```text
Abuse path: <how it is abused>
Reachability: reachable — <why it can occur here>
Reachability: not_reachable — <what blocks it>
Reachability: insufficient — <the exact missing fact>
```

Use one Reachability line. `confirmed` uses `reachable`. `rejected` uses `not_reachable`. `needs_validation` uses `insufficient`. `scripts/validate-report.mjs` rejects any other pairing, and it rejects JSON that does not satisfy `report-schema.json`. The readable summary must use the same verdicts and must not add a confirmed finding that is absent from the JSON.
