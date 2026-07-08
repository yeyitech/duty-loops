# Blueprint Catalog

Each blueprint is a scene-specific Duty Loop design. It includes a role,
triggers, material-change criteria, notification policy, human gates, starter
context, state, and an empty run log.

## PR Keeper

[Open blueprint](pr-keeper/BLUEPRINT.md)

Use when the worker should watch pull requests, CI, review state, mergeability,
and owner attention. This is a good first loop because it has clear source
facts and clear human gates.

## Repo Steward

[Open blueprint](repo-steward/BLUEPRINT.md)

Use when the worker should watch GitHub repository operations: issues,
discussions, contributor experience, docs first impression, release readiness,
roadmap drift, and community signals. This loop complements PR Keeper by
focusing on maintainer attention and public repo health rather than individual
code-review state.

## Release Captain

[Open blueprint](release-captain/BLUEPRINT.md)

Use when the worker should watch release readiness across milestones, blockers,
CI, package dry-runs, changelog, docs, and public release gates.

## Dependency Sentinel

[Open blueprint](dependency-sentinel/BLUEPRINT.md)

Use when the worker should watch dependency releases, security advisories,
license changes, deprecations, and compatibility risk without creating update
noise.

## Inbox Triage

[Open blueprint](inbox-triage/BLUEPRINT.md)

Use when the worker should watch email, chat, and task inboxes for owner
attention, response drafts, deadlines, and message clusters.

## Meeting Brief

[Open blueprint](meeting-brief/BLUEPRINT.md)

Use when the worker should prepare meeting briefs, detect prep gaps, track
action items, and protect follow-up quality.

## Customer Success Watch

[Open blueprint](customer-success-watch/BLUEPRINT.md)

Use when the worker should watch customer health, usage shifts, support
clusters, renewal timing, and promised follow-ups.

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
