# Duty Loops

Scene-specific AI workers for Codex and Claude.

Duty Loops is a lightweight kit for turning a recurring responsibility into an
AI worker that can wake up, read fresh context, compare it with memory, decide
whether anything matters, notify or ask when needed, and write back one compact
run record.

It is not an agent runtime, scheduler, dashboard, or workflow engine. Codex,
Claude Code, cron, GitHub Actions, Feishu, Slack, or another host can wake the
worker. Duty Loops keeps the small shared contract that makes the worker useful:
scene design, context packet, state, run log, notification policy, and human
gates.

> Thin control, rich context. Let the model judge the messy parts.

## Why

Many useful agent jobs are not one-shot tasks:

- watch a PR queue and notice real review blockers;
- watch a market theme several times per trading day;
- watch product metrics and explain whether an anomaly matters;
- watch content performance and suggest the next useful move.

These jobs need judgment, memory, freshness checks, quiet runs, notifications,
and human approval boundaries. They usually do not need a large orchestration
platform first.

Duty Loops is a practical loop-engineering starter kit for that middle ground.

## Quick Start

```bash
cd /path/to/duty-loops
npm run doctor
npm run list
npm run context -- pr-keeper --slot morning --trigger manual
```

Then ask Codex:

```text
Use $duty-loop-runner for pr-keeper with slot morning.
Read the context packet, decide quiet/notify/ask/act, and write back the run.
```

Or ask Claude Code:

```text
/duty-loop-runner run pr-keeper for slot morning
```

## Make Your Own

Start from an existing scene:

```bash
npm run copy -- market-watch my-market-watch --title "My Market Watch"
npm run context -- my-market-watch --slot pre-open --trigger manual
```

Or create a new one:

```bash
npm run new -- renewal-watch \
  --title "Renewal Watch" \
  --scenario "Watch renewal risk, customer signals, and owner follow-up gates."
```

Then ask Codex:

```text
Use $duty-loop-designer to refine renewal-watch.
Keep it lightweight: context, state, logs, notification policy, and human gates.
```

## Included Blueprints

- [PR Keeper](blueprints/pr-keeper/BLUEPRINT.md): PR, CI, review, and merge-readiness worker.
- [Market Watch](blueprints/market-watch/BLUEPRINT.md): market theme, portfolio exposure, news, and post-close review worker.
- [Metric Sentinel](blueprints/metric-sentinel/BLUEPRINT.md): product, business, or operations metric worker.
- [Content Pulse](blueprints/content-pulse/BLUEPRINT.md): publishing cadence, audience response, and draft opportunity worker.

See [blueprints/README.md](blueprints/README.md) for the catalog.

## CLI

```bash
npm run doctor
npm run list
npm run new -- <loop-id> --title "<Title>" --scenario "<responsibility>"
npm run copy -- <source-loop-id> <new-loop-id> --title "<Title>"
npm run status -- <loop-id>
npm run context -- <loop-id> --slot <slot> --trigger <trigger>
npm run writeback -- <loop-id> --decision quiet --summary "No material change"
npm run review -- <loop-id>
```

## Shape

```text
blueprints/<loop-id>/
  BLUEPRINT.md
  context/
    sources.json
    latest.json
  state/
    state.json
  logs/
    runs.jsonl
```

Connectors should write compact facts into `context/latest.json`. Keep secrets
in `.env` or the host scheduler. Keep raw logs, account data, customer data, and
private operating state in the downstream scenario workspace.

## Method

Duty Loops uses a small control loop:

1. wake from a schedule, event, or manual request;
2. collect compact current facts;
3. load the blueprint, state, and recent runs;
4. decide `quiet`, `notify`, `ask`, or `act`;
5. respect human gates;
6. write back exactly one run row;
7. review the loop periodically for noise, stale context, and missing gates.

Read [docs/method.md](docs/method.md) for the design method and
[docs/build-a-duty-loop.md](docs/build-a-duty-loop.md) for the build path.

## Codex And Claude

Codex skills live in [.agents/skills](.agents/skills). Claude Code stubs live in
[.claude/skills](.claude/skills) and point to the same source of truth.

- `$duty-loop-designer`: design or refine a scene-specific loop.
- `$duty-loop-runner`: run one bounded worker turn.
- `$duty-loop-reviewer`: review noise, stale context, gates, and over-engineering.

See [docs/codex.md](docs/codex.md) and [docs/claude.md](docs/claude.md).

## Project

- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [License](LICENSE)

## Maintenance Model

Keep this repo independent from concrete workspaces.

Duty Loops is the upstream methodology and public-safe blueprint library. A real
workspace, such as a personal money, trading, content, or operations project,
should copy or reference a blueprint, then keep private state, credentials, raw
logs, account data, and connector scripts in that workspace.

Generally useful improvements can be generalized back here. Do not make this
repo depend on any one downstream workspace.

## What To Engineer

Engineer only hard, repeatable pieces:

- context collection and normalization;
- state and log writeback;
- notification idempotency and rate limiting;
- connector health;
- human gate checks;
- dashboard reads.

Leave semantic judgment to Codex or Claude whenever context is ambiguous, rules
are incomplete, or a human-readable tradeoff matters.
