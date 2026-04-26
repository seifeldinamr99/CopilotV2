# Workflow: Using Codex Efficiently

## Golden Rule
Treat Codex like a PR generator: small, scoped patches with a checklist.

## Per Task
1) Update `codex/STATUS.md` (add one “In Progress” item with acceptance criteria).
2) Implement with a tight scope (touch the minimum files).
3) Run the smallest validation command(s) relevant to the change.
4) Update `codex/API_CONTRACT.md` and/or `codex/DB_SCHEMA.md` if contracts or schema changed.
5) Mark the task done in `codex/STATUS.md`.

## Change Requests Template
When prompting Codex, include:
- Goal (1 sentence)
- Definition of done (3–5 bullets)
- Files allowed to change (if you want strict scope)
- How to test

Example:
> “Add endpoint X. DoD: returns JSON Y, errors handled, updates API_CONTRACT, `npm test` passes. Touch only `backend/src/routes/...` and `backend/src/controllers/...`.”
