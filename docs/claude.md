# Use Duty Loops With Claude Code

Claude Code can use the stubs under `.claude/skills`. Each stub points back to
the matching Codex skill under `.agents/skills` so the operating method stays in
one place.

## Design A Loop

```text
/duty-loop-designer create a Duty Loop for:
<describe the recurring responsibility>
```

## Run A Loop

```bash
npm run context -- metric-sentinel --slot hourly --trigger manual
```

Then:

```text
/duty-loop-runner run metric-sentinel for slot hourly
```

## Review A Loop

```text
/duty-loop-reviewer review content-pulse
```

## Keep The Boundary Clean

Use this repo for public-safe methods and reusable blueprints. Keep private
connectors, credentials, raw context, and day-to-day operating state in the real
scenario workspace.
