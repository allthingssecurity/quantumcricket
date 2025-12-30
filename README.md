Quantum Cricket (Run Chase)

A Vite + React arcade cricket game that teaches quantum mechanics concepts as you play.

Live Site
- GitHub Pages: https://allthingssecurity.github.io/quantumcricket/

How To Play
- Aim: use Arrow Left (←), Arrow Up (↑), Arrow Right (→)
- Swing: Spacebar
- Pause and Read: press P to pause and open the Knowledge Book
- Flip pages (while paused): ← / →
- Resume: press R

What You’ll See
- Concepts on every scoring hit (curated per level, quantum‑only)
- Anti‑patterns/pitfalls when bowled
- Knowledge Book collects every note across levels; you can pause anytime and read

Local Development
1) npm install
2) npm run dev
3) Open the printed localhost URL

Build
- npm run build

Deploy to GitHub Pages (optional)
- npm run deploy
  - Publishes the production build in `dist/` to the `gh-pages` branch

Optional Live Commentary
- The game runs without any API key. If you want experimental live audio commentary, set an environment variable before `npm run dev`:
  - macOS/Linux: `export GEMINI_API_KEY=your_key_here`
  - Windows (PowerShell): `$Env:GEMINI_API_KEY="your_key_here"`
  The game will attempt to open a live session; if not set, it silently falls back to text UI.

Notes
- This repository intentionally excludes large PDFs and generated JSON used during local development.
