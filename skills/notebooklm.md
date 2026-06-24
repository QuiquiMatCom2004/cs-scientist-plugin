---
description: >-
  Post-investigation transformation skill. Converts a cs-scientist report.md
  into alternative formats: podcast script, FAQ, or executive briefing.
  Never modifies the KB or the report. Always runs after Phase 10 DOCUMENT —
  never during the research or dev loop.
---

# notebooklm

## Input

```
$ARGUMENTS — path to report.md, OR topic name if report is in the active session
```

If $ARGUMENTS is a topic name, look for the report at:
`.cs-scientist/{matching_session_id}/report.md`

## Output formats

Ask the user which format they want if not specified in $ARGUMENTS:

```
¿Qué formato quieres?
A) Podcast — guión conversacional entre dos personas, ~1500 palabras
B) FAQ — 10-15 preguntas y respuestas para alguien nuevo en el tema
C) Briefing ejecutivo — resumen ejecutivo de 1 página, orientado a decisiones
```

### A — Podcast script

Two speakers: HOST (generalist, asks questions) and EXPERT (domain knowledge).
Structure: hook (30s) → context (2min) → 3-4 key findings (5-6min) → implications (2min) → close (30s).
Tone: accessible, no jargon without explanation.

```
[PODCAST: {topic}]
Based on: {report.md path}

HOST: ...
EXPERT: ...
[continues for ~1500 words]

---
KEY SOURCES MENTIONED: {3-5 most important sources from the report}
```

### B — FAQ

10-15 questions a knowledgeable non-specialist would ask.
Derive questions from: Open Questions in KB, hypotheses, contradictions, limitations.
Each answer cites the report section, not the original source.

```
[FAQ: {topic}]
Based on: {report.md path}

Q1: {question}
A: {answer in 2-4 sentences, cites report section}

...

---
QUESTIONS WITHOUT CLEAR ANSWERS (from KB Open Questions):
- {question that the research did not resolve}
```

### C — Executive briefing

One page. Decision-oriented. Three sections only:
```
[EXECUTIVE BRIEFING: {topic}]
Based on: {report.md path} | Date: {ISO8601}

SITUATION: {1 paragraph — what is known with confidence}
IMPLICATIONS: {2-3 bullets — what this means for decisions}
UNCERTAINTIES: {2-3 bullets — what is still unknown and why it matters}
RECOMMENDED NEXT STEP: {1 concrete action}
```

## Rules

- Every claim in the output must trace to the report — not to new information
- Do not introduce new claims or interpretations not present in the report
- Do not modify report.md or knowledge_base.md — read only
- If the report has no [VERIFIED] findings yet, stop and notify:
  `El report no tiene hallazgos verificados. Completa Phase 10 DOCUMENT antes de usar esta skill.`

## NEVER

- NEVER run during the research loop — only after DOCUMENT is complete
- NEVER add new claims not in the report
- NEVER modify the KB or the report file
- NEVER present [HYPOTHESIS] items as confirmed findings in any output format
