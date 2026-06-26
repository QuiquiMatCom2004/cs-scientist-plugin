# cs-scientist-plugin — Agent Guidelines

## Project type
Plugin de agente CLI para opencode y Claude Code.

## Language & frameworks
- JavaScript (ESM, Node.js ≥ 18)
- Sin frameworks externos — plugin de agentes nativo

## Architecture
Plugin de agentes con skills. Sistema multi-agente con:
- **Orquestador** (`cs-scientist`) — health check → session init → dispatch
- **Agentes de modo** (research, dev, teach) — loops de fase con gates adversariales
- **Sub-agentes** (critic, consultant, arbiter) — cero contexto de sesión, nunca tocan disco
- **Skills** — comandos auxiliares (deep-research, kb-validate, session-status, etc.)

## Done criteria
- Review aprobado (PASS del critic en gates correspondientes)

## Hard constraints
- El proyecto debe funcionar como agentes para **Claude Code** y **opencode**
- Los agent files NO especifican `model:` en frontmatter — cada plataforma usa su modelo por defecto (compatibilidad cross-platform)
- Sub-agentes (critic, consultant, arbiter) nunca tocan disco ni tienen acceso a la sesión
- El protocolo inter-agente está definido en `PROTOCOL.md` — si hay conflicto, el protocolo gana
- `session_state.json` es la única fuente de verdad del estado de la sesión
