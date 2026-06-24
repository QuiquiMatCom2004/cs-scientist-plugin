---
description: >-
  Generates a concise onboarding document for a new team member joining a
  project. Reads AGENTS.md/CLAUDE.md, README, recent git history, and project
  configuration files to produce a "Day 1" guide: what the project does, how to
  run it, key architectural decisions, and where to start.
---

# project-onboarding

## Input

```
$ARGUMENTS — project root path, OR empty to use current project
```

If $ARGUMENTS is empty: `git rev-parse --show-toplevel 2>/dev/null || pwd`

## What you read

Read these files in order. Stop reading a file after 200 lines — if it is longer, skim for
the sections most relevant to a new developer.

| File | What to extract |
|------|----------------|
| `AGENTS.md` or `CLAUDE.md` | Project type, stack, architecture, commands, constraints |
| `README.md` | Purpose, setup instructions, any quickstart |
| `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` | Dependencies, scripts |
| `CHANGELOG.md` | Last 3 entries — what changed recently |
| `.gitignore` | What kind of artifacts the project generates (inferred from ignores) |

Then run:
```bash
git log --oneline -15
```
to get recent commit history. Identify the 3 most active areas of the codebase.

## Output format

```markdown
# Onboarding: {project name}
*Generado el {date} desde el estado actual del repositorio*

---

## ¿Qué es este proyecto?
{1-2 sentences. What problem does it solve? Who uses it?}

## Stack

| | |
|-|-|
| Lenguaje(s) | {languages} |
| Framework(s) | {frameworks} |
| Arquitectura | {pattern} |
| Tipo | {web app / CLI / library / pipeline / etc.} |

## Cómo arrancarlo

```bash
{exact commands from AGENTS.md or README — no guessing}
```

## Cómo testear

```bash
{exact test command}
```
Criterio de done: {done criterion from AGENTS.md}

## Estructura del proyecto

{top-level directory listing with one-line purpose per directory}
```
dir/        → {what lives here}
```

## Decisiones de arquitectura que necesitas conocer

{from AGENTS.md "decisiones no obvias" section, or inferred from code structure}
- {decision}: {why it was made this way}

## Lo que NUNCA debes hacer

{from AGENTS.md "qué NUNCA debe hacer un agente" — applies to humans too}
- {constraint}

## Actividad reciente (últimos 15 commits)

{3 bullets: what areas have changed, what is actively being worked on}

## Por dónde empezar

{based on git log + structure: what is the main entry point? what is the core flow?}
1. Lee: `{most important file to read first}`
2. Ejecuta: `{command that shows the system working}`
3. Modifica: `{smallest safe change to make to verify the dev loop works}`

---
*Este documento es una instantánea. Para el estado actual consulta AGENTS.md y git log.*
```

## Rules

- Only include information derivable from the files — no fabrication
- If a command is not in the files, write `{no encontrado — verificar con el equipo}` rather than guessing
- The "Por dónde empezar" section must be concrete and executable, not vague

## Save behavior

Ask: "¿Guardo esto como `ONBOARDING.md` en el proyecto? [S/n]"
Default yes. If yes, save to project root. If the file already exists, show a diff summary and ask before overwriting.

## NEVER

- NEVER invent commands — only use what appears in the files
- NEVER include secrets, API keys, or credentials even if found in config files
- NEVER create this file without asking first — the user decides if it should be committed
