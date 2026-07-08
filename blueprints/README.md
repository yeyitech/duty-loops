# Blueprint Catalog

Each blueprint is a scene-specific Duty Loop design. It includes a role,
triggers, material-change criteria, notification policy, human gates, starter
context, state, and an empty run log.

## PR Keeper

[Open blueprint](pr-keeper/BLUEPRINT.md)

Use when the worker should watch pull requests, CI, review state, mergeability,
and owner attention. This is a good first loop because it has clear source
facts and clear human gates.

## Market Watch

[Open blueprint](market-watch/BLUEPRINT.md)

Use when the worker should watch a market theme, portfolio exposure, news flow,
and intraday/post-close signals. This blueprint is designed for decision
support, not trading automation.

## Metric Sentinel

[Open blueprint](metric-sentinel/BLUEPRINT.md)

Use when the worker should watch metrics, source freshness, releases, incidents,
and likely causes. This is useful for teams that want an analyst-style on-call
loop instead of a threshold bot.

## Content Pulse

[Open blueprint](content-pulse/BLUEPRINT.md)

Use when the worker should watch publishing plans, audience response, comments,
drafts, and follow-up opportunities. Drafting is allowed; publishing remains a
human gate.

## Add A Blueprint

A good contribution should be:

- scene-specific, not a generic assistant;
- runnable with fixture context;
- public-safe, with no private account data or raw logs;
- clear about human gates;
- quiet by default;
- useful for Codex and Claude users without a custom runtime.
