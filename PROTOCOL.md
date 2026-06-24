# CS-Scientist Plugin — Communication Protocol v1.1

This document is the authoritative contract for all agents in the plugin.
Before writing or modifying any agent prompt, read this file.
If a behavior conflicts with this document, this document wins.

---

## Agent Registry

Each agent has exactly one responsibility. If it does more than one thing, it is incorrectly designed.

| Agent | Single Responsibility | Writes to disk | Reads from disk |
|-------|-----------------------|---------------|-----------------|
| `cs-scientist` | Routing + session init | `session_state.json`, `goals.md` (init only) | `session_state.json` |
| `cs-scientist-research` | Research loop (phases 1–10) | `session_state.json`, `goals.md`, `activity_log.jsonl`, KB | `session_state.json`, `goals.md`, `activity_log.jsonl` (last 5), KB |
| `cs-scientist-dev` | Dev loop (phases 1–7) | `session_state.json`, `goals.md`, `activity_log.jsonl`, KB | `session_state.json`, `goals.md`, `activity_log.jsonl` (last 5), KB |
| `cs-scientist-critic` | Gate validation | Nothing | Nothing |
| `cs-scientist-consultant` | Domain diagnosis | Nothing | Nothing |
| `cs-scientist-arbiter` | Council synthesis | Nothing | Nothing |

Sub-agents (critic, consultant, arbiter) **never touch disk**.
They receive structured input and return structured output. Period.
Sub-agent outcomes are logged by the mode agent that called them, not by the sub-agent itself.

---

## Session Files

Every session lives in `.cs-scientist/{session_id}/` relative to the project root.
The session contains exactly these files:

| File | Purpose | Append-only |
|------|---------|-------------|
| `session_state.json` | State machine — where the session is right now | No (overwritten) |
| `goals.md` | Goal tracker — what the session is trying to achieve | No (updated) |
| `activity_log.jsonl` | Action history — what each agent did per turn | Yes |
| `knowledge_base.md` | Verified facts accumulator | No (updated) |

---

## session_state.json

The single file that defines where the session is.
Everything else (KB, logs) is content. This is the state machine.

```json
{
  "schema_version": "1.0",
  "session_id": "topic-slug_mode_YYYYMMDD",
  "mode": "research | dev | null",
  "topic": "string",
  "verifier": "string — external truth criterion",

  "phase": "SCOPE | DECOMPOSE | RETRIEVE | TRIANGULATE | PROPOSE | EXPERIMENT | ANALYZE | SYNTHESIZE | CRITIQUE | DOCUMENT | DESIGN | PLAN | IMPLEMENT | VERIFY | ITERATE",
  "phase_status": "active | blocked | completed",

  "gates": {
    "GATE_1":     "pending | pass | fail",
    "GATE_2":     "pending | pass | fail",
    "GATE_3":     "pending | pass | fail",
    "GATE_1_DEV": "pending | pass | fail",
    "GATE_2_DEV": "pending | pass | fail"
  },

  "active_artifact_ref": "path or inline ID of artifact being worked on",
  "next_action": "concrete action, no ambiguity, for the next turn",
  "blocked_reason": "string | null",

  "iteration_count": 0,
  "last_updated": "ISO8601",
  "last_agent": "id of the agent that wrote this",
  "last_agent_summary": "≤1 sentence of what that agent did"
}
```

### Write rules

- Orchestrator writes only on init (creates the file)
- Mode agents write after every phase or gate transition — not before, not mid-phase
- Sub-agents never write this file
- If `next_action` is empty or ambiguous, the file is malformed

---

## goals.md

Tracks what the session is trying to achieve at every level.
Written by the orchestrator on init, updated by mode agents as work progresses.

### Schema

```markdown
# Session Goals

## Primary Goal
{set at init, never modified — the overarching objective of this session}

## Active
- [ ] HIGH | {goal description} | phase: {phase_name}
- [ ] MEDIUM | {goal description} | phase: {phase_name}
- [ ] LOW | {goal description} | phase: {phase_name}

## Completed
- [x] {goal description} | closed_at: {phase_name} | result: {one sentence}

## Blocked
- [!] {goal description} | blocked_by: {reason} | unblocks_when: {condition}
```

### Write rules

- Orchestrator writes the Primary Goal and initial Active goals at init
- Orchestrator may also close or add goals if the user requests it mid-session
- Mode agents add goals when a phase reveals new objectives
- Mode agents move goals from Active → Completed after phase exit with a verified result
- Mode agents move goals from Active → Blocked when a gate returns FAIL and the cause is unresolved
- Priority values are fixed: `HIGH`, `MEDIUM`, `LOW` — no other values
- Primary Goal section is never modified after init

---

## activity_log.jsonl

Append-only log of every significant action. One JSON object per line.
Mode agents read the last 5 entries at the start of every turn to reconstruct what happened in the previous context window.

### Schema (one entry per line)

```json
{
  "ts": "ISO8601",
  "agent": "cs-scientist | cs-scientist-research | cs-scientist-dev",
  "phase": "SCOPE | RETRIEVE | ...",
  "action_type": "phase_enter | phase_complete | gate_dispatch | gate_return | subagent_dispatch | subagent_return | kb_update | goal_update | session_init | session_resume",
  "summary": "≤1 sentence — what happened",
  "result": "outcome or null",
  "iteration": 0
}
```

### Write rules

- Written after every significant action — not every thought, every action
- Significant actions: phase enter, phase complete, gate dispatch, gate return, sub-agent dispatch, sub-agent return, KB update, goal state change
- Sub-agent outcomes are logged by the mode agent that called them, with `action_type: "subagent_return"`
- Never rewrite or delete entries — append only
- `iteration` increments on each full Verified Loop cycle, not on each action

---

## Dispatch and Return Contracts

All inter-agent communication uses this envelope:

```
[DISPATCH → {agent_id}]
---
{payload structured per agent spec below}
---
```

```
[RETURN → {agent_id}]
---
{structured response payload}
---
```

### cs-scientist-critic

**Dispatch payload:**
```
GATE: GATE_1 | GATE_2 | GATE_3 | GATE_1_DEV | GATE_2_DEV | CRITIQUE_LIBRE
ARTIFACT:
{artifact verbatim}
```

**Return payload:**
```
VERDICT: PASS | FAIL | HUMAN_REQUIRED
GATE: {gate_id}
FAILURES:
- {failure 1}
- {failure 2}
HUMAN_QUESTIONS:
- {question if HUMAN_REQUIRED}
PASS_NOTES:
- {caveats if PASS}
```

### cs-scientist-consultant

**Dispatch payload:**
```
DOMAIN: {one sentence}
GATE_DIAGNOSIS: {FAILURES verbatim from Critic return}
FAILED_ARTIFACT:
{artifact verbatim}
```

**Return payload:**
```
ROOT_CAUSE: {specific, not generic}
CORRECTION: {concrete change — which line/section and how}
WHY_APPROACH_FAILED: {domain-specific reason}
```

### cs-scientist-arbiter

**Dispatch payload:**
```
BRIEF: {~800 tokens of shared context}
DEFENDER_A: {structured output from defender agent}
DEFENDER_B: {structured output from defender agent}
DEFENDER_C: {structured output from defender agent}
```

**Return payload:**
```
SYNTHESIS:
- In {situation A}: → Option {X} | {reason ≤1 line}
- In {situation B}: → Option {Y} | {reason ≤1 line}
NOT_RECOMMENDED_IF:
- Option A: {disqualifying condition}
- Option B: {disqualifying condition}
- Option C: {disqualifying condition}
FOR_CURRENT_CONTEXT:
→ {recommended option} | {justification ≤3 lines}
```

---

## Iron Rule — applied in every agent prompt that touches disk

```
FIRST action every turn:
  1. Read session_state.json
  2. Read goals.md
  3. Read last 5 entries of activity_log.jsonl

AFTER every significant action:
  4. Append one entry to activity_log.jsonl

AFTER any phase or gate transition:
  5. Update session_state.json
  6. Update goals.md if goal state changed

If session_state.json does not exist: stop and notify the user — do not improvise state.
If activity_log.jsonl does not exist: create it empty, then proceed.
If goals.md does not exist: stop and notify the user — do not improvise goals.
```

This is not a guideline. It appears as a NEVER block in every mode agent.

---

## Isolation Rule

The value of sub-agents comes from having zero session context.
When dispatching, pass only the structured artifact — never session history, never "for context."
A critic with session context cannot evaluate adversarially.

---

## Gate Failure Routing

Before acting on a gate failure, classify the cause:

```
Does the failure mention methodological terms ("falsifiable", "circular", "verifier")?
→ METHODOLOGICAL → mode agent corrects directly (max 2 attempts, then HUMAN_REQUIRED)

Does the failure mention datasets, algorithms, libraries, domain terminology?
→ DOMAIN → dispatch cs-scientist-consultant before retrying
```

---

## Project Health Check

The orchestrator runs this check **before** asking the user for mode (Research or Dev).
Never skip it. Never run it after the session has started.
The goal is to ensure the project has the files it needs to be maintainable by agents and humans.

### Universal files — any project

| File | Purpose | Action if missing |
|------|---------|-------------------|
| `AGENTS.md` or `CLAUDE.md` | AI agent instructions for this project | Run AGENTS.md questionnaire (see below) |
| `README.md` | What it is, how to run, how to test | Notify user — do not create without their input |
| `.gitignore` | Exclude files from version control | Create base version for detected project type |
| `CHANGELOG.md` | Version history | Create empty with standard header |
| `docs/adr/` | Architecture Decision Records | Propose creating first ADR if architectural decisions are made during session |

### Project-type files

Detect project type from existing files, then check for:

| Type | Required files |
|------|---------------|
| Node / Web | `package.json`, `.env.example` |
| Python | `pyproject.toml` or `requirements.txt`, `.python-version` |
| Container | `Dockerfile`, `docker-compose.yml` |
| CI/CD active | `.github/workflows/` or equivalent |
| ML / Data | `data/README.md`, `MODEL_CARD.md` |

### Rules

- Missing universal files → notify user with a checklist before proceeding
- Missing project-type files → notify, offer to create, do not block the session
- `README.md` is never auto-created — it requires human context
- `AGENTS.md` triggers the questionnaire below — it is the most important file for agents
- ADRs are proposed, never created silently

---

## AGENTS.md Questionnaire

Run when `AGENTS.md` (or `CLAUDE.md`) does not exist.
Ask exactly these 8 questions — no more, no less.
Every line in the resulting file must earn its place. Verbose autogenerated files hurt agent performance.

```
1. What type of project is this?
   (web app / CLI / library / data pipeline / ML / embedded system / other)

2. What language(s) and main frameworks?

3. What architecture pattern does it follow?
   (monolith / microservices / MVC / event-driven / CQRS / no formal architecture)

4. What are the exact commands to: run locally, run tests, deploy?

5. What is the "done" criterion for a task?
   (tests pass / linter clean / review approved / specific metrics)

6. What should an AI agent NEVER do in this project?
   (touch prod / modify migrations / push without review / other)

7. Are there non-obvious architectural decisions an agent must know about?
   (something that looks wrong but has a reason)

8. Are there hard constraints?
   (performance targets, security requirements, compliance, backwards compatibility)
```

From the answers, generate a minimal `AGENTS.md` with these sections only:

```markdown
# AGENTS.md

## Project
{type} — {language/framework} — {architecture pattern}

## Run
{exact commands}

## Done means
{done criterion}

## Never
- {forbidden action 1}
- {forbidden action 2}

## Non-obvious decisions
- {decision}: {reason}

## Hard constraints
- {constraint}
```

Omit any section for which the user had no answer. Do not pad with generic advice.

---

## Schema Version

When this protocol changes in a breaking way, increment `schema_version` in `session_state.json`.
Mode agents must reject state files with a schema version they do not recognize.

Current version: `1.2`
Changes from `1.1`: Added Project Health Check and AGENTS.md Questionnaire sections.
