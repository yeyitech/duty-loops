# Contributing

Duty Loops welcomes small, practical contributions that make scene-specific AI
workers easier to design, run, or review.

## Good Contributions

- a new scene blueprint with fixture context;
- a clearer method or quickstart note;
- a narrow CLI improvement that keeps the project lightweight;
- a connector pattern that stores no credentials and writes compact facts;
- a safety or notification improvement that generalizes across scenes.

## Keep It Public-Safe

Do not commit:

- credentials or tokens;
- private account data;
- customer data;
- internal meeting notes;
- raw logs or transcripts;
- local absolute paths;
- screenshots or examples that reveal private operating context.

Use downstream scenario workspaces for private state and real connectors.

## Blueprint Standard

A blueprint should define:

- role;
- triggers;
- context sources;
- material-change criteria;
- notification policy;
- human gates;
- writeback command.

It should be quiet by default and runnable with fixture context.

## Validation

Before proposing a change, run:

```bash
npm run doctor
npm run list
npm run context -- pr-keeper --slot check --trigger manual
npm run review -- pr-keeper
```

If you update skills, validate them with the relevant skill validator in your
agent environment.
