---
name: duty-loop-runner
description: Run one scheduled, event-triggered, or manual turn for an existing Duty Loop. Use when Codex should inspect BLUEPRINT.md and the generated context packet, decide quiet/notify/ask/act, respect human gates, and write back the run; especially inside recurring automations, Claude routines, cron-launched runs, or manual worker checks.
---

# Duty Loop Runner

Run one bounded worker turn. Do not build a new framework during a run.

## Workflow

1. Read `blueprints/<loop-id>/BLUEPRINT.md`.
2. Generate the context packet:

   ```bash
   npm run context -- <loop-id> --slot <slot> --trigger <trigger>
   ```

3. Inspect:
   - role and human gates;
   - current facts and source health;
   - recent runs;
   - memory and open gates.
4. Decide exactly one outcome:
   - `quiet`: no material change or source is stale;
   - `notify`: material change worth attention;
   - `ask`: human decision required;
   - `act`: bounded low-risk action already allowed by `BLUEPRINT.md`.
5. If source data is stale or failed, say so. Do not invent current facts.
6. If a human gate is required, ask one concrete question and do not cross the gate.
7. Write back one row:

   ```bash
   npm run writeback -- <loop-id> --decision <quiet|notify|ask|act> --summary "<short summary>"
   ```

   Add `--material-change`, `--gate "<question>"`, or `--next "<next step>"` when applicable.

## Judgment Guidance

- A changed field is not automatically a material change.
- A material change is not automatically an urgent notification.
- A notification must explain why now is worth attention.
- Prefer quiet over noisy uncertainty.
- Prefer asking a concrete gate over taking an irreversible action.
