---
name: duty-loop-reviewer
description: Review a Duty Loop's recent runs for usefulness, notification noise, stale context, missing gates, and over-engineering. Use when Codex should inspect BLUEPRINT.md, state, and logs to suggest small improvements to a long-lived AI worker without turning it into a heavy workflow system.
---

# Duty Loop Reviewer

Review whether a Duty Loop is still useful, quiet, and safe.

## Workflow

1. Read `blueprints/<loop-id>/BLUEPRINT.md`.
2. Run:

   ```bash
   npm run review -- <loop-id>
   npm run status -- <loop-id>
   ```

3. Inspect recent `quiet`, `notify`, `ask`, and `act` decisions.
4. Look for:
   - repeated noisy notifications;
   - quiet runs that should have noticed material change;
   - stale or missing context sources;
   - human gates that are too broad or missing;
   - business judgment hard-coded into brittle rules;
   - scripts that should stay scripts versus model judgment that should stay flexible.
5. Suggest the smallest useful change.

## Output

Return:

- current loop health;
- one or two high-impact improvements;
- whether the issue is context, policy, connector, notification, or gate design;
- a concrete patch plan only if the user asks you to edit files.
