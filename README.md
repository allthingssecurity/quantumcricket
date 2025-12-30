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

Notes
- This repository intentionally excludes large PDFs and generated JSON used during local development.

## Quantum Badminton (Sub‑App)

- Play: https://allthingssecurity.github.io/quantumcricket/badminton/

Controls
- Move: mouse/finger to position racket
- Swing: Space or click/tap
- Pause/Book: P opens a two‑page Knowledge Book (Arrow keys to flip)
- Resume: R
- Scoring: Rally to 21; Level Complete overlay appears at game end

Local Dev
1) cd badminton-app
2) npm install
3) npm run dev (open the printed localhost URL)

Deploy to GitHub Pages (under /badminton/)
- The sub‑app honors a base path via BASE_PATH (see badminton-app/vite.config.ts).
- Build: `cd badminton-app && BASE_PATH=/badminton/ npm run build`
- Publish: copy badminton-app/dist/ into the gh-pages branch at badminton/ (this repo already does this layout).
