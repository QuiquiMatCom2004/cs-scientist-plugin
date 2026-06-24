---
description: >-
  Systematic multi-source research skill. Takes a research question and
  returns structured output in cs-scientist KB format (confirmed/insufficient/
  contradictory/partial). Output is directly importable into the KB without
  reformatting. Works standalone or as Phase 3 RETRIEVE accelerator.
---

# deep-research

## Input

```
$ARGUMENTS — the research question or topic to investigate
```

If called from cs-scientist-research Phase 3, $ARGUMENTS is the scientific question from SCOPE.

## What you do

Execute systematic research across source types. Do not summarize — extract and classify.

### Step 1 — Search across source types

For every question, search across at least 4 of these source types:
- Academic / peer-reviewed (arxiv, semantic scholar, pubmed, ACM, IEEE)
- Industry / technical documentation (official docs, engineering blogs, whitepapers)
- News / analysis (recent coverage, expert commentary)
- Primary data / code (GitHub repos, datasets, benchmarks, official repos)

### Step 2 — Classify each claim

For every claim extracted, assign a status:

| Status | Meaning | Output tag |
|--------|---------|-----------|
| `confirmed` | ≥3 independent sources agree | `[FACT]` |
| `contradictory` | Sources disagree — both versions documented | Open Question |
| `insufficient` | <3 sources or only one source type | `[HYPOTHESIS]` |
| `partial` | Supported but with caveats or limited scope | `[HYPOTHESIS]` + note |

### Step 3 — Output in KB format

```
DEEP-RESEARCH: {question}
DEPTH: standard | deep
SOURCES_CONSULTED: {N}
SOURCE_TYPES: {list of types used}

---

CONFIRMED:
- [FACT] {exact claim} — Source: {title}, {year}, {URL}
- [FACT] {exact claim} — Source: {title}, {year}, {URL}

INSUFFICIENT:
- [HYPOTHESIS] {claim} | Supporting: {source}, {year}

CONTRADICTORY:
- CLAIM: {claim}
  FOR: {source URL} — {quote or evidence}
  AGAINST: {source URL} — {quote or evidence}
  STATUS: open question — do not advance as [FACT]

PARTIAL:
- [HYPOTHESIS] {claim} | Evidence: {source} | Note: {scope limitation}

OPEN_QUESTIONS:
- {question that research could not resolve}
```

## Integration with cs-scientist-research

When called from Phase 3 RETRIEVE, the mode agent maps this output directly:

```
confirmed  → [FACT] in KB (pending TRIANGULATE)
insufficient  → [HYPOTHESIS] in KB
contradictory → register both versions as Open Question
partial → [HYPOTHESIS] with note "partial evidence — scope limited to {X}"
```

Phase 4 TRIANGULATE still applies to [FACT] items — deep-research confirming a claim does not
replace the triangulation requirement. It accelerates source collection.

## Depth modes

`standard` — 2-3 sources per claim, covers main source types, good for established topics
`deep` — 5+ sources per claim, includes grey literature and primary data, for contested or novel topics

If $ARGUMENTS does not specify depth, use `standard`.

## NEVER

- NEVER mark a claim [VERIFIED] — that tag is reserved for the cs-scientist mode agent after TRIANGULATE
- NEVER omit contradictory evidence — if sources disagree, both versions are required
- NEVER summarize sources — quote the specific claim from the source
- NEVER use secondary sources to confirm a primary claim — independence of sources matters
