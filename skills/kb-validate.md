---
description: >-
  Validates the integrity of a cs-scientist knowledge base before advancing
  to a gate or critical phase. Checks tag consistency, source completeness,
  circular references, and schema compliance. Returns a structured report
  with PASS/FAIL and a list of violations. Safe to run at any point.
---

# kb-validate

## Input

```
$ARGUMENTS — path to knowledge_base.md, OR session directory path
```

If $ARGUMENTS is a session directory, look for `knowledge_base.md` inside it.

## What you check

### 1 — Tag consistency

Every item must use exactly one of these tags: `[FACT]`, `[VERIFIED]`, `[HYPOTHESIS]`,
`[SYNTHESIS]`, `[REFUTED]`, `[DATO]`, `[OPINIÓN]`.

Violations:
- Item with no tag
- Item with multiple tags
- Item with a tag not in this list
- `[VERIFIED]` item with no source citation

### 2 — Source completeness

Every `[FACT]` and `[VERIFIED]` item must have: title, year, URL (or "experiment_{date}" for experiments).

Violations:
- Missing source on [FACT] or [VERIFIED]
- Source present but URL missing
- "et al." or "various sources" as a source (not specific enough)

### 3 — Circular references

A `[SYNTHESIS]` item cited as evidence for a `[VERIFIED]` item is a circular reference.
A `[HYPOTHESIS]` used as evidence for another `[HYPOTHESIS]` without noting the chain is a weak chain.

Violations:
- [SYNTHESIS] cited as [VERIFIED] evidence
- [HYPOTHESIS] chain without explicit "depends on unverified hypothesis" note

### 4 — Refuted items still referenced

If a `[REFUTED]` claim is cited as evidence anywhere in the KB, it is a contamination.

Violations:
- Any reference to a [REFUTED] item as supporting evidence

### 5 — Open Questions coverage

If there are claims marked as contradictory but no corresponding Open Question entry, the
contradiction is silently resolved.

Violations:
- Contradictory sources cited for the same claim, no Open Question registered

## Output format

```
KB-VALIDATE: {kb path}
TIMESTAMP: {ISO8601}
RESULT: PASS | FAIL

VIOLATIONS:
- [TAG_CONSISTENCY] Line {N}: {description}
- [SOURCE_COMPLETENESS] "{claim excerpt}": missing {what}
- [CIRCULAR_REF] "{synthesis item}": cited as evidence for "{verified item}"
- [REFUTED_CONTAMINATION] "{refuted claim}": still referenced at line {N}
- [CONTRADICTION_UNREGISTERED] "{claim}": contradictory sources, no Open Question entry

STATS:
- [FACT]: {count}
- [VERIFIED]: {count}
- [HYPOTHESIS]: {count}
- [SYNTHESIS]: {count}
- [REFUTED]: {count}
- Open Questions: {count}

RECOMMENDATION:
{one sentence — what to fix before proceeding, or "KB is clean, proceed."}
```

## Integration with cs-scientist

Run before any gate dispatch to catch KB issues before the critic sees them.
If FAIL: fix violations before dispatching to cs-scientist-critic.
If PASS: proceed — the critic evaluates logic, not format.

## NEVER

- NEVER modify the KB — read only
- NEVER pass a KB with [CIRCULAR_REF] or [REFUTED_CONTAMINATION] violations — these are hard failures
- NEVER report PASS if any violation exists, even minor ones — the user decides what to fix
