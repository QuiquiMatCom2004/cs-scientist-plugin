---
description: >-
  Lightweight single-concept explainer. No session required. Takes a concept
  and a student level, explains it at three levels of depth: accessible /
  practitioner / researcher. Each level is a standalone explanation — not a
  progression. Quick use during research or dev sessions when a concept needs
  clarification without starting a full TEACH session.
---

# concept-explainer

## Input

```
$ARGUMENTS — "concept [@ level]"
```

Examples:
- `gradient descent`
- `gradient descent @ nivel 0`
- `transformers @ investigador`

Level options: `nivel 0` (no background) / `grado` (undergraduate) / `investigador` (researcher)

If no level specified: generate all three.

## Rules before explaining

1. If you have a cs-scientist session active with a source KB, derive explanations from KB facts where they apply. Mark with `[KB]`.
2. If no session KB: explain from general knowledge. Do not cite sources you cannot verify.
3. Every explanation must include one concrete example. No purely abstract explanations.

## Output format

```
─── {CONCEPT} ───────────────────────────────────────────────

NIVEL 0 — Para alguien sin conocimiento previo
{3-5 sentences. Use only analogies to everyday objects or experiences.
 No formulas. No technical vocabulary.}
Ejemplo: {one everyday analogy or story}

─────────────────────────────────────────────────────────────

NIVEL GRADO — Para un estudiante universitario
{5-8 sentences. Technical vocabulary is fine. Show the formal definition but explain it.
 Connect to concepts a CS undergraduate would know.}
Ejemplo: {code snippet, equation, or concrete technical scenario}

─────────────────────────────────────────────────────────────

NIVEL INVESTIGADOR — Para alguien activo en el área
{3-5 sentences. No hand-holding. Highlight the non-obvious aspects,
 known limitations, open problems, or common misconceptions in the literature.}
Puntero: {one specific area, paper type, or term to search if they want to go deeper}

─────────────────────────────────────────────────────────────

CONCEPTO RELACIONADO QUE VALE LA PENA CONOCER:
{one concept that connects to this one — name + one sentence on the connection}
```

## If session KB is active and concept is in KB

Lead with:
```
[KB] Este concepto está en tu base de conocimiento:
{KB entry verbatim}

Expandiendo desde esa base:
{then the level(s) requested}
```

## NEVER

- NEVER make up citations or paper titles — if you can't verify a source, don't cite it
- NEVER give a researcher-level explanation that is just a longer undergraduate explanation — it must add something a practitioner would actually find useful
- NEVER skip the concrete example — "I'll skip the example since this concept is abstract" is not acceptable
