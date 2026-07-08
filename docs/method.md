# Duty Loop Method

Duty Loops is a small loop-engineering method for scene-specific AI workers.

It combines prompt engineering, skill design, context engineering, and a thin
control layer. The control layer should only make the loop reliable enough to
run repeatedly; it should not replace the model's judgment with a brittle
workflow engine.

## Core Idea

A Duty Loop is a worker with a recurring responsibility:

- it has a scene, not a universal mission;
- it wakes from schedules, events, or manual requests;
- it reads compact fresh context;
- it compares the context with state and recent runs;
- it decides whether the turn should be quiet, notify, ask, or act;
- it writes back one run record;
- it improves through periodic review.

## The Four Outcomes

- `quiet`: nothing materially changed, or the source is stale.
- `notify`: something changed and the owner should know.
- `ask`: a human decision or approval is required.
- `act`: only a bounded low-risk action already allowed by the blueprint.

Most turns should be `quiet`. A useful loop is not a noisy loop.

## The Contract

Each loop should define:

- role: what worker it is pretending to be;
- triggers: when it wakes;
- context sources: what facts it can inspect;
- material change: what is worth attention;
- notification policy: when to stay quiet or speak;
- human gates: what it must not do without approval;
- writeback: how it records one turn.

## Engineering Boundary

Use code for repeatable mechanics:

- collect current facts;
- normalize data into compact context;
- check source freshness;
- append run logs;
- dedupe notifications;
- enforce obvious safety gates.

Use the model for judgment:

- what changed in the current situation;
- whether the change matters;
- whether a notification would be useful;
- what question to ask a human;
- how to summarize uncertainty.

## Relation To Other Concepts

Prompt engineering gives the worker a task frame.

Skill design gives Codex or Claude reusable operating procedure.

Context engineering gives the worker the right fresh facts and memory.

Loop/control engineering adds wakeup, decision, writeback, review, and gates.

The value is not the phrase. The value is a scene-specific worker that can stay
useful over time without the user babysitting every step.

## Sandbox Feedback

Use `npm run sandbox -- <loop-id>` to validate a blueprint fixture before wiring
real connectors. The sandbox is intentionally conservative and deterministic:
it verifies that compact facts can produce quiet, notify, ask, and gate signals.

It does not replace Codex or Claude. It is a loop-core feedback tool for finding
bad fixture design, noisy gate wording, stale source handling, and missing
material-change coverage.
