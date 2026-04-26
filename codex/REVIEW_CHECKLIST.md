# Review Checklist (QA / Plan Engineer)

Use this checklist before merging any change:

## Plan & Scope
- [ ] Task is small and scoped (no unrelated refactors).
- [ ] `codex/STATUS.md` updated (In Progress → Done).

## API / Contracts
- [ ] `codex/API_CONTRACT.md` updated if endpoints changed.
- [ ] No breaking changes without notice/migration path.

## Security Basics
- [ ] Secrets are not logged or committed.
- [ ] Tokens are never returned to frontend.
- [ ] OAuth state/CSRF is considered (document if deferred).

## Reliability
- [ ] Errors handled (no silent failures).
- [ ] Logging is helpful but not noisy.

## Quality Gates
- [ ] Relevant dev command ran (at least server start, build, or tests).
- [ ] Lint/format not broken (if configured).
