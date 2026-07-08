# Role Mapping

Duty Loops maps best to real work where a person repeatedly watches changing
state, judges whether anything matters, and asks before authority-bearing
actions.

## Selection Criteria

A high-value loop usually has:

- changing state from multiple sources;
- incomplete rules and real judgment;
- many quiet turns and occasional useful notifications;
- clear human gates;
- compact facts that can be refreshed by scripts;
- enough recurrence to justify memory and review.

## High-Value Scenarios

| Duty Loop | Real-world role | Why it fits |
| --- | --- | --- |
| [PR Keeper](../blueprints/pr-keeper/BLUEPRINT.md) | engineering lead, reviewer | PR state changes constantly; merge and API decisions are gates. |
| [Repo Steward](../blueprints/repo-steward/BLUEPRINT.md) | open-source maintainer, developer advocate | Issues, discussions, docs, releases, and contributors need ongoing public attention. |
| [Release Captain](../blueprints/release-captain/BLUEPRINT.md) | release manager | Release readiness is cross-source and deadline-sensitive, but publishing is gated. |
| [Dependency Sentinel](../blueprints/dependency-sentinel/BLUEPRINT.md) | security or platform maintainer | Most updates are noise; advisories, licenses, and breaking changes need judgment. |
| [Metric Sentinel](../blueprints/metric-sentinel/BLUEPRINT.md) | product analyst, ops analyst | Metrics need interpretation against releases, baselines, and incidents. |
| [Inbox Triage](../blueprints/inbox-triage/BLUEPRINT.md) | executive assistant | Attention management is recurring, high-volume, and full of response gates. |
| [Meeting Brief](../blueprints/meeting-brief/BLUEPRINT.md) | chief of staff, PM, assistant | Meetings need context, prep gaps, decisions, and follow-up memory. |
| [Customer Success Watch](../blueprints/customer-success-watch/BLUEPRINT.md) | customer success manager | Account health combines usage, support, renewal, sentiment, and commitments. |
| [Content Pulse](../blueprints/content-pulse/BLUEPRINT.md) | content operator | Audience response and publishing cadence need judgment and public-posting gates. |
| [Market Watch](../blueprints/market-watch/BLUEPRINT.md) | market desk assistant | Market state changes frequently; trade execution remains a human gate. |

## Less Suitable

Avoid Duty Loops for:

- deterministic ETL that should be a script;
- high-frequency real-time systems;
- one-shot writing or Q&A tasks;
- workflows where the agent must execute without human approval in a regulated
  or destructive domain;
- broad "do everything" assistants with no concrete scene.

## Design Pattern

Map the real role into the loop contract:

1. role: the real job analogue;
2. triggers: when that role naturally checks the work;
3. context: compact facts the role would inspect;
4. material change: what would make the role speak up;
5. notification policy: what should stay quiet;
6. human gates: where authority remains with the owner;
7. writeback: how the role leaves a durable work note.
