# cs-scientist-plugin

A multi-agent system for rigorous research and development, built on the **Verified Loop** methodology. Works with both [opencode](https://opencode.ai) and [Claude Code](https://claude.ai/code).

## What it installs

| Agent | Role |
|-------|------|
| `cs-scientist` | Orchestrator. Runs the full Verified Loop across 10 research phases or 7 dev phases. |
| `cs-scientist-critic` | Adversarial gate validator. Evaluates artifacts with zero session context. |
| `cs-scientist-consultant` | Domain expert. Diagnoses gate failures caused by domain knowledge gaps. |
| `cs-scientist-arbiter` | Impartial arbiter. Produces situational matrix when ≥3 valid options exist. |
| `writer` | Implementation agent with full write permissions. |
| `planner` | Planning agent, read-only. |

## Install

```bash
npm install -g cs-scientist-plugin
```

The installer auto-detects opencode (`~/.config/opencode/`) and Claude Code (`~/.claude/`) and prompts before copying agents.

**Manual install for a specific tool:**

```bash
npx cs-scientist-plugin --opencode   # opencode only
npx cs-scientist-plugin --claude     # Claude Code only
```

## The Verified Loop

```
1. PROPOSE  → Generate hypothesis / solution / design
     ↓
2. CRITIQUE → Adversarial review (cs-scientist-critic, zero session context)
     ↓
3. VERIFY   → External verifier (experiment / tests / 3 independent sources)
     ↓
4. PERSIST  → Result → Knowledge Base (survives context limits)
     ↓
5. ITERATE  → Next proposal informed by KB
```

**Core rule:** The model proposes and reasons. An external verifier decides truth.

## Gates

Critical phase transitions are guarded by gates. The agent that produced the artifact (X) never validates its own work — a fresh agent (Y) with zero session context evaluates adversarially.

| Gate | Transition | Criterion |
|------|-----------|-----------|
| GATE 1 | Research Scope | Falsifiable external truth criterion defined |
| GATE 2 | Triangulate | ≥3 independent sources per claim |
| GATE 3 | Propose | Hypothesis falsifiable, non-circular, evidence-anchored |
| GATE 1-DEV | Dev Scope | External binary verifier defined |
| GATE 2-DEV | Dev Design | Design implementable without ambiguity |

## Usage

### opencode

Select `cs-scientist` from the agent switcher (Tab). The agent will guide you through mode selection (Research or Dev) and run the full loop.

### Claude Code

The same agents are available in `~/.claude/agents/`. Activate with `@cs-scientist` in any conversation.

## Sub-agent Dispatch Protocol

When a gate or critical phase requires a fresh perspective, cs-scientist produces a `[DISPATCH → agent-name]` block and pauses. Switch to the named agent, paste the prompt, and return the output.

```
[DISPATCH → cs-scientist-critic]
Switch to cs-scientist-critic and paste this prompt unchanged:

---
GATE: GATE_2
ARTIFACT:
[artifact]
---

Return here with the full output.
```

## License

MIT
