---
description: >-
  Dispatches multiple research angles as independent parallel searches.
  Used in cs-scientist-research Phase 2 DECOMPOSE to accelerate RETRIEVE.
  Each angle is searched independently with no cross-contamination between
  searches. Results are consolidated in KB-compatible format.
---

# parallel-research

## Input

```
$ARGUMENTS — list of research angles from DECOMPOSE, one per line
```

Format expected:
```
TOPIC: {main research question}
ANGLES:
1. {angle 1 — searchable independently}
2. {angle 2 — searchable independently}
3. {angle 3 — searchable independently}
...
```

## What you do

Search each angle as a fully independent research task. Do not let findings from angle N
influence the search strategy for angle N+1. Cross-contamination defeats the purpose of
parallel independent searches.

### Per angle — search protocol

For each angle:
1. Search across ≥3 source types (academic, industry, primary data minimum)
2. Extract and tag each claim (same tags as deep-research: `[FACT]`, `[HYPOTHESIS]`, etc.)
3. Note contradictions within the angle
4. Estimate coverage: `low` (<5 sources) / `medium` (5-10) / `high` (>10)

### Output format

```
PARALLEL-RESEARCH: {main topic}
ANGLES_SEARCHED: {N}

---

ANGLE 1: {angle name}
COVERAGE: low | medium | high
FACTS:
- [FACT] {claim} — Source: {title}, {year}, {URL}
HYPOTHESES:
- [HYPOTHESIS] {claim} | Supporting: {source}
CONTRADICTIONS:
- {claim}: FOR {source} | AGAINST {source}
OPEN_QUESTIONS:
- {unresolved question specific to this angle}

ANGLE 2: {angle name}
...

---

CROSS-ANGLE PATTERNS:
- {pattern that appears across multiple angles — mark as [SYNTHESIS] candidate}

COVERAGE_GAPS:
- {angle with low coverage that needs more research}
```

## Integration with cs-scientist-research

Call this skill from Phase 2 DECOMPOSE when the angles are defined.
Output feeds directly into Phase 3 RETRIEVE — skip manual search for covered angles.
Low-coverage angles still require manual search in Phase 3.

CROSS-ANGLE PATTERNS go into KB as `[SYNTHESIS]` candidates — they are model-generated
connections, not verified facts. Label them explicitly.

## NEVER

- NEVER mix findings between angles during search — search each independently
- NEVER mark cross-angle patterns as [FACT] — they are [SYNTHESIS] candidates until verified
- NEVER skip low-coverage angles — flag them as gaps, do not omit them from output
