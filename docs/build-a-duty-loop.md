# Build A Duty Loop

This is the recommended path for turning a real recurring responsibility into a
working Duty Loop.

## 1. Pick A Scene

Choose one concrete responsibility:

- "watch my PR queue";
- "watch my market theme during trading hours";
- "watch checkout error rate after releases";
- "watch content comments and draft follow-ups".

Avoid starting with a generic assistant. A Duty Loop should have a job.

## 2. Start From A Blueprint

```bash
npm run list
npm run copy -- market-watch my-market-watch --title "My Market Watch"
```

Use `npm run new` only when none of the included blueprints are close.

## 3. Replace Fixture Context

Edit:

```text
blueprints/<loop-id>/context/latest.json
blueprints/<loop-id>/context/sources.json
```

Keep `latest.json` compact. Store facts, not raw dumps. A good context fact has
an id, a kind, a current state, and a short summary.

## 4. Add Only Narrow Connectors

If automation is needed, add a small connector in the downstream workspace that
writes `context/latest.json`.

Good connector behavior:

- reads one source;
- produces compact facts;
- records source health;
- avoids credentials in committed files;
- can fail clearly without blocking the model from reporting stale context.

## 5. Run One Manual Turn

```bash
npm run context -- <loop-id> --slot manual-check --trigger manual
```

Then ask Codex or Claude to run the loop with the matching skill.

## 6. Run A Sandbox Check

Before wiring a real scheduler, run the fixture through the deterministic
sandbox:

```bash
npm run sandbox -- <loop-id> --slot sandbox-check --trigger sandbox
```

For all blueprints:

```bash
npm run sandbox -- --all --slot sandbox-check --trigger sandbox
```

The sandbox does not replace the model. It checks whether the fixture exercises
quiet, notify, ask, material-change, and human-gate paths.

## 7. Schedule It

Use the host you already trust:

- Codex automation;
- Claude routine;
- cron;
- GitHub Actions;
- Feishu workflow;
- Slack or webhook trigger.

The scheduler should wake the worker. It should not own the judgment.

## 8. Review After Real Runs

```bash
npm run review -- <loop-id>
```

Then ask:

- Was it too noisy?
- Did it stay quiet when something mattered?
- Was context stale or missing?
- Did it ask before the right gates?
- Did we accidentally turn judgment into brittle rules?

Improve the blueprint or connector in small steps.
