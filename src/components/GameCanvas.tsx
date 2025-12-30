/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Ball, Batsman, Bat, Stumps, GameState, ShotDirection, AssetsLoaded } from '../types';
import {
    PITCH_COLOR, FIELD_COLOR, STUMPS_COLOR, BALL_FALLBACK_COLOR, BAT_FALLBACK_COLOR, BATSMAN_FALLBACK_COLOR, CREASE_COLOR,
    BALL_RADIUS, BALL_SPRITE_DISPLAY_WIDTH,
    STUMPS_HEIGHT, STUMPS_WIDTH, NUM_STUMPS, STUMP_GAP,
    BAT_SPRITE_DISPLAY_WIDTH, BAT_SPRITE_DISPLAY_HEIGHT, BATSMAN_SPRITE_DISPLAY_WIDTH, BATSMAN_SPRITE_DISPLAY_HEIGHT,
    FALLBACK_BAT_WIDTH, FALLBACK_BAT_HEIGHT, FALLBACK_BATSMAN_WIDTH, FALLBACK_BATSMAN_HEIGHT,
    CANVAS_WIDTH, CANVAS_HEIGHT, BAT_VISUAL_OFFSET_X, TRAIL_LENGTH, FIELDER_COLOR, FIELDER_RADIUS
} from '../constants';

interface GameCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    ball: Ball | null;
    batsman: Batsman | null;
    bat: Bat | null;
    stumps: Stumps | null;
    gameState: GameState;
    shotDirection: ShotDirection;
    assetsLoaded: AssetsLoaded;
    batImage: HTMLImageElement;
    batsmanImage: HTMLImageElement;
    ballImage: HTMLImageElement;
    grassImage: HTMLImageElement;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, batsman, bat, stumps, gameState, shotDirection,
    assetsLoaded, batImage, batsmanImage, ballImage, grassImage
}) => {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial size

        return () => window.removeEventListener('resize', handleResize);
    }, [canvasRef]);


    useEffect(() => {
        if (canvasRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d');
        }
    }, [canvasRef]);

    // Drawing functions, now internal to GameCanvas
    const drawField = (ctx: CanvasRenderingContext2D, cGrassImage: HTMLImageElement) => {
        const grassPatternReady = assetsLoaded.grass && cGrassImage.complete && cGrassImage.naturalWidth > 0;
        if (grassPatternReady) {
            const pattern = ctx.createPattern(cGrassImage, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
            } else {
                ctx.fillStyle = FIELD_COLOR; // Fallback
            }
        } else {
            ctx.fillStyle = FIELD_COLOR;
        }
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const drawPitch = (ctx: CanvasRenderingContext2D, cStumps: Stumps | null) => {
        // Fallback stumps position so pitch/creases always render
        const s: Stumps = cStumps ?? {
            x: CANVAS_WIDTH / 2 - (NUM_STUMPS * STUMPS_WIDTH + (NUM_STUMPS - 1) * STUMP_GAP) / 2,
            y: CANVAS_HEIGHT / 2 - STUMPS_HEIGHT / 2,
            width: STUMPS_WIDTH,
            height: STUMPS_HEIGHT,
            hit: false
        };

        const pX = CANVAS_WIDTH * 0.2;
        const pW = CANVAS_WIDTH * 0.6;
        const pY = 50;
        const pH = CANVAS_HEIGHT - 100;

        // Draw the brown pitch rectangle first
        ctx.fillStyle = PITCH_COLOR;
        ctx.fillRect(pX, pY, pW, pH);

        // Then draw the white crease lines on top
        ctx.strokeStyle = CREASE_COLOR;
        ctx.lineWidth = 2;
        const popY = s.y + STUMPS_HEIGHT + 5;
        ctx.beginPath(); ctx.moveTo(pX, popY); ctx.lineTo(pX + pW, popY); ctx.stroke();
        const retL = 80;
        ctx.beginPath(); ctx.moveTo(pX, popY); ctx.lineTo(pX, popY + retL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pX + pW, popY); ctx.lineTo(pX + pW, popY + retL); ctx.stroke();
        const bowlY = CANVAS_HEIGHT - (s.y + STUMPS_HEIGHT + 5);
        ctx.beginPath(); ctx.moveTo(pX, bowlY); ctx.lineTo(pX + pW, bowlY); ctx.stroke();
    };

    const drawStumps = (ctx: CanvasRenderingContext2D, cStumps: Stumps | null) => {
        const s: Stumps = cStumps ?? {
            x: CANVAS_WIDTH / 2 - (NUM_STUMPS * STUMPS_WIDTH + (NUM_STUMPS - 1) * STUMP_GAP) / 2,
            y: CANVAS_HEIGHT / 2 - STUMPS_HEIGHT / 2,
            width: STUMPS_WIDTH,
            height: STUMPS_HEIGHT,
            hit: false
        };
        ctx.fillStyle = s.hit ? '#FF6347' : STUMPS_COLOR; // Tomato for hit
        for (let i = 0; i < NUM_STUMPS; i++) {
            ctx.fillRect(s.x + i * (STUMPS_WIDTH + STUMP_GAP), s.y, STUMPS_WIDTH, STUMPS_HEIGHT);
        }
        if (!s.hit) { // Draw bails if not hit
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + (NUM_STUMPS * STUMPS_WIDTH + (NUM_STUMPS - 1) * STUMP_GAP) - STUMPS_WIDTH, s.y);
            ctx.strokeStyle = STUMPS_COLOR;
            ctx.lineWidth = 3; // Make bails slightly thicker
            ctx.stroke();
        }
    };

    const drawBatsman = (ctx: CanvasRenderingContext2D, cBatsman: Batsman | null, cBat: Bat | null, cShotDir: ShotDirection) => {
        // If missing, use fallback shapes/positions so player always sees a batsman
        const bX = (cBatsman?.x ?? CANVAS_WIDTH / 2);
        const bY = (cBatsman?.y ?? 80);
        const batsmanSpriteReady = assetsLoaded.batsman && batsmanImage.complete && batsmanImage.naturalWidth > 0;
        const batSpriteReady = assetsLoaded.bat && batImage.complete && batImage.naturalWidth > 0;

        const currentBatsmanWidth = batsmanSpriteReady ? BATSMAN_SPRITE_DISPLAY_WIDTH : FALLBACK_BATSMAN_WIDTH;
        const currentBatsmanHeight = batsmanSpriteReady ? BATSMAN_SPRITE_DISPLAY_HEIGHT : FALLBACK_BATSMAN_HEIGHT;

        if (batsmanSpriteReady) {
            ctx.drawImage(batsmanImage, bX - currentBatsmanWidth / 2, bY - currentBatsmanHeight / 2, currentBatsmanWidth, currentBatsmanHeight);
        } else {
            ctx.fillStyle = BATSMAN_FALLBACK_COLOR;
            ctx.fillRect(bX - currentBatsmanWidth / 2, bY - currentBatsmanHeight / 2, currentBatsmanWidth, currentBatsmanHeight);
        }

        ctx.save();
        ctx.translate(bX + BAT_VISUAL_OFFSET_X, bY);
        let angle = 0;
        if (cBat?.swinging) {
            angle = cBat.swingAngle;
        } else {
            if (cShotDir === 'LEG') angle = Math.PI / 10;
            else if (cShotDir === 'OFF') angle = -Math.PI / 10;
        }
        ctx.rotate(angle);

        const batVisualOffsetY = (BATSMAN_SPRITE_DISPLAY_HEIGHT / 2) - 25; // Bat position relative to batsman sprite center
        const currentBatDisplayWidth = batSpriteReady ? BAT_SPRITE_DISPLAY_WIDTH : FALLBACK_BAT_WIDTH;
        const currentBatDisplayHeight = batSpriteReady ? BAT_SPRITE_DISPLAY_HEIGHT : FALLBACK_BAT_HEIGHT;

        if (batSpriteReady) {
            ctx.drawImage(batImage, -currentBatDisplayWidth / 2, batVisualOffsetY - currentBatDisplayHeight / 2, currentBatDisplayWidth, currentBatDisplayHeight);
        } else {
            ctx.fillStyle = BAT_FALLBACK_COLOR;
            ctx.fillRect(-currentBatDisplayWidth / 2, batVisualOffsetY - currentBatDisplayHeight / 2, currentBatDisplayWidth, currentBatDisplayHeight);
        }
        ctx.restore();
    };

    const drawBall = (ctx: CanvasRenderingContext2D, cBall: Ball | null) => {
        if (!cBall) return;
        const ballSpriteReady = assetsLoaded.ball && ballImage.complete && ballImage.naturalWidth > 0;
        
        // --- Draw Shadow (only when in the air) ---
        if (cBall.z > 0) {
            const shadowOpacity = Math.max(0, 0.4 - cBall.z / 150);
            const shadowRadius = Math.max(1, cBall.radius - cBall.z / 15);
            const shadowY = cBall.y + cBall.radius; // Shadow is on the "ground"
            if (shadowRadius > 0) {
                ctx.beginPath();
                ctx.ellipse(cBall.x, shadowY, shadowRadius * 1.5, shadowRadius * 0.7, 0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
                ctx.fill();
            }
        }

        // --- Draw Trail ---
        if (gameState === 'BALL_IN_PLAY' && cBall.trail) {
            cBall.trail.forEach((p, index) => {
                const trailProgress = index / TRAIL_LENGTH;
                const opacity = trailProgress * 0.5; // Trail is semi-transparent
                const radius = p.radius * trailProgress;
                if (radius > 0.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y - p.z, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                }
            });
        }
        
        // --- Draw Ball ---
        const visualRadius = BALL_RADIUS + cBall.z * 0.5;
        const visualY = cBall.y - cBall.z;
        const displaySize = Math.max(BALL_SPRITE_DISPLAY_WIDTH, visualRadius * 2);

        if (ballSpriteReady) {
            ctx.drawImage(ballImage, cBall.x - displaySize / 2, visualY - displaySize / 2, displaySize, displaySize);
        } else {
            ctx.beginPath();
            ctx.arc(cBall.x, visualY, visualRadius, 0, Math.PI * 2);
            ctx.fillStyle = BALL_FALLBACK_COLOR;
            ctx.fill();
            ctx.closePath();
        }
    };

    const drawBowlerRunUp = (ctx: CanvasRenderingContext2D, gameState: GameState, tick: number) => {
        if (gameState !== 'BOWLING') return;
        // simple stick-figure at top running in place
        const baseX = CANVAS_WIDTH / 2;
        const baseY = CANVAS_HEIGHT - 30; // far end
        const phase = Math.sin(tick / 120);
        ctx.save();
        ctx.translate(baseX, baseY);
        ctx.fillStyle = '#111';
        // legs
        ctx.fillRect(-2 + phase * 1, 4, 3, 10);
        ctx.fillRect(1 - phase * 1, 4, 3, 10);
        // body
        ctx.fillRect(-2, -6, 4, 12);
        // head
        ctx.beginPath(); ctx.arc(0, -12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    const drawFielders = (ctx: CanvasRenderingContext2D, tick: number) => {
        // Draw small player-shaped markers so they read as fielders, not tiny dots
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2 + 40;
        const baseR = CANVAS_WIDTH * 0.35;
        const count = 8;
        for (let i = 0; i < count; i++) {
            const baseAng = (Math.PI * 2 * i) / count + Math.PI / 12;
            const wobble = Math.sin(tick / 600 + i) * 6;
            const r = baseR + wobble;
            const x = centerX + r * Math.cos(baseAng);
            const y = centerY + r * Math.sin(baseAng);
            // body
            ctx.fillStyle = FIELDER_COLOR;
            ctx.fillRect(x - 4, y - 10, 8, 14);
            // head
            ctx.beginPath();
            ctx.arc(x, y - 14, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        // Always draw, even if assets aren't fully loaded (fallbacks handle it)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawField(ctx, grassImage);
        const gameAreaXOffset = (canvas.width - CANVAS_WIDTH) / 2;
        const gameAreaYOffset = (canvas.height - CANVAS_HEIGHT) / 2; // Center vertically

        ctx.save();
        ctx.translate(gameAreaXOffset, gameAreaYOffset);

        // --- Draw elements within the virtual game area ---
        drawPitch(ctx, stumps);
        const now = performance.now();
        drawFielders(ctx, now);
        drawBowlerRunUp(ctx, gameState, now);
        drawStumps(ctx, stumps);
        drawBatsman(ctx, batsman, bat, shotDirection);

        // Draw ball only when it's part of the core bowling/hitting action
        if (ball && (gameState === 'BOWLING' || gameState === 'HITTING')) {
            drawBall(ctx, ball);
        }
        
        ctx.restore();
        
        // --- Draw elements in screen space (like the ball in play) ---
        if (ball && (gameState === 'BALL_IN_PLAY' || gameState === 'BALL_DEAD' || gameState === 'OUT')) {
            // Translate the ball's and its trail's virtual coordinates to screen coordinates
            const screenSpaceBall = {
                ...ball,
                x: ball.x + gameAreaXOffset,
                y: ball.y + gameAreaYOffset,
                trail: ball.trail.map(p => ({
                    ...p,
                    x: p.x + gameAreaXOffset,
                    y: p.y + gameAreaYOffset,
                })),
            };
            drawBall(ctx, screenSpaceBall);
        }


    }, [ball, batsman, bat, stumps, gameState, shotDirection, assetsLoaded, batImage, batsmanImage, ballImage, grassImage, canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            aria-label="Cricket game animation"
        />
    );
};

export default GameCanvas;
