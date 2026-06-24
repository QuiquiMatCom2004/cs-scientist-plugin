# CS-Scientist Plugin — Communication Protocol v1.0

This document is the authoritative contract for all agents in the plugin.
Before writing or modifying any agent prompt, read this file.
If a behavior conflicts with this document, this document wins.

---

## Agent Registry

Each agent has exactly one responsibility. If it does more than one thing, it is incorrectly designed.

| Agent | Single Responsibility | Writes to disk | Reads from disk |
|-------|-----------------------|---------------|-----------------|
| `cs-scientist` | Routing + session init | `session_state.json` (init only) | `session_state.json` |
| `cs-scientist-research` | Research loop (phases 1–10) | `session_state.json`, KB, logs | `session_state.json`, KB |
| `cs-scientist-dev` | Dev loop (phases 1–7) | `session_state.json`, KB, logs | `session_state.json`, KB |
| `cs-scientist-critic` | Gate validation | Nothing | Nothing |
| `cs-scientist-consultant` | Domain diagnosis | Nothing | Nothing |
| `cs-scientist-arbiter` | Council synthesis | Nothing | Nothing |

Sub-agents (critic, consultant, arbiter) **never touch disk**.
They receive structured input and return structured output. Period.

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
FIRST action every turn: read session_state.json.
LAST action after any phase or gate transition: write session_state.json.
If session_state.json does not exist: stop and notify the user — do not improvise state.
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

## Schema Version

When this protocol changes in a breaking way, increment `schema_version` in `session_state.json`.
Mode agents must reject state files with a schema version they do not recognize.
