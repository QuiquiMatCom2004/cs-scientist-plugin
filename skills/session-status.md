---
description: >-
  Shows the current state of an active cs-scientist session. Reads
  session_state.json, goals.md, and the last 5 entries of activity_log.jsonl
  to produce a human-readable status report. Essential after context
  compaction or when returning to a session after a break.
---

# session-status

## Input

```
$ARGUMENTS — session directory path, OR empty to scan .cs-scientist/ in current project
```

If $ARGUMENTS is empty:
1. Run `git rev-parse --show-toplevel 2>/dev/null || pwd` to find project root
2. List all sessions in `{project_root}/.cs-scientist/`
3. If multiple: ask which one. If one: use it. If none: report no active session.

## What you read

- `session_state.json` — current phase, gate status, next action
- `goals.md` — goal progress
- `activity_log.jsonl` — last 5 entries (what happened recently)

## Output format

```
SESSION STATUS
──────────────────────────────────────────────
Session:  {session_id}
Mode:     {research | dev}
Topic:    {topic}
──────────────────────────────────────────────

PHASE
  Current:  {phase} ({phase_status})
  Blocked:  {blocked_reason or "—"}

GATES
  GATE_1:      {pending | pass | fail}
  GATE_2:      {pending | pass | fail}
  GATE_3:      {pending | pass | fail}    ← research only
  GATE_1_DEV:  {pending | pass | fail}    ← dev only
  GATE_2_DEV:  {pending | pass | fail}    ← dev only

GOALS
  Active ({N}):
    ● HIGH   {goal description}
    ○ MEDIUM {goal description}
  Completed ({N}): {last completed goal | "—"}
  Blocked ({N}):   {blocked goal | "—"}

RECENT ACTIVITY (last 5 actions)
  {ts short} [{agent}] {summary}
  {ts short} [{agent}] {summary}
  ...

NEXT ACTION
  {next_action from session_state.json}

──────────────────────────────────────────────
Switch to cs-scientist-{research|dev} and paste:
SESSION: {full path to session_state.json}
TOPIC: {topic}
NEXT_ACTION: {next_action}
──────────────────────────────────────────────
```

The last block (the ready-to-paste dispatch input) makes resuming a session after compaction
a single copy-paste operation.

## NEVER

- NEVER modify any session file — read only
- NEVER infer state — only report what is in the files
- NEVER omit the ready-to-paste block — it is the primary value of this skill after compaction
