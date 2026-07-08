---
name: duty-loop-designer
description: Design a lightweight scene-specific Duty Loop from a user's goal. Use when Codex should help create or refine BLUEPRINT.md, context sources, notification policy, human gates, and minimal scripts for a recurring, scheduled, event-triggered, or autonomous AI worker that stays on duty instead of answering once.
---

# Duty Loop Designer

Create a Duty Loop that gives Codex or Claude enough context and boundaries to work long-term without a heavy runtime.

## Principles

- Keep control thin and context rich.
- Prefer `BLUEPRINT.md`, context packets, append-only logs, and explicit gates over a large state machine.
- Do not encode every semantic judgment as rules. Let the model judge ambiguous situations from good context.
- Engineer only hard pieces: data collection, writeback, dedupe, notification channels, connector health, and human gates.
- Keep credentials, private tokens, raw transcripts, and local secrets out of blueprint files.
- Keep this repo independent from downstream workspaces. Put private state, account data, raw logs, and connector scripts in the scenario repo; generalize only reusable patterns back here.

## Workflow

1. Identify the scene, worker role, trigger types, and target user.
2. Ask at most three missing questions. If enough is known, proceed with reasonable defaults.
3. Create the blueprint with:

   ```bash
   npm run new -- <loop-id> --title "<Title>" --scenario "<one-sentence responsibility>"
   ```

4. Edit `blueprints/<loop-id>/BLUEPRINT.md` so it defines:
   - role;
   - triggers;
   - context sources;
   - material-change criteria;
   - notification policy;
   - human gates;
   - writeback command.
5. Add compact starter facts to `context/latest.json` only when useful.
6. Leave connector implementation as a narrow script or future todo unless the user asks to wire the account now.
7. If adapting a real workspace, keep the workspace as the private operating home and keep the blueprint as public-safe reusable design.

## Design Checklist

- The worker can explain why it woke up.
- The worker can compare current facts with memory/recent runs.
- The worker knows when to stay quiet.
- The worker knows when to notify and why the notification is worth attention.
- The worker asks before external, financial, destructive, production, credential, or publication actions.
- The worker writes back one run row every turn.
- The blueprint can be scheduled by Codex Automations, Claude Routines, cron, Feishu, GitHub Actions, or another host without changing the blueprint contract.
