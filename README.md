# cs-scientist-plugin

[![npm version](https://img.shields.io/npm/v/cs-scientist-plugin.svg)](https://www.npmjs.com/package/cs-scientist-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude_Code-supported-blueviolet.svg)](https://claude.ai/code)
[![opencode](https://img.shields.io/badge/opencode-supported-blueviolet.svg)](https://opencode.ai)

A multi-agent system for rigorous research, development, and teaching — built for [opencode](https://opencode.ai) and [Claude Code](https://claude.ai/code).

The core principle is borrowed from DeepMind's most reliable systems (AlphaFold, AlphaProof, FunSearch):

> **The model proposes. An external verifier decides.**

No self-assessed output advances to the next phase. Every gate is evaluated by a fresh agent with zero session context.

---

## How it works

```
┌─────────────────────────────────────────────────────────┐
│                    cs-scientist                         │
│                   (Orchestrator)                        │
│         health check → session init → dispatch          │
└───────────┬──────────────┬──────────────┬──────────────┘
            │              │              │
     RESEARCH            DEV           TEACH
    10 phases           7 phases       7 phases
        │                  │              │
   GATE_1,2,3        GATE_1,2          GATE_1,2,3
        │                  │              │
        └──────────────────┴──────────────┘
                           │
               ┌───────────▼───────────┐
               │   cs-scientist-critic  │
               │  (zero session context │
               │   zero disk access)    │
               │   PASS / FAIL /        │
               │   HUMAN_REQUIRED       │
               └───────────────────────┘
```

On `FAIL` → mode agent corrects (max 2 attempts), then `HUMAN_REQUIRED`.
On domain-specific failure → `cs-scientist-consultant` resolves, then retry.

---

## Example: Critic rejecting a research hypothesis

```
[DISPATCH → cs-scientist-critic]
GATE: GATE_3
ARTIFACT:
  HYPOTHESIS: Transformers outperform RNNs on sequential tasks
  VERIFIER: Run both on Penn Treebank and compare perplexity
  EVIDENCE: [FACT] transformers scale better, [FACT] attention is O(n²)
---

[cs-scientist-critic → RETURN]
VERDICT: FAIL
FAILURES:
  - HYPOTHESIS is not falsifiable as stated: "outperform" has no threshold.
    A result of 0.1 perplexity difference would technically satisfy it.
    Rewrite: "Transformer achieves ≥5% lower perplexity on PTB vs best LSTM baseline."
  - EVIDENCE cites [FACT] but neither fact directly supports the hypothesis.
    [FACT] "transformers scale better" does not imply they outperform on PTB specifically.
NEXT: Mode agent must rewrite hypothesis and re-submit to GATE_3.
```

The critic has **zero session context** — it cannot be talked out of a FAIL by prior conversation. Only the artifact matters.

---

## What it does

Three operating modes, each a structured loop with adversarial gates:

| Mode | Purpose | External verifier |
|------|---------|------------------|
| **RESEARCH** | Investigate a topic: hypothesis, sources, triangulation, report | Reproducible experiment or ≥3 independent sources |
| **DEV** | Build something with correctness guarantees: TDD, verified design, traced decisions | Compiler / type checker / tests (formality hierarchy enforced) |
| **TEACH** | Learn or teach from provided source materials: progressive explanation, tiered exercises | Student can solve Tier 3 exercises that recall alone cannot answer |

---

## Agents

| Agent | Role |
|-------|------|
| `cs-scientist` | Orchestrator — routes to modes, runs project health check, initializes session |
| `cs-scientist-research` | Research loop — 10 phases: SCOPE → DECOMPOSE → RETRIEVE → TRIANGULATE → PROPOSE → EXPERIMENT → ANALYZE → SYNTHESIZE → CRITIQUE → DOCUMENT |
| `cs-scientist-dev` | Dev loop — 7 phases: SCOPE → DESIGN → PLAN → IMPLEMENT → VERIFY → ITERATE → DOCUMENT |
| `cs-scientist-teach` | Teaching loop — 7 phases: INTAKE → MAP → SCAFFOLD → EXPLAIN → VERIFY → ITERATE → DOCUMENT |
| `cs-scientist-critic` | Adversarial gate validator — zero session context, structured PASS/FAIL/HUMAN_REQUIRED |
| `cs-scientist-consultant` | Domain expert for gate failures caused by missing domain knowledge |
| `cs-scientist-arbiter` | Council of State synthesis — evaluates 3+ competing options situationally |

Sub-agents (critic, consultant, arbiter) **never touch disk**. They receive a structured artifact and return a structured verdict.

---

## Skills

| Skill | When to use |
|-------|-------------|
| `deep-research` | Directed research on a single question with KB-compatible output |
| `parallel-research` | Independent multi-angle searches with no cross-contamination |
| `kb-validate` | Validate KB integrity before a gate: tag consistency, source completeness, circular refs |
| `session-status` | Human-readable session state + ready-to-paste resume block after context compaction |
| `negative-results` | Document what didn't work and why: gate failures, refuted hypotheses, discarded approaches |
| `notebooklm` | Convert a completed research report to podcast script, FAQ, or executive briefing |
| `writing-plans` | Ultra-detailed TDD implementation plans — actual code in every step, no placeholders |
| `project-onboarding` | Generate a Day 1 guide for a new team member from the current repo state |
| `concept-explainer` | Explain a concept at 3 levels (accessible / practitioner / researcher) without starting a session |
| `paper-outline` | Map a research session KB to an academic paper skeleton |
| `lesson-plan` | Generate a structured lesson plan for class preparation |

---

## Install

```bash
npm install -g cs-scientist-plugin
cs-scientist-plugin
```

The first command installs the package. The second copies agents and skills into your tool — it detects opencode and Claude Code automatically and asks before writing anything.

> **Note:** npm blocks postinstall scripts by default since npm v10. Running `cs-scientist-plugin` after install is required.

**Clone and install manually:**

```bash
git clone https://github.com/QuiquiMatCom2004/cs-scientist-plugin.git
cd cs-scientist-plugin
node bin/install.js
```

**Options:**

```
node bin/install.js              # interactive — asks per platform
node bin/install.js --opencode   # opencode only
node bin/install.js --claude     # Claude Code only
node bin/install.js --force      # overwrite existing files on update
```

**Where files go:**

| Platform | Agents | Skills |
|----------|--------|--------|
| opencode | `~/.config/opencode/agents/` | `~/.config/opencode/skills/` |
| Claude Code | `~/.claude/agents/` | `~/.claude/commands/` |

---

## Quick start

Activate the orchestrator:

```
/cs-scientist
```

Or say: `investiga`, `desarrolla con rigor`, `quiero aprender`, `modo research`, `modo dev`, `modo teach`.

The orchestrator runs a project health check, asks which mode and topic, initializes three session files in `.cs-scientist/{session_id}/`, and dispatches to the mode agent.

### Research

```
/cs-scientist
→ What is the impact of transformers on NLP compared to RNNs?
→ A) RESEARCH
```

The research agent runs 10 phases. GATE_1 verifies the question is falsifiable. GATE_2 verifies ≥3 independent sources per claim. GATE_3 verifies the hypothesis is falsifiable and non-circular.

### Dev

```
/cs-scientist
→ Implement a sliding window rate limiter with Redis
→ B) DEV
```

The dev agent runs 7 phases. GATE_1_DEV verifies the done criterion is external and binary. GATE_2_DEV verifies the design is unambiguous. Phase 3 PLAN invokes the `writing-plans` skill to produce ultra-detailed TDD steps with actual code in every task.

### Teach

```
/cs-scientist
→ I want to understand backpropagation
→ C) TEACH
```

The teach agent loads your source materials (papers, books, lecture notes), maps concept dependencies, scaffolds a lesson from your current level to the objective, and teaches each concept with a 7-step extractor:

1. **Minimal intuition** — using only vocabulary you already have
2. **Formal definition** — verbatim from source
3. **Best example** — concrete, not abstract
4. **Counter-example** — what this is NOT
5. **Implication** — what knowing this lets you do
6. **Connection backwards** — how this links to what came before
7. **What it unlocks** — preview of what comes next

Verification: Tier 1 (recall), Tier 2 (apply in source domain), Tier 3 (new scenario where recalling the source is insufficient — reasoning is mandatory).

### Resuming after context compaction

```
/session-status
```

Returns the current phase, gate states, active goals, last 5 actions, and a ready-to-paste dispatch block. Single copy-paste to resume.

---

## Session files

Every session creates `.cs-scientist/{session_id}/` in the project root:

```
.cs-scientist/
└── topic-slug_mode_YYYYMMDD/
    ├── session_state.json    # state machine — phase, gates, next action
    ├── goals.md              # goal tracker — active, completed, blocked
    ├── activity_log.jsonl    # append-only action history (last 5 read each turn)
    ├── knowledge_base.md     # verified findings accumulator
    ├── plan.md               # (dev) TDD implementation plan
    └── lesson.md             # (teach) lesson with exercises and solutions
```

`session_state.json` is the single source of truth for where the session is.

---

## The Verified Loop

Every mode runs a variant of this cycle:

```
PROPOSE → CRITIQUE → VERIFY (external) → PERSIST → ITERATE
```

What makes it rigorous:

- **External verifier** — defined in SCOPE before any work starts. Not "I'll review it" — a concrete test, benchmark, or experiment that a fresh agent can check independently.
- **Adversarial critic** — evaluates artifacts with zero session context. Cannot be reassured by prior conversation. Only the artifact matters.
- **Structured failures** — `FAILURES` must cite the exact part of the artifact that fails. "Needs improvement" is not a failure.
- **Verifier hierarchy** — formal verifiers (compiler, type checker, proof assistant) are preferred over tests, tests over empirical measurement, empirical over human review. Self-assessment is never a final gate.

### Gates

| Gate | Phase transition | What the critic checks |
|------|-----------------|----------------------|
| `GATE_1` | Research SCOPE | Falsifiable question, external binary truth criterion, explicit scope |
| `GATE_2` | Research TRIANGULATE | ≥3 independent sources per `[FACT]`, contradictions documented |
| `GATE_3` | Research PROPOSE | Hypothesis falsifiable, non-circular, evidence from `[VERIFIED]` only |
| `GATE_1_DEV` | Dev SCOPE | External binary verifier, unambiguous done criterion, explicit constraints |
| `GATE_2_DEV` | Dev DESIGN | Any developer can implement without clarifying questions, all `[DECISION]` entries present |
| `GATE_1_TEACH` | Teach INTAKE | Objective is measurable (a capability, not "understand X"), sources sufficient |
| `GATE_2_TEACH` | Teach SCAFFOLD | All bridges start from student's actual knowledge, no forward dependencies |
| `GATE_3_TEACH` | Teach VERIFY | Tier 3 exercises cannot be answered by recall alone |

### Gate failure routing

```
Is the failure methodological? ("verifier not binary", "circular", "ambiguous")
→ Mode agent corrects directly — max 2 attempts, then HUMAN_REQUIRED

Is the failure domain-specific? (unknown framework behavior, unclear protocol)
→ Dispatch cs-scientist-consultant — one correction, then retry
```

---

## Knowledge base tags

Research and teach sessions accumulate findings in `knowledge_base.md`:

**Research KB:**
```
[FACT]       — verified by ≥3 independent sources
[VERIFIED]   — confirmed by experiment
[HYPOTHESIS] — plausible but unverified
[SYNTHESIS]  — model-generated connection between verified facts
[REFUTED]    — tested and disproven
```

**Teach KB:**
```
[CORE]         — fundamental concept on the critical path to the objective
[ADVANCED]     — builds on CORE, required for full depth
[APPLIED]      — application of a concept to a specific domain
[PREREQUISITE] — needed but not taught in this session
[MISCONCEPTION]— common wrong understanding, addressed explicitly in EXPLAIN
```

---

## Protocol

The full inter-agent communication contract is in `PROTOCOL.md`. It defines the dispatch/return envelope format, gate criteria per gate type, the Iron Rule (3 mandatory reads per turn), verifier hierarchy, and session file schemas.

If an agent behavior conflicts with `PROTOCOL.md`, the protocol wins.

---

## Requirements

- Node.js ≥ 18
- [opencode](https://opencode.ai) and/or [Claude Code](https://claude.ai/code)
- A model API key configured in your tool

---

## License

MIT
