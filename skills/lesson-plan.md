---
description: >-
  Lightweight lesson plan generator. Takes a topic, target audience, and
  available time, and produces a structured lesson plan with learning objective,
  concept sequence, and suggested activities. Lighter than the full TEACH mode —
  generates the plan document without running an interactive teaching session.
  Use to prepare materials before a class.
---

# lesson-plan

## Input

```
$ARGUMENTS — "topic [@ audience] [@ duration]"
```

Examples:
- `árboles de decisión`
- `árboles de decisión @ estudiantes de 2do año @ 90 minutos`
- `gradient descent @ investigadores @ 30 minutos`

Audience options: `bachillerato` / `grado` (default) / `máster` / `investigadores` / `profesionales`
Duration: in minutes (default: 60)

## Output format

```markdown
# Plan de Clase: {topic}
**Audiencia:** {audience} | **Duración:** {N} min | **Fecha:** {today}

---

## Objetivo de Aprendizaje

Al finalizar esta clase, el estudiante podrá:
{1-2 measurable capabilities — not "understand X", but "solve Y" or "explain Z to someone else"}

---

## Mapa de Conceptos (de prerequisito a objetivo)

{concept} → {concept} → {objective}
Prerequisitos asumidos: {what students must already know}

---

## Estructura de la Clase

| Bloque | Duración | Actividad | Objetivo del bloque |
|--------|----------|-----------|---------------------|
| Apertura | {N} min | {hook — question, problem, or surprising fact} | Activar conocimiento previo |
| Bloque 1 | {N} min | {core concept 1 — brief description} | {what students can do after} |
| Bloque 2 | {N} min | {core concept 2} | {capability} |
| {…} | | | |
| Verificación | {N} min | {exercise or question type} | Confirmar comprensión |
| Cierre | {N} min | {summary + forward link} | Consolidar y conectar |

Nota: reserva {10% of duration} para preguntas — redistribuye si no hay.

---

## Actividad de Verificación

{1 exercise or question that tests the learning objective}
Nivel: Tier 2 (aplicación) — el alumno debe usar el concepto, no solo recordarlo

Si el tiempo lo permite — Tier 3:
{1 extension exercise that requires applying the idea to a new context}

---

## Material de Apoyo Sugerido

- Requisito mínimo: {one diagram or visual that makes the core idea clearer}
- Opcional: {code example / dataset / paper reference}

---

## Puntos de Confusión Anticipados

- {common misconception about this topic} → abordar en {block N}

---

## Conexión con Clases Adyacentes

- Viene de: {previous topic in a typical curriculum}
- Lleva a: {next topic}
```

## If a cs-scientist TEACH session is active for this topic

Prepend:
```
[SESIÓN TEACH ACTIVA]
Este plan se apoya en los conceptos ya mapeados en tu sesión de teach.
Fuentes cargadas: {source titles from teach session}
```
Then derive concept sequence from the session's source KB rather than generating from scratch.

## NEVER

- NEVER write the full lecture — only the plan
- NEVER make the learning objective unmeasurable ("entender", "conocer", "apreciar")
- NEVER omit the verification activity — a class with no verification is not a lesson, it is a presentation
- NEVER assume prerequisites beyond what the audience level suggests
