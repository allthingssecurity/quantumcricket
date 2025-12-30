import React, { useEffect, useRef, useState, useCallback } from 'react'
import { QUANTUM_CONCEPTS } from './data/concepts'
import { useAssets } from './hooks/useAssets'
import type { BookEntry } from './types'

type Vec = { x: number; y: number }

const W = 960, H = 540
const NET_X = W / 2
const GROUND_Y = H - 40
const NET_TOP_Y = GROUND_Y - 160
const GAME_POINT = 21
const LEVELS = [
  { id: 1, aiSpeed: 520, aiShotMix: { clear: 0.5, drop: 0.3, smash: 0.2 } },
  { id: 2, aiSpeed: 580, aiShotMix: { clear: 0.45, drop: 0.25, smash: 0.3 } },
  { id: 3, aiSpeed: 640, aiShotMix: { clear: 0.4, drop: 0.2, smash: 0.4 } },
]

function randConcept() {
  return QUANTUM_CONCEPTS[Math.floor(Math.random() * QUANTUM_CONCEPTS.length)]
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const assets = useAssets()
  const [concept, setConcept] = useState<string>('')
  const [score, setScore] = useState({ you: 0, ai: 0 })
  const [running, setRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [page, setPage] = useState(0)
  const [book, setBook] = useState<BookEntry[]>([])
  const [levelIndex, setLevelIndex] = useState(0)
  const level = LEVELS[levelIndex] || LEVELS[LEVELS.length - 1]
  const [message, setMessage] = useState<string>('')
  const [levelOverlay, setLevelOverlay] = useState<{show:boolean, text:string}|null>(null)
  const [flipDir, setFlipDir] = useState<null | 'left' | 'right'>(null)

  const stateRef = useRef({
    shuttle: { p: { x: NET_X - 200, y: GROUND_Y - 120 }, v: { x: 280, y: -520 } as Vec },
    gravity: 800,
    drag: 0.985,
    player: { x: W - 160, y: GROUND_Y, vy: 0 },
    ai: { x: 160, y: GROUND_Y, vy: 0 },
    racketH: 110,
    serveFromRight: true,
    servePhase: false,
    serveStartTs: 0,
    servedAdjusted: false,
    lastHitter: null as null | 'you' | 'ai',
    crossedSinceHit: true,
    prevShuttleX: NET_X - 200,
    swingUntil: 0,
    hitCooldownUntil: 0,
  })

  const resetRally = useCallback((serveFromRight: boolean) => {
    // Serve high clear from serving side across the net with brief net-collision protection
    const startX = NET_X + (serveFromRight ? 280 : -280)
    const vx = serveFromRight ? -360 : 360
    stateRef.current.shuttle.p = { x: startX, y: GROUND_Y - 220 }
    stateRef.current.shuttle.v = { x: vx, y: -640 }
    stateRef.current.serveFromRight = serveFromRight
    stateRef.current.servePhase = true
    stateRef.current.serveStartTs = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    stateRef.current.servedAdjusted = false
    stateRef.current.lastHitter = null
    stateRef.current.crossedSinceHit = true
    stateRef.current.prevShuttleX = stateRef.current.shuttle.p.x
    setMessage('')
    // Debug
    console.debug('[RALLY] reset', { serveFromRight, start: { ...stateRef.current.shuttle } })
  }, [])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const playThwack = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = audioCtxRef.current
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'square'; o.frequency.value = 320
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
      o.connect(g); g.connect(ctx.destination)
      o.start(); o.stop(ctx.currentTime + 0.09)
    } catch {}
  }, [])

  

  const lastConceptRef = useRef<string | null>(null)
  const hitShuttle = useCallback((side: 'you' | 'ai', style?: 'clear'|'drop'|'smash') => {
    const s = stateRef.current
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    // Cooldown: prevent immediate re-hits from same frame range
    if (now < s.hitCooldownUntil) return
    // Double touch soft rule: ignore second hits until the shuttle crosses the net
    if (s.lastHitter === side && !s.crossedSinceHit) return
    const toLeft = side === 'you'
    const shot = style || (Math.random() < 0.2 ? 'drop' : Math.random() < 0.65 ? 'clear' : 'smash')
    let vx = 0, vy = 0
    if (shot === 'clear') { vx = (toLeft ? -1 : 1) * (360 + Math.random()*80); vy = -520 - Math.random()*160 }
    else if (shot === 'drop') { vx = (toLeft ? -1 : 1) * (250 + Math.random()*40); vy = -200 - Math.random()*80 }
    else { vx = (toLeft ? -1 : 1) * (420 + Math.random()*120); vy = 380 + Math.random()*120 }
    s.shuttle.v.x = vx; s.shuttle.v.y = vy
    // Net‑clear guarantee: adjust vertical so trajectory clears net top
    const dir = Math.sign(vx)
    const goingLeft = dir < 0
    const goingRight = dir > 0
    const willHeadToNet = (side === 'you' && goingLeft) || (side === 'ai' && goingRight)
    if (willHeadToNet && Math.abs(vx) > 40) {
      const dx = NET_X - s.shuttle.p.x
      const t = Math.abs(dx / vx)
      // Approx y at net crossing (drag ignored for estimate)
      const yAtNet = s.shuttle.p.y + s.shuttle.v.y * t + 0.5 * s.gravity * t * t
      const margin = 14
      if (yAtNet > NET_TOP_Y - margin) {
        // Add lift proportional to shortfall to ensure clearance
        const shortfall = yAtNet - (NET_TOP_Y - margin)
        s.shuttle.v.y -= Math.min(480, 220 + shortfall * 3)
      }
    }
    playThwack()
    // Avoid immediate repetition in concept stream
    let c = randConcept();
    if (lastConceptRef.current === c) c = randConcept()
    lastConceptRef.current = c
    setConcept(c)
    setBook(b => [...b, { kind: 'concept', text: c }])
    console.debug('[HIT]', { side, shot, pos: { ...s.shuttle.p }, vel: { ...s.shuttle.v } })
    s.lastHitter = side
    s.crossedSinceHit = false
    s.hitCooldownUntil = now + 220
    if (side === 'you') {
      stateRef.current.swingUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 180
    }
  }, [playThwack])

  // Immediate-hit helper: on press/click, try to strike right away (declared after hitShuttle to avoid TDZ)
  const directPlayerHit = useCallback(() => {
    const s = stateRef.current
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    if (now < s.hitCooldownUntil) return
    // Only attempt on your half
    const youHead = { x: s.player.x + 8, y: s.player.y - s.racketH }
    const dx = s.shuttle.p.x - youHead.x
    const dy = s.shuttle.p.y - youHead.y
    const d2 = dx*dx + dy*dy
    if (s.shuttle.p.x <= NET_X + 4) return
    // More generous radius for immediate tap hit
    if (d2 > 110*110) return
    // Choose style by height: high->smash, low/below net->clear, else drop
    let style: 'clear'|'drop'|'smash' = 'drop'
    if (s.shuttle.p.y < NET_TOP_Y - 20) style = 'smash'
    else if (s.shuttle.p.y > NET_TOP_Y - 20) style = 'clear'
    hitShuttle('you', style)
  }, [hitShuttle])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    let last = performance.now()
    let animId: number | null = null

    const loop = () => {
      if (isPaused || levelOverlay?.show) { animId = requestAnimationFrame(loop); return }
      const now = performance.now()
      const dt = Math.min(1/30, (now - last) / 1000)
      last = now
      const s = stateRef.current

      // Predict landing x on AI side with simple lookahead
      const targetX = Math.min(NET_X - 60, Math.max(60, s.shuttle.p.x - s.shuttle.v.x * 0.27))
      const aiSpeed = level.aiSpeed
      if (s.ai.x < targetX) s.ai.x = Math.min(targetX, s.ai.x + aiSpeed * dt)
      else if (s.ai.x > targetX) s.ai.x = Math.max(targetX, s.ai.x - aiSpeed * dt)
      s.ai.y = GROUND_Y

      // Player easing—position follows mouse/touch aimX (more responsive)
      if ((window as any)._aimX != null) {
        const aimX = (window as any)._aimX as number
        s.player.x = Math.max(NET_X + 60, Math.min(W - 60, s.player.x + (aimX - s.player.x) * 24 * dt))
      }
      if ((window as any)._aimY != null) {
        const aimY = (window as any)._aimY as number
        const minY = NET_TOP_Y + 20, maxY = GROUND_Y
        s.player.y = Math.max(minY, Math.min(maxY, s.player.y + (aimY - s.player.y) * 24 * dt))
      }

      // Serve Assist: auto-aim to clear net based on current trajectory and racket height
      if (s.servePhase && !s.servedAdjusted) {
        const dir = Math.sign(s.shuttle.v.x)
        const goingRight = dir > 0
        const targetX = NET_X
        const dx = targetX - s.shuttle.p.x
        const willCross = (goingRight && dx > 0) || (!goingRight && dx < 0)
        if (willCross && Math.abs(s.shuttle.v.x) > 50) {
          const t = Math.abs(dx / s.shuttle.v.x)
          // Simple parabola approximation ignoring drag for the check
          const yAtNet = s.shuttle.p.y + s.shuttle.v.y * t + 0.5 * s.gravity * t * t
          if (yAtNet > NET_TOP_Y - 12) {
            s.shuttle.v.y -= 220 // give it lift to clear
          }
          s.servedAdjusted = true
        }
      }

      // Shuttle aero: heavier on descent, high drag
      s.shuttle.v.y += s.gravity * dt
      s.shuttle.v.x *= s.drag
      s.shuttle.v.y *= (s.shuttle.v.y < 0 ? 0.992 : 0.978)
      s.shuttle.p.x += s.shuttle.v.x * dt
      s.shuttle.p.y += s.shuttle.v.y * dt

      // Track net cross since last hit
      const px = s.prevShuttleX
      const cx = s.shuttle.p.x
      if ((px <= NET_X && cx > NET_X) || (px >= NET_X && cx < NET_X)) {
        s.crossedSinceHit = true
        s.servePhase = false
      }
      s.prevShuttleX = cx

      // Net collision: only if below net top and not in serve protection
      const nowTs = (typeof performance !== 'undefined' ? performance.now() : Date.now())
      const inServeProtect = s.servePhase && (nowTs - s.serveStartTs) < 600
      if (!inServeProtect && s.shuttle.p.y > NET_TOP_Y && s.shuttle.p.y < GROUND_Y && Math.abs(s.shuttle.p.x - NET_X) < 6) {
        s.shuttle.v.x *= -0.4
        s.shuttle.p.x = s.shuttle.v.x > 0 ? NET_X + 7 : NET_X - 7
      }

      // Floor on each side (lose rally). Award point and check game over / next level
      if (s.shuttle.p.y > GROUND_Y) {
        if (s.shuttle.p.x > NET_X) {
          // your side floor -> AI gets point; AI serves next (from left)
          setScore(p => ({ ...p, ai: p.ai + 1 })); console.debug('[POINT] AI', { score }); resetRally(false)
        } else {
          // AI side floor -> You get point; you serve next (from right)
          setScore(p => ({ ...p, you: p.you + 1 })); console.debug('[POINT] YOU', { score }); resetRally(true)
        }
      }

      const youHead = { x: s.player.x + 8, y: s.player.y - s.racketH }
      const aiHead = { x: s.ai.x + 8, y: s.ai.y - s.racketH }

      // AI auto return
      if (s.shuttle.p.x < NET_X - 10) {
        const dx = s.shuttle.p.x - aiHead.x
        const dy = s.shuttle.p.y - aiHead.y
        const d2 = dx*dx + dy*dy
        if (d2 < 44*44 && s.shuttle.v.x < 150) {
          // Mix shots by level, bias to smash when high
          let style: 'clear'|'drop'|'smash' = 'clear'
          if (s.shuttle.p.y < H/2) style = 'smash'
          else {
            const r = Math.random(); const mix = level.aiShotMix
            if (r < mix.clear) style = 'clear'
            else if (r < mix.clear + mix.drop) style = 'drop'
            else style = 'smash'
          }
          hitShuttle('ai', style as any)
        }
      }

      // Player contact: require press/grace; allow hit when under shuttle or within radius
      if (s.shuttle.p.x > NET_X + 4) {
        const dx = s.shuttle.p.x - youHead.x
        const dy = s.shuttle.p.y - youHead.y
        const d2 = dx*dx + dy*dy
        const pressing = !!(window as any)._press
        const nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now())
        const swingActive = pressing || nowMs < stateRef.current.swingUntil
        const withinX = Math.abs(dx) < 120
        const racketBelow = youHead.y >= s.shuttle.p.y - 8 // under or just behind the shuttle
        const closeCircle = d2 < (pressing ? 110*110 : 100*100)

        if (swingActive && ((withinX && racketBelow) || closeCircle)) {
          // Choose shot deterministically by height: smash high, clear low/below, drop mid
          let style: 'clear'|'drop'|'smash' = 'drop'
          if (s.shuttle.p.y < NET_TOP_Y - 12) style = 'smash'
          else if (s.shuttle.p.y > NET_TOP_Y - 12 || s.shuttle.p.y > GROUND_Y - 140) style = 'clear'
          hitShuttle('you', style)
          ;(window as any)._swing = false
        }
      }

      // Draw
      ctx.clearRect(0,0,W,H)
      // court
      ctx.fillStyle = '#0d402b'; ctx.fillRect(0,0,W,H)
      ctx.fillStyle = '#1a5e3f'; ctx.fillRect(0,GROUND_Y,W,H-GROUND_Y)
      // net
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(NET_X-3, NET_TOP_Y, 6, GROUND_Y - NET_TOP_Y)
      // ground line
      ctx.fillStyle = '#93c5fd'; ctx.fillRect(0,GROUND_Y, W, 2)
      const drawRacket = (x:number, y:number, color:string) => {
        ctx.save()
        ctx.translate(x, y)
        // Handle
        ctx.fillStyle = '#3b3b3b'
        ctx.fillRect(-4, -10, 8, 60)
        // Throat
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-10, -30); ctx.lineTo(10, -30); ctx.closePath(); ctx.fillStyle = '#555'; ctx.fill()
        // Head (oval)
        ctx.beginPath()
        ctx.ellipse(0, -60, 28, 36, 0, 0, Math.PI*2)
        ctx.fillStyle = color
        ctx.fill()
        // Strings
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1
        for (let i=-20;i<=20;i+=6){ ctx.beginPath(); ctx.moveTo(-24, -60+i); ctx.lineTo(24, -60+i); ctx.stroke() }
        for (let i=-24;i<=24;i+=6){ ctx.beginPath(); ctx.moveTo(i, -84); ctx.lineTo(i, -36); ctx.stroke() }
        ctx.restore()
      }
      const drawShuttle = (x:number, y:number) => {
        ctx.save(); ctx.translate(x, y)
        // Cork
        ctx.fillStyle = '#fdf2b8'; ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill()
        // Skirt (feathers)
        ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2
        for (let a=-Math.PI*0.75; a<= -Math.PI*0.25; a+=Math.PI/12){
          ctx.beginPath();
          ctx.moveTo(Math.cos(a)*6, Math.sin(a)*6)
          ctx.lineTo(Math.cos(a)*18, Math.sin(a)*18)
          ctx.stroke()
        }
        ctx.restore()
      }
      // In-range glow around shuttle (player)
      {
        const dx = s.shuttle.p.x - youHead.x
        const dy = s.shuttle.p.y - youHead.y
        const d2 = dx*dx + dy*dy
        if (s.shuttle.p.x > NET_X + 4 && d2 < 80*80) {
          ctx.save()
          const pulse = (Math.sin(now/120)+1)/2
          ctx.beginPath(); ctx.arc(s.shuttle.p.x, s.shuttle.p.y, 18 + pulse*6, 0, Math.PI*2)
          ctx.strokeStyle = `rgba(144, 238, 144, ${0.5 + 0.3*pulse})`
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.restore()
        }
      }
      // draw sprites
      // Swing arc animation when swinging
      const pressing = !!(window as any)._press
      const nowMs2 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
      const swingActive2 = pressing || nowMs2 < stateRef.current.swingUntil
      if (swingActive2) {
        ctx.save(); ctx.translate(youHead.x, youHead.y + s.racketH)
        ctx.strokeStyle = 'rgba(255,255,0,0.8)'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(0, -60, 40, Math.PI*0.15, Math.PI*0.85)
        ctx.stroke(); ctx.restore()
      }
      drawRacket(youHead.x, youHead.y + s.racketH, '#1e3a8a')
      drawRacket(aiHead.x, aiHead.y + s.racketH, '#7f1d1d')
      drawShuttle(s.shuttle.p.x, s.shuttle.p.y)

      if (running) animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => { if (animId != null) cancelAnimationFrame(animId) }
  }, [running, isPaused, levelOverlay])

  // Input: mouse/touch move X/Y; press/hold to power swing
  useEffect(() => {
    const move = (x: number, y: number) => { (window as any)._aimX = x; (window as any)._aimY = y }
    const press = (p: boolean) => { (window as any)._press = p }
    const swing = () => { (window as any)._swing = true; press(true); setTimeout(()=>press(false), 120) }
    const onMouseMove = (e: MouseEvent) => move(e.offsetX, e.offsetY)
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); if (e.touches[0]) move((e.touches[0].clientX / window.innerWidth) * W, (e.touches[0].clientY / window.innerHeight) * H) }
    const onKey = (e: KeyboardEvent) => {
      const overlayActive = isPaused || !!levelOverlay?.show
      if (e.code === 'Space') {
        if (overlayActive) return
        swing(); directPlayerHit()
      }
      if (e.code === 'KeyP') setIsPaused(true)
      if (e.code === 'KeyR') setIsPaused(false)
      if (overlayActive && e.code === 'ArrowLeft') {
        if (page > 0) { setFlipDir('left'); setTimeout(() => { setPage(p => Math.max(0, p-1)); setFlipDir(null) }, 180) }
      }
      if (overlayActive && e.code === 'ArrowRight') {
        if (page < book.length-1) { setFlipDir('right'); setTimeout(() => { setPage(p => Math.min(book.length-1, p+1)); setFlipDir(null) }, 180) }
      }
    }
    const onPointerDown = () => { if (isPaused || levelOverlay?.show) return; press(true) }
    const onPointerUp = () => press(false)
    const c = canvasRef.current!
    c.addEventListener('mousemove', onMouseMove)
    c.addEventListener('touchmove', onTouchMove, { passive: false })
    const handleMouseDown = () => { onPointerDown(); if (!(isPaused || levelOverlay?.show)) directPlayerHit() }
    c.addEventListener('mousedown', handleMouseDown)
    c.addEventListener('mouseup', onPointerUp)
    const handleTouchStart = (e: TouchEvent) => { e.preventDefault(); onPointerDown(); if (!(isPaused || levelOverlay?.show)) directPlayerHit() }
    c.addEventListener('touchstart', handleTouchStart, { passive: false })
    c.addEventListener('touchend', (e)=>{ e.preventDefault(); onPointerUp() }, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      c.removeEventListener('mousemove', onMouseMove)
      c.removeEventListener('touchmove', onTouchMove)
      c.removeEventListener('mousedown', handleMouseDown)
      c.removeEventListener('mouseup', onPointerUp)
      c.removeEventListener('touchstart', handleTouchStart as any)
      c.removeEventListener('touchend', (e)=>{ e.preventDefault(); onPointerUp() })
      window.removeEventListener('keydown', onKey)
    }
  }, [book.length, isPaused, levelOverlay, page])

  // Watch score to enforce 21-point games and multi-level progression
  useEffect(() => {
    if (score.you >= GAME_POINT || score.ai >= GAME_POINT) {
      if (score.you > score.ai) {
        const final = `Game won ${score.you}-${score.ai}`
        setMessage(final)
        if (levelIndex < LEVELS.length - 1) {
          setLevelOverlay({ show: true, text: final + `\nLevel ${LEVELS[levelIndex].id} complete!` })
        } else {
          setLevelOverlay({ show: true, text: 'Match won! 🎉' })
        }
      } else {
        const final = `Game lost ${score.ai}-${score.you}. Try again.`
        setMessage(final)
        setLevelOverlay({ show: true, text: final })
      }
    }
  }, [score.you, score.ai, levelIndex])

  const advanceLevel = useCallback(() => {
    if (!levelOverlay) return
    setLevelOverlay(null)
    if (score.you > score.ai && levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1)
    }
    setScore({ you: 0, ai: 0 })
    resetRally(true)
  }, [levelIndex, levelOverlay, resetRally, score.you, score.ai])

  return (
    <div className="app">
      <canvas ref={canvasRef} width={W} height={H} />
      <div className="hud">
        <div className="card">Level {level.id}/{LEVELS.length} • To {GAME_POINT} • Score: You {score.you} – AI {score.ai}</div>
        <div className="card">Move finger/mouse to position racket (X,Y). Press/hold to power swing.</div>
      </div>
      {message && <div className="concept">{message}</div>}
      {concept && <div className="concept">{concept}</div>}
      <div className="controls">
        <button className="btn" onClick={() => setRunning(r => !r)}>{running ? 'Pause' : 'Resume'}</button>
        <button className="btn" onClick={() => setConcept(randConcept())}>Random Concept</button>
        <button className="btn" onClick={() => setIsPaused(true)}>Open Knowledge Book (P)</button>
      </div>
      {(isPaused || levelOverlay?.show) && (
        <div className="book-overlay" onClick={() => setIsPaused(false)}>
          <div className="book-panel" onClick={(e)=>e.stopPropagation()}>
            {levelOverlay?.show ? (
              <div className="book-content">
                <div className="level-panel">
                  <h2>{levelOverlay.text.split('\n')[0]}</h2>
                  {levelOverlay.text.split('\n')[1] && <p>{levelOverlay.text.split('\n')[1]}</p>}
                  <div className="level-actions">
                    <button className="btn" onClick={advanceLevel}>{score.you > score.ai && levelIndex < LEVELS.length - 1 ? 'Next Level ▶' : 'Play Again'}</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="book-header">
                  <strong>Quantum Knowledge Book</strong>
                  <div>
                    <button className="btn" onClick={() => { setFlipDir('left'); setTimeout(()=>{ setPage(p => Math.max(0, p-1)); setFlipDir(null) }, 180) }}>◀ Prev</button>
                    <button className="btn" onClick={() => { setFlipDir('right'); setTimeout(()=>{ setPage(p => Math.min(book.length-1, p+1)); setFlipDir(null) }, 180) }}>Next ▶</button>
                    <button className="btn" onClick={() => setIsPaused(false)}>Resume (R)</button>
                  </div>
                </div>
                <div className="book-content">
                  {book.length === 0 ? (
                    <div className="book-empty">No entries yet — rally to collect quantum concepts. Use Arrow keys to flip pages.</div>
                  ) : (
                    <div className="book-pages">
                      <div className={"page" + (flipDir === 'left' ? ' flip-left' : flipDir === 'right' ? ' flip-right' : '')}>
                        <h4>Page {page+1}</h4>
                        <div className="book-text">{book[page]?.text}</div>
                      </div>
                      <div className={"page" + (flipDir === 'right' ? ' flip-right' : flipDir === 'left' ? ' flip-left' : '')}>
                        <h4>Page {Math.min(book.length, page+2)}</h4>
                        <div className="book-text">{book[Math.min(book.length-1, page+1)]?.text || '—'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
