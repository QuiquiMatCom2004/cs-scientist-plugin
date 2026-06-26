# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2026-06-25

### Fixed
- Agent files ya no especifican `model:` en frontmatter — compatibilidad cross-platform entre opencode y Claude Code. Cada CLI usa su modelo por defecto.
- Eliminadas IDs de modelo OpenCode-specific (`opencode/big-pickle`, `opencode/deepseek-v4-flash-free`) que impedían el funcionamiento del plugin en Claude Code.

### Removed
- `agents/writer.md` y `agents/planner.md` — no pertenecen al sistema cs-scientist.

### Added
- `AGENTS.md` con guías del proyecto.
- `CHANGELOG.md` con formato estándar.

## [0.1.2] - 2025
