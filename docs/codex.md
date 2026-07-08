# Use Duty Loops With Codex

Open this repository in Codex. The skills under `.agents/skills` are the primary
entry points.

## Design A Loop

```text
Use $duty-loop-designer to create a Duty Loop for:
<describe the recurring responsibility>

Keep it lightweight. I only want context, state, logs, notification policy,
human gates, and narrow connector notes.
```

## Run A Loop

```bash
npm run context -- pr-keeper --slot morning --trigger manual
```

Then:

```text
Use $duty-loop-runner for pr-keeper with slot morning.
Read the context packet, decide quiet/notify/ask/act, and write back the run.
```

## Review A Loop

```text
Use $duty-loop-reviewer for market-watch.
Check recent runs for notification noise, stale context, missing gates, and
over-engineering. Suggest the smallest useful improvement.
```

## Automation Pattern

A recurring Codex run should do three things:

1. refresh local context if a connector exists;
2. run `$duty-loop-runner`;
3. let the loop write back one run row.

Keep account tokens, private context, and raw logs in the downstream workspace,
not in this public blueprint library.
