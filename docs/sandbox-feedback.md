# Sandbox Feedback

This report records the first sandbox pass across the initial high-value Duty
Loops. It uses public-safe fixture context only.

## Command

```bash
npm run sandbox -- --all --slot sandbox-check --trigger sandbox
```

## Scenario Set

| Loop | Real role | Sandbox decision | Signals | Gate |
| --- | --- | --- | ---: | --- |
| content-pulse | content operator | ask | 2 | yes |
| customer-success-watch | customer success manager | ask | 3 | yes |
| dependency-sentinel | security/platform maintainer | ask | 2 | yes |
| inbox-triage | executive assistant | ask | 2 | yes |
| market-watch | market desk assistant | quiet | 0 | no |
| meeting-brief | chief-of-staff meeting operator | ask | 2 | yes |
| metric-sentinel | product/ops analyst | notify | 1 | no |
| pr-keeper | engineering reviewer | ask | 2 | yes |
| release-captain | release manager | ask | 3 | yes |
| repo-steward | open-source maintainer | ask | 4 | yes |

Decision distribution:

```json
{
  "ask": 8,
  "notify": 1,
  "quiet": 1
}
```

## Feedback Into Loop Core

The first sandbox run produced too many `ask` decisions because the gate
heuristic treated domain words such as `release`, `security`, `customer`, and
`risk` as authority-bearing by themselves.

The core was updated so gate detection now requires action semantics such as:

- owner or maintainer approval;
- sending, posting, publishing, replying publicly;
- merge, release publish, trade, rollback, credential use;
- customer outreach, public commitment, official position;
- security-sensitive, license, governance, or production actions.

Material-change detection was also tightened so low-risk facts do not become
material only because the word `risk` appears in a field or summary.

## Product Findings

- The `sandbox` command is useful as a fixture validator. It does not replace
  Codex or Claude judgment, but it catches contract and fixture issues quickly.
- High-value real-world scenarios often contain human gates. That is good, but
  fixture suites should eventually include at least one quiet, one notify, and
  one ask packet per blueprint.
- Context facts need explicit `state` values. The sandbox can infer from prose,
  but clear states produce better diagnostics.
- Gate wording should be action-specific. `security advisory exists` is a
  signal; `publish security response` is a gate.
- The loop core should stay thin. The useful core addition was not a workflow
  engine; it was a deterministic sandbox check around the existing context
  contract.

## Next Improvements

- Add optional `fixtures/quiet.json`, `fixtures/notify.json`, and
  `fixtures/ask.json` per blueprint.
- Add expected sandbox outcomes so CI can detect when a blueprint fixture no
  longer exercises the intended path.
- Add connector examples for GitHub repo operations and dependency advisories.
- Add notification dedupe keys to sandbox output.
