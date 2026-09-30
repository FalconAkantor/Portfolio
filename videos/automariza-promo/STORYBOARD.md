---
title: AUTOMARIZA — promo
duration: 60
fps: 30
format: 1920x1080 (index.html) · 1080x1920 (vertical.html)
bpm: 120
music: electronic, synthesized (assets/audio/soundtrack.wav)
---

# Storyboard

Cuts land on bar lines (1 bar = 2 s at 120 BPM). Every scene is a sub-composition in
`compositions/` and is shared by both formats: `vertical.html` adds `class="tall"` to
`<html>` and each scene switches its layout with `.tall` selectors.

| # | Frame | Time | What happens | Status |
|---|---|---|---|---|
| 01 | `hook` | 0–6 s | Prompt `./construir --con-ia` types itself, then the web's headline CONSTRUYO / SISTEMAS / QUE PIENSAN. types letter by letter with the amber caret; SISTEMAS glitches (rift) and fills; the brand badge "La R es de Razonamiento" lands. | animated |
| 02 | `problem` | 6–14 s | "// cada día, en tu empresa": five cards of repetitive work fly in (emails, PDFs, Excel, WhatsApps, cameras) + "Trabajo repetitivo." Then everything disintegrates into dust (deterministic canvas particles, the Thanos nod) and "Eso puede funcionar solo." takes its place. | animated |
| 03 | `sys-cctv` | 14–20 s | 01/05 · CCTV autónomo con IA — night camera, known car, a person walks in, detection box, the local AI judges, alert sent. | animated |
| 04 | `sys-inventory` | 20–26 s | 02/05 · Inventario IA — WhatsApp photo, flash, scan, ticks and gaps, "7 contados / faltan 3", 08:00 restocking list. | animated |
| 05 | `sys-docs` | 26–32 s | 03/05 · Biblioteca documental — PDF/XLSX/DOCX drop in, OCR beam, tags, a question, the answer with its source. | animated |
| 06 | `sys-desk` | 32–38 s | 04/05 · Mostrador de WhatsApp — customer, AI answer, "asistente", the chat crosses the bridge to the team channel, Ana replies. | animated |
| 07 | `sys-workspace` | 38–44 s | 05/05 · Agent Workspace — windows open, the assistant suggests the tool, single sign-on. | animated |
| 08 | `proof` | 44–50 s | Real captures of the website in tilted browser frames: tech version, CCTV console, document library, stack; then the simple version and the phone. | animated |
| 09 | `how` | 50–54 s | Four steps with a connector that draws itself: me cuentas → te propongo → lo construyo → lo dejo vigilado. | animated |
| 10 | `cta` | 54–60 s | "¿Algo así en tu empresa?" + WhatsApp (+34 624 42 15 03, solo mensajes) + email + wordmark; the R signs itself. | animated |

## Video direction

- Ground: `#05070a` with a faint 64 px grid, two slow glows (amber top-right, cyan bottom-left),
  film grain (registry `grain-overlay`) and a vignette — painted once in the index for all scenes.
- Type: Archivo Variable at 125 % stretch / 800 for display, IBM Plex Mono for system text.
- Motion: expo/power ease-outs, 0.5–0.7 s entrances, stages on the beat, exits as a quick
  push (y −40, blur) in the last 0.4 s of each frame so cuts feel like page turns.
- Accents keep the web's meaning: amber = system / operator, cyan = data in motion,
  green = ok, red = alert.
