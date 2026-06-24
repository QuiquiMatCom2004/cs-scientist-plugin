---
description: >-
  Converts a cs-scientist research session (knowledge_base.md + report.md) into
  an academic paper skeleton following standard structure. Does not write the
  paper — produces the skeleton with guidance on what goes where, derived
  entirely from verified KB findings. Run after Phase 10 DOCUMENT is complete.
---

# paper-outline

## Input

```
$ARGUMENTS — session directory path, OR topic name, OR empty to use active session
```

If $ARGUMENTS is empty or a topic name: scan `.cs-scientist/` for matching research sessions.

## Pre-condition check

Read `session_state.json`. If mode ≠ research or phase ≠ DOCUMENT:
```
Esta skill requiere una sesión de research completada (Phase 10 DOCUMENT).
Sesión actual: modo={mode}, fase={phase}.
Completa la investigación antes de usar paper-outline.
```

## What you read

- `knowledge_base.md` — primary source. Every paper section maps to specific KB tags.
- `report.md` (if exists) — already synthesized findings; use as guide for the Abstract and Discussion.

## KB → Paper section mapping

| KB tags | Paper section |
|---------|--------------|
| `[FACT]`, `[VERIFIED]` | Results, Background |
| `[SYNTHESIS]` | Discussion, Conclusions |
| `[HYPOTHESIS]` | Future Work, Limitations |
| `[REFUTED]` | Negative Results (Appendix or Discussion) |
| Open Questions | Future Work |
| [DECISION] entries (if dev session mixed) | Methods |

## Output format

```markdown
# Paper Outline: {topic}
*Derivado de sesión: {session_id} | {date}*
*Formato sugerido: {NeurIPS | ICML | Nature | arXiv preprint — inferred from topic domain}*

---

## Abstract (150-250 words)
**Derivar de:** {top 3 VERIFIED findings from KB}
Estructura obligatoria: [Problema] [Por qué importa] [Nuestro enfoque] [Resultado principal] [Implicación]

Hallazgos candidatos para incluir:
- {VERIFIED finding 1}
- {VERIFIED finding 2}
- {VERIFIED finding 3}

---

## 1. Introduction
**Derivar de:** {problem framing from SCOPE, motivation from KB background}
Estructura: Hook → Gap en el estado del arte → Contribución → Estructura del paper

Contenido candidato de KB:
- {relevant FACT or VERIFIED item}

---

## 2. Related Work
**Derivar de:** {FACT items with citations, SYNTHESIS items connecting prior work}
Agrupar en subsecciones por: {identified clusters from KB — e.g., "Approaches A", "Approaches B"}

Fuentes KB con cita completa: {N items — list titles and years}
Fuentes a buscar para completar: {Open Questions that require more literature}

---

## 3. Methods / Approach
**Derivar de:** {DESIGN artifacts if dev, or methodology from research phases}
Estructura: [Setup / datos] [Procedimiento] [Criterios de evaluación]

---

## 4. Results
**Derivar de:** {all VERIFIED items — the confirmed findings}
Cada subsección = un hallazgo verificado.

Hallazgos confirmados para este bloque:
{list all [VERIFIED] KB items with source citations}

---

## 5. Discussion
**Derivar de:** {SYNTHESIS items, connections between findings}
Estructura: [Lo que significan los resultados] [Por qué son sorprendentes o esperados] [Limitaciones]

Candidatos de discusión de KB:
{list [SYNTHESIS] items}

---

## 6. Limitations
**Derivar de:** {HYPOTHESIS items not verified, Open Questions not resolved, [REFUTED] items that revealed scope limits}

- {limitation 1 — source in KB}
- {limitation 2 — source in KB}

---

## 7. Future Work
**Derivar de:** {unresolved Open Questions, LOW-confidence HYPOTHESIS items}

- {future direction 1 — linked to KB open question}

---

## Appendix A — Negative Results (Optional but recommended)
**Derivar de:** {[REFUTED] items, gate failures documented in negative_results.md if available}
Incluir si hay ≥2 hipótesis refutadas — es metodológicamente valioso.

---

## References
{all cited sources from KB — grouped by section where cited}
Formato: {inferred from target venue — APA / IEEE / Nature / ACM}

---

ADVERTENCIAS:
{list of KB items marked [HYPOTHESIS] that appear in Results — these need more validation before submission}
{list of SYNTHESIS items used as if VERIFIED — these need explicit hedging language}
```

## NEVER

- NEVER include [HYPOTHESIS] items in Results without flagging them
- NEVER omit Limitations — a paper without limitations is not credible
- NEVER suggest a venue if you cannot match the topic domain to it with confidence
- NEVER write the paper — only the skeleton with content guidance derived from KB
