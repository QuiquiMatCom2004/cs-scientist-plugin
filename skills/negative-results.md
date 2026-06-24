---
description: >-
  Documents what was attempted and failed during a cs-scientist session.
  Extracts gate failures, refuted hypotheses, discarded design decisions, and
  abandoned approaches from session files. Negative results are first-class
  scientific findings — they narrow the search space for future attempts.
  Inspired by DeepMind's practice of documenting what did NOT work.
---

# negative-results

## Input

```
$ARGUMENTS — session directory path, OR empty to scan .cs-scientist/ in current project
```

If $ARGUMENTS is empty:
1. `git rev-parse --show-toplevel 2>/dev/null || pwd`
2. List sessions in `{project_root}/.cs-scientist/`
3. If multiple: ask which one. If one: use it. If none: report no active session.

## What you extract

### From activity_log.jsonl
- Every entry with `result: fail` or `result: human_required`
- Every `gate_return` with failure verdict

### From knowledge_base.md
- All `[REFUTED]` items — claims that were tested and disproven
- All open questions that were explicitly closed as "unresolvable" in this session

### From plan.md (dev sessions only)
- `[DECISION]` entries with `Alternatives discarded:` — alternatives that were rejected and why

### From session_state.json
- Gate failures recorded in the `gates` object
- `blocked_reason` if present

## Output format

```
NEGATIVE RESULTS — {session_id}
Fecha: {ISO8601}
Modo: {research | dev | teach}
─────────────────────────────────────────────────────────────────

## 1. Hipótesis Refutadas

{from [REFUTED] KB items}
- [{REFUTED}] {claim} — Refutado porque: {reason from KB}
  → Implicación: {what this rules out for future attempts}

## 2. Fallos de Gate

{from activity_log gate_return failures}
- {GATE_ID} falló en fase {phase}
  Causa diagnóstica: {FAILURES from critic verbatim}
  Corrección aplicada: {what was done} | Resultado: {outcome}

## 3. Enfoques Descartados

{from [DECISION] discarded alternatives in dev, or abandoned research angles}
- Descartado: {approach}
  Razón: {why not}
  Condición de reapertura: {under what circumstances this would become viable again}

## 4. Preguntas Abiertas Sin Resolver

{open questions from KB that were not answered in this session}
- {question} — Estado al cierre: {why unresolved}
  Sugerencia para próxima sesión: {where to look}

## 5. Bloqueos No Resueltos

{if blocked_reason in session_state.json}
- Bloqueado en: {phase}
  Razón: {blocked_reason verbatim}

─────────────────────────────────────────────────────────────────
RESUMEN
Hipótesis refutadas: {N} | Fallos de gate: {N} | Enfoques descartados: {N}
Preguntas sin resolver: {N}

VALOR PARA LA PRÓXIMA SESIÓN:
{1-2 sentences — what the next session should NOT try again, and where to start instead}
```

## Save behavior

Ask the user: "¿Guardo esto en `.cs-scientist/{session_id}/negative_results.md`? [S/n]"

Default yes. Do not save automatically — the user decides.

## NEVER

- NEVER infer failures not recorded in the files — only report what is there
- NEVER present refuted claims as "partially valid" — if [REFUTED], it is refuted
- NEVER modify KB or session files — read only
- NEVER omit the "Condición de reapertura" for discarded approaches — it is what makes this useful
