# Roadmap

Duty Loops should stay small. The goal is not to become a general agent
platform; the goal is to help users build reliable scene-specific workers with
Codex and Claude.

## v0.1

- public-safe method and README;
- Codex and Claude skills;
- lightweight CLI for context, writeback, status, review, and copying blueprints;
- four runnable fixture blueprints.

## Next

- add one real connector example that writes compact context without credentials;
- add a notification adapter example with dedupe keys;
- add a scheduler example for cron or GitHub Actions;
- add two more high-value scenes, such as inbox triage and renewal/customer follow-up;
- add a small validation command for blueprint structure.

## Not Planned

- model hosting;
- a full workflow engine;
- account credential custody;
- trading or financial execution;
- replacing Codex or Claude's own agent loop;
- dashboards before the file contract is proven useful.
