/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ShotDirection, Ball, Batsman, Bat, Stumps, GameContextForCommentary, AssetsLoaded, TutorialStep, BookEntry } from '../types';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, MIN_BALL_SPEED_Y, MAX_BALL_SPEED_Y,
    NUM_STUMPS, STUMPS_WIDTH, STUMP_GAP, BATSMAN_SPRITE_DISPLAY_HEIGHT, STUMPS_HEIGHT,
    BAT_VISUAL_OFFSET_X, BAT_SPRITE_DISPLAY_WIDTH, FALLBACK_BAT_WIDTH, BAT_SPRITE_DISPLAY_HEIGHT,
    GRAVITY, BOUNCE_FACTOR, TRAIL_LENGTH, BALL_RADIUS
} from '../constants';
import { LEVELS } from '../data/gameContent';
import { loadSectionContent, SectionContent } from '../data/sectionContent';
import { QUANTUM_ANTI } from '../data/quantumAnti';
import { loadLessons } from '../data/lessons';

const MAX_COMMENTARY_WAIT_MS = 7000; 

type UseGameEngineProps = {
    assets: {
        assetsLoaded: AssetsLoaded;
        batHitSoundRef: React.RefObject<HTMLAudioElement>;
        wicketSoundRef: React.RefObject<HTMLAudioElement>;
    };
    commentary: {
        isAudioPlayingRef: React.RefObject<boolean>;
        pendingNextBallActionRef: React.RefObject<(() => void) | null>;
        safetyNetNextBallTimeoutRef: React.RefObject<number | null>;
        initLiveSession: () => Promise<void>;
        triggerDynamicCommentary: (context: GameContextForCommentary) => Promise<boolean>;
    };
};

export function useGameEngine({ assets, commentary }: UseGameEngineProps) {
    // Game State
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const currentLevel = LEVELS[currentLevelIndex];

    const [score, setScore] = useState(0);
    const [toWin, setToWin] = useState(currentLevel.targetScore);
    const [targetScore, setTargetScore] = useState(currentLevel.targetScore);
    const [ballsBowled, setBallsBowled] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [maxWickets, setMaxWickets] = useState(currentLevel.maxWickets); // Dynamic per level
    
    const [currentGameState, setCurrentGameState] = useState<GameState>('LOADING');
    const [message, setMessage] = useState("Loading Assets...");
    const [shotDirection, setShotDirection] = useState<ShotDirection>('STRAIGHT');
    const [impactEffectText, setImpactEffectText] = useState("");
    const [showImpactEffect, setShowImpactEffect] = useState(false);
    const [tutorialStep, setTutorialStep] = useState<TutorialStep>('NONE');
    
    // Knowledge Book state
    const [bookEntries, setBookEntries] = useState<BookEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const prevStateRef = useRef<GameState | null>(null);
    
    // New: Concept display and lesson strings
    const [activeConcept, setActiveConcept] = useState<string | null>(null);
    const lessonsRef = useRef<{ hits: string[]; badPractices: string[] }>({ hits: [], badPractices: [] });
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const sectionContentRef = useRef<SectionContent>({});

    // Game Elements
    const [ball, setBall] = useState<Ball | null>(null);
    const [batsman, setBatsman] = useState<Batsman | null>(null);
    const [bat, setBat] = useState<Bat | null>(null);
    const [stumps, setStumps] = useState<Stumps | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- Refs for State Access ---
    const stateRefs = useRef({ 
        score, targetScore, ballsBowled, wickets, currentGameState, shotDirection, 
        tutorialStep, ball, batsman, bat, stumps, assetsLoaded: assets.assetsLoaded, 
        currentLevelIndex, maxWickets, totalBalls: currentLevel.totalBalls 
    }).current;
    
    // Update refs on render
    Object.assign(stateRefs, { 
        score, targetScore, ballsBowled, wickets, currentGameState, shotDirection, 
        tutorialStep, ball, batsman, bat, stumps, assetsLoaded: assets.assetsLoaded, 
        currentLevelIndex, maxWickets, totalBalls: currentLevel.totalBalls 
    });

    // --- Refs for Timers ---
    const gameLoopIdRef = useRef<number | null>(null);
    const messageTimeoutIdRef = useRef<number | null>(null);
    const bowlTimeoutIdRef = useRef<number | null>(null);
    const nextBallTimeoutIdRef = useRef<number | null>(null);
    const isExecutingNextBallLogicRef = useRef(false);
    const deliveryContextRef = useRef<{ wasMiss?: boolean }>({});

    // --- UI & Message Functions ---
    const showAppMessage = useCallback((text: string, duration = 2000) => {
        setMessage(text);
        if (messageTimeoutIdRef.current) window.clearTimeout(messageTimeoutIdRef.current);
        if (duration > 0) messageTimeoutIdRef.current = window.setTimeout(() => setMessage(p => (p === text ? "" : p)), duration);
    }, []);

    const triggerImpactEffect = useCallback((text: string) => {
        setImpactEffectText(text);
        setShowImpactEffect(true);
        setTimeout(() => setShowImpactEffect(false), 1500);
    }, []);

    const getRandomConcept = useCallback(() => {
        // Force concepts to come from curated LEVEL content to avoid cross‑app bleed
        const level = LEVELS[stateRefs.currentLevelIndex];
        const list = level.concepts && level.concepts.length ? level.concepts : [level.description];
        const pick = list[Math.floor(Math.random() * list.length)];
        return `${level.title}: ${pick}`;
    }, [stateRefs.currentLevelIndex]);

    const getScoreMessage = useCallback((runs: number) => {
        // Quantum‑themed rotating messages (avoid external section data)
        const msgs = {
            six: [
                'Chakka! Massive amplitude amplification to the stands!',
                'Constructive interference — pure six!','Bloch vector hits the pole — six!',
                'Phase‑aligned wallop! Six!','Eigenvalue: 6 — measured clean!'
            ],
            four: [
                'Chauka! Sharp fringe right through cover!','Tidy superposition collapses to four!',
                'Brilliant boundary — coherence intact!','Four more — unitary and precise!'
            ],
            two: [
                'Run it back — nice two!','Amplitude split pays off — couple taken!','Measured advantage — two runs!'
            ],
            one: [
                'Rotate and refresh — single!','Small collapse, solid single!','Nudged for one — good control!'
            ],
            dot: [
                'Decohered outcome — dot ball.','Destructive interference — no run.','Quantum lull — dot.'
            ]
        } as const;
        const key = runs === 6 ? 'six' : runs === 4 ? 'four' : runs === 2 ? 'two' : runs === 1 ? 'one' : 'dot';
        const pool = (msgs as any)[key] as string[];
        if (!pool || !pool.length) return null;
        const i = Math.floor(Math.random() * pool.length);
        return `${LEVELS[stateRefs.currentLevelIndex].title} — ${pool[i]}`;
    }, [stateRefs.currentLevelIndex]);

    const getNextLesson = useCallback((kind: 'hits' | 'badPractices') => {
        const pool = lessonsRef.current[kind];
        if (!pool || pool.length === 0) return null;
        // rotate
        const item = pool.shift()!;
        pool.push(item);
        return item;
    }, []);

    // --- Game Element Initialization ---
    const initGameElements = useCallback(() => {
        deliveryContextRef.current = {};
        const newBatsmanData: Batsman = { x: CANVAS_WIDTH / 2, y: 80 };
        setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 38, z: 0, radius: 8, dx: 0, dy: 0, dz: 0, trail: [] });
        setBatsman(newBatsmanData);
        setBat({ swinging: false, swingAngle: 0, maxSwingAngle: Math.PI / 3.5 });
        setStumps({ x: CANVAS_WIDTH / 2 - (NUM_STUMPS * STUMPS_WIDTH + (NUM_STUMPS - 1) * STUMP_GAP) / 2, y: newBatsmanData.y + (BATSMAN_SPRITE_DISPLAY_HEIGHT / 2) - STUMPS_HEIGHT - 10, width: STUMPS_WIDTH, height: STUMPS_HEIGHT, hit: false });
        setActiveConcept(null);
    }, []);

    // moved below (after bowlLogic) to avoid TDZ issues

    // --- Logic to start a specific level ---
    // We declare bowlLogic first to avoid temporal dead zone when referenced in effects
    const bowlLogic = useCallback(() => {
        if (stateRefs.currentGameState !== 'READY') return;
        setCurrentGameState('BOWLING');
        deliveryContextRef.current = {};
        const randomSpeed = MIN_BALL_SPEED_Y + Math.random() * (MAX_BALL_SPEED_Y - MIN_BALL_SPEED_Y);
        setBall(prev => prev ? { ...prev, x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 40, y: CANVAS_HEIGHT - 38, z: 0, dz: 0, dx: 0, dy: -randomSpeed, trail: [] } : null);
        showAppMessage("Bowler running in...", 2000);
    }, [showAppMessage, stateRefs]);

    const startLevel = useCallback((levelIndex: number) => {
        const level = LEVELS[levelIndex];
        setCurrentLevelIndex(levelIndex);
        setScore(0);
        setToWin(level.targetScore);
        setBallsBowled(0);
        setWickets(0);
        setTargetScore(level.targetScore);
        setMaxWickets(level.maxWickets);
        // Keep Knowledge Book entries across levels so earlier notes remain accessible
        setCurrentPage(0);
        initGameElements();
        setCurrentGameState('READY');
        showAppMessage(`Level ${levelIndex + 1}: ${level.title}`, 3000);
        
        // Announce Level Start via Commentary
        commentary.triggerDynamicCommentary({ 
            event: "levelStart", 
            targetScore: level.targetScore, 
            totalBalls: level.totalBalls,
            currentLevelTitle: level.title 
        });

        bowlTimeoutIdRef.current = window.setTimeout(bowlLogic, 3000);
    }, [initGameElements, showAppMessage, commentary, bowlLogic]);

    const playerWasSelected = useCallback(() => {
        if (stateRefs.currentGameState === 'PLAYER_SELECT') {
            // Start the match immediately after selecting a player (skip tutorial to keep flow smooth)
            initGameElements();
            setCurrentGameState('READY');
            showAppMessage('Bowler is ready...', 0);
            if (bowlTimeoutIdRef.current) clearTimeout(bowlTimeoutIdRef.current);
            bowlTimeoutIdRef.current = window.setTimeout(bowlLogic, 1000);
        }
    }, [stateRefs, initGameElements, showAppMessage, bowlLogic]);


    // --- Game Flow Logic ---
    const gameOver = useCallback((finalState: typeof stateRefs) => {
        setCurrentGameState('GAME_OVER');
        deliveryContextRef.current = {};
        const context: GameContextForCommentary = {
            event: '', score: finalState.score, targetScore: finalState.targetScore,
            wickets: finalState.wickets, ballsBowled: finalState.ballsBowled, totalBalls: finalState.totalBalls,
        };
        
        // This is only called if we failed the level or it's the very last level and we finished
        if (finalState.wickets >= finalState.maxWickets) {
            showAppMessage(`Out! Try Level ${finalState.currentLevelIndex + 1} Again.`);
            context.event = "gameOverWickets";
            triggerImpactEffect("OUT!");
        } else {
            showAppMessage(`Overs Up! Level Failed.`);
            context.event = "gameOverBalls";
            triggerImpactEffect("FAILED!");
        }
        commentary.triggerDynamicCommentary(context);
    }, [commentary, showAppMessage, triggerImpactEffect]);
    
    
    const executeNextBallLogic = useCallback(async () => {
        if (isExecutingNextBallLogicRef.current) return;
        isExecutingNextBallLogicRef.current = true;

        if (bowlTimeoutIdRef.current) window.clearTimeout(bowlTimeoutIdRef.current);
        if (nextBallTimeoutIdRef.current) window.clearTimeout(nextBallTimeoutIdRef.current);
        if (commentary.safetyNetNextBallTimeoutRef.current) clearTimeout(commentary.safetyNetNextBallTimeoutRef.current);

        const latestState = stateRefs;
        if (latestState.currentGameState === 'GAME_OVER' || latestState.currentGameState === 'LEVEL_COMPLETE') {
            isExecutingNextBallLogicRef.current = false;
            return;
        }
        
        const { score, wickets, ballsBowled, targetScore, maxWickets, totalBalls, currentLevelIndex } = latestState;
        
        // Check for Win/Level Pass
        if (score >= targetScore) {
            // Level Passed!
            if (currentLevelIndex < LEVELS.length - 1) {
                // Next Level
                setCurrentGameState('LEVEL_COMPLETE');
                triggerImpactEffect("LEVEL UP!");
                assets.batHitSoundRef.current?.play(); // Celebrate
                commentary.triggerDynamicCommentary({
                    event: "levelWon",
                    score, targetScore, currentLevelTitle: LEVELS[currentLevelIndex].title
                });
            } else {
                // Game Won (Finished all levels)
                setCurrentGameState('GAME_OVER');
                showAppMessage("VISION ACHIEVED! YOU WON!", 5000);
                triggerImpactEffect("VICTORY!");
                commentary.triggerDynamicCommentary({ event: "gameWon", score, targetScore });
            }
        } 
        // Check for Loss
        else if (wickets >= maxWickets || ballsBowled >= totalBalls) {
            gameOver(latestState);
        } 
        // Continue Game
        else {
            setCurrentGameState('READY');
            initGameElements();
            showAppMessage("Bowler is ready...", 0);
            bowlTimeoutIdRef.current = window.setTimeout(bowlLogic, 1000 + Math.random() * 900);
        }
        isExecutingNextBallLogicRef.current = false;
    }, [gameOver, initGameElements, showAppMessage, commentary, stateRefs, bowlLogic, triggerImpactEffect, assets]);


    const scheduleNextBall = useCallback((delay: number) => {
        if (stateRefs.currentGameState === 'GAME_OVER' || stateRefs.currentGameState === 'LEVEL_COMPLETE' || stateRefs.currentGameState === 'PAUSED') return;
        if (nextBallTimeoutIdRef.current) clearTimeout(nextBallTimeoutIdRef.current);
        if (bowlTimeoutIdRef.current) clearTimeout(bowlTimeoutIdRef.current);
        if (commentary.safetyNetNextBallTimeoutRef.current) clearTimeout(commentary.safetyNetNextBallTimeoutRef.current);

        const action = () => { commentary.pendingNextBallActionRef.current = null; executeNextBallLogic(); };
        commentary.pendingNextBallActionRef.current = action;

        if (!commentary.isAudioPlayingRef.current) {
            nextBallTimeoutIdRef.current = window.setTimeout(action, delay);
        } else {
            commentary.safetyNetNextBallTimeoutRef.current = window.setTimeout(() => {
                if (commentary.pendingNextBallActionRef.current === action) action();
            }, MAX_COMMENTARY_WAIT_MS);
        }
    }, [stateRefs, commentary, executeNextBallLogic]);

    const bowlTutorialBall = useCallback(() => {
        if (stateRefs.currentGameState !== 'TUTORIAL' && stateRefs.tutorialStep !== 'SWING_PRACTICE') return;
        setCurrentGameState('BOWLING');
        deliveryContextRef.current = {};
        const tutorialSpeed = 3.5; 
        setBall(prev => prev ? { ...prev, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 38, z: 0, dz: 0, dx: 0, dy: -tutorialSpeed, trail: [] } : null);
        showAppMessage("Get ready to swing!", 2000);
    }, [showAppMessage, stateRefs]);

    const handleHit = useCallback(async () => {
        const { bat: cBt, ball: cBl, batsman: cBtsmn, shotDirection: cShtDir, assetsLoaded: cAssets, tutorialStep: cTutStep } = stateRefs;
        if (!cBt || !cBl || !cBtsmn) return;

        const isTutorial = cTutStep === 'SWING_PRACTICE';

        let vSF = 0; if (cShtDir === 'LEG') vSF = -1; else if (cShtDir === 'OFF') vSF = 1;
        setBat(p => p ? { ...p, swinging: true, swingAngle: vSF * p.maxSwingAngle } : null);
        window.setTimeout(() => setBat(p => p ? { ...p, swinging: false } : null), 200);

        const batSpriteReady = cAssets.bat;
        const batWidth = batSpriteReady ? BAT_SPRITE_DISPLAY_WIDTH * 2.8 : FALLBACK_BAT_WIDTH * 4.0;
        const batHeight = batSpriteReady ? BAT_SPRITE_DISPLAY_HEIGHT * 2.0 : 150;
        const batCenterX = cBtsmn.x + BAT_VISUAL_OFFSET_X;
        const batEffectiveY = cBtsmn.y;
        const batTop = batEffectiveY - (batHeight / 2);
        const batBottom = batEffectiveY + (batHeight / 2);
        const batLeft = batCenterX - (batWidth / 2);
        const batRight = batCenterX + (batWidth / 2);

        let hitMade = cBl.y + cBl.radius > batTop &&
            cBl.y - cBl.radius < batBottom &&
            cBl.x + cBl.radius > batLeft &&
            cBl.x - cBl.radius < batRight;

        deliveryContextRef.current = {};

        if (hitMade) {
            setCurrentGameState('BALL_IN_PLAY');
            assets.batHitSoundRef.current?.play();

            if (isTutorial) {
                showAppMessage("Great Shot!", 2000);
                triggerImpactEffect("NICE!");
                setBall(p => p ? { ...p, dx: (Math.random() - 0.5) * 4, dy: 10, dz: 8 } : null);
                return;
            }

            // --- CONCEPT + LESSON DISPLAY ---
            // Show concept/lesson only once per delivery
            if (!(deliveryContextRef.current as any).lessonShown) {
                const concept = getRandomConcept();
                setActiveConcept(concept);
                const lesson = getNextLesson('hits');
                if (lesson) setActiveLesson(lesson);
                (deliveryContextRef.current as any).lessonShown = true;
                (deliveryContextRef.current as any).concept = concept;

                // Add to Knowledge Book
                if (concept) {
                    setBookEntries(prev => {
                        const entry: BookEntry = { kind: 'concept', levelTitle: LEVELS[stateRefs.currentLevelIndex].title, text: concept };
                        const updated = [...prev, entry];
                        if (currentGameState !== 'PAUSED') setCurrentPage(updated.length - 1);
                        return updated;
                    });
                }
            }
            // --------------------------------

            let cE = "missedHit"; let rSTH = 0;
            const ballsBowledAfterThisDelivery = stateRefs.ballsBowled + 1;
            const timingFactor = Math.abs(cBl.y - batEffectiveY);
            const t = timingFactor / batHeight; // normalized timing window
            let strength = 10;
            let verticalStrength = 8;

            if (t < 0.22) {
                rSTH = 6; triggerImpactEffect("SIX!");
                strength = 18; verticalStrength = 18; cE = 'hitSix';
            } else if (t < 0.40) {
                rSTH = 4; triggerImpactEffect("FOUR!");
                strength = 15; verticalStrength = 12; cE = 'hitFour';
            } else if (t < 0.60) {
                rSTH = 2; triggerImpactEffect("TWO RUNS!");
                strength = 12; verticalStrength = 9; cE = 'hitTwo';
            } else if (t < 0.80) {
                rSTH = 1; triggerImpactEffect("ONE RUN!");
                strength = 10; verticalStrength = 6; cE = 'hitOne';
            } else {
                rSTH = 0; triggerImpactEffect("DOT BALL!");
                strength = 9; verticalStrength = 5; cE = 'hitDotContact';
            }

            const prevScore = stateRefs.score;
            const prevToWin = Math.max(0, stateRefs.targetScore - prevScore);
            const newScore = prevScore + rSTH;
            const newToWin = Math.max(0, stateRefs.targetScore - newScore);
            // Commit score/ball immediately so scoreboard stays in sync
            setScore(newScore);
            setToWin(newToWin);
            setBallsBowled(ballsBowledAfterThisDelivery);
            (deliveryContextRef.current as any).scoreCommitted = true;
            try { console.debug('[RUN-CHASE] HIT', { runs: rSTH, target: stateRefs.targetScore, prevScore, newScore, prevToWin, newToWin, wickets: stateRefs.wickets, ballsAfter: ballsBowledAfterThisDelivery }); } catch {}

            // Optional: rotate a concise score message to avoid repetition
            const scoreMsg = getScoreMessage(rSTH);
            if (scoreMsg) showAppMessage(scoreMsg, 1500);
            
            let ballSpeedX = 0;
            if (cShtDir === 'LEG') ballSpeedX = (strength / 1.7);
            else if (cShtDir === 'OFF') ballSpeedX = (-strength / 1.7);
            else ballSpeedX = (Math.random() - 0.5) * 6;
            setBall(p => p ? { ...p, dx: ballSpeedX + (Math.random() - 0.5) * 2, dy: strength, dz: verticalStrength } : null);

            // Level Logic Check
            const levelComplete = newScore >= stateRefs.targetScore;
            const gameOverConditions = stateRefs.wickets >= stateRefs.maxWickets || ballsBowledAfterThisDelivery >= stateRefs.totalBalls;

            if (levelComplete || gameOverConditions) {
                // If the ball is still flying, we wait for it to stop in updateBallPosition, but we can preemptively prep commentary context?
                // Actually, let updateBallPosition handle the state change so the visual ball finishes.
                // Just trigger commentary now for the hit itself, but keep it brief? 
                // No, better to let the ball land.
            } 
            
            // Defer commentary until ball stops to avoid duplicates; store full snapshot
            (deliveryContextRef.current as any).event = cE;
            (deliveryContextRef.current as any).runs = rSTH;
            (deliveryContextRef.current as any).scoreAfter = newScore;
            (deliveryContextRef.current as any).ballsAfter = ballsBowledAfterThisDelivery;
            (deliveryContextRef.current as any).targetSnapshot = stateRefs.targetScore;
            (deliveryContextRef.current as any).wicketsSnapshot = stateRefs.wickets;
            (deliveryContextRef.current as any).commentarySent = false;
            
        } else {
            if (isTutorial) {
                showAppMessage("Missed! Let's try again.", 1500);
                triggerImpactEffect("TRY AGAIN");
            } else {
                showAppMessage("SWING AND A MISS!", 1500);
                triggerImpactEffect("MISS!");
                deliveryContextRef.current = { wasMiss: true };
            }
        }
    }, [stateRefs, assets.batHitSoundRef, showAppMessage, triggerImpactEffect, getRandomConcept, commentary, bowlTutorialBall]);

    const swingBat = useCallback(() => {
        if (stateRefs.currentGameState === 'BOWLING') {
            setCurrentGameState('HITTING');
            handleHit();
        }
    }, [stateRefs, handleHit]);


    const updateBallPosition = useCallback(() => {
        const { currentGameState: cState, ball: cBall, stumps: cStumps, bat: cBat, score: cScore, wickets: cWickets, ballsBowled: cBalls, targetScore: cTarget, totalBalls: cTotal, maxWickets: cMaxW, tutorialStep: cTutStep } = stateRefs;
        if (!cBall) return;
        const isTutorialSwing = cTutStep === 'SWING_PRACTICE';

        if (cState === 'BOWLING' || cState === 'HITTING') {
            if (!cStumps) return;
            const newBall = { ...cBall, y: cBall.y + cBall.dy };

            const canBeBowled = !(cBat?.swinging) || cState === 'BOWLING';
            if (canBeBowled && !isTutorialSwing && newBall.y - newBall.radius < cStumps.y + STUMPS_HEIGHT && !cStumps.hit &&
                newBall.x + newBall.radius > cStumps.x && newBall.x - newBall.radius < cStumps.x + (NUM_STUMPS * STUMPS_WIDTH + (NUM_STUMPS - 1) * STUMP_GAP) &&
                newBall.y + newBall.radius > cStumps.y) {
                
                const wicketsAfterThis = cWickets + 1;
                const ballsBowledAfterThis = cBalls + 1;
                setStumps(p => p ? { ...p, hit: true } : null);
                assets.wicketSoundRef.current?.play();
                setCurrentGameState('OUT');
                showAppMessage("CLEAN BOWLED!", 3000);
                triggerImpactEffect("BOWLED!");
                // Show a bad practice lesson when bowled
                if (!(deliveryContextRef.current as any).lessonShown) {
                    const badLesson = QUANTUM_ANTI[Math.floor(Math.random() * QUANTUM_ANTI.length)];
                    if (badLesson) setActiveLesson(badLesson);
                    (deliveryContextRef.current as any).lessonShown = true;

                    // Add anti‑pattern to Knowledge Book
                    if (badLesson) {
                        setBookEntries(prev => {
                            const entry: BookEntry = { kind: 'antipattern', levelTitle: LEVELS[stateRefs.currentLevelIndex].title, text: badLesson };
                            const updated = [...prev, entry];
                            if (currentGameState !== 'PAUSED') setCurrentPage(updated.length - 1);
                            return updated;
                        });
                    }
                }
                setWickets(wicketsAfterThis);
                setBallsBowled(ballsBowledAfterThis);
                // Do not adjust score or toWin here
                deliveryContextRef.current = {};
                try {
                    const toWinNow = Math.max(0, cTarget - cScore);
                    console.debug('[RUN-CHASE] WICKET', { target: cTarget, score: cScore, toWin: toWinNow, wickets: wicketsAfterThis, ballsAfter: ballsBowledAfterThis });
                } catch {}
                
                // Guard to avoid duplicate commentary
                if (!(deliveryContextRef.current as any).commentarySent) {
                    commentary.triggerDynamicCommentary({
                        event: "wicketBowled", wickets: wicketsAfterThis, score: cScore,
                        targetScore: cTarget, ballsBowled: ballsBowledAfterThis, totalBalls: cTotal
                    });
                    (deliveryContextRef.current as any).commentarySent = true;
                }
                scheduleNextBall(3000);
                return;
            }

            if (newBall.y + newBall.radius < 0) { // Ball through to the keeper
                if (isTutorialSwing) {
                    setCurrentGameState('TUTORIAL');
                    initGameElements();
                    bowlTimeoutIdRef.current = window.setTimeout(bowlTutorialBall, 1500);
                } else {
                    const ballsBowledAfterThis = cBalls + 1;
                    setCurrentGameState('BALL_DEAD');
                    showAppMessage("Through to the keeper.", 2000);
                    setBallsBowled(ballsBowledAfterThis);
                    const wasMissEvent = deliveryContextRef.current.wasMiss;
                    if (wasMissEvent) triggerImpactEffect("MISS!"); else triggerImpactEffect("DOT BALL!");
                    // Clear after commentary is sent
                    
                    commentary.triggerDynamicCommentary({
                        event: wasMissEvent ? "missedHit" : "dotBallKeeper", score: cScore,
                        targetScore: cTarget, wickets: cWickets, ballsBowled: ballsBowledAfterThis, totalBalls: cTotal
                    });
                    deliveryContextRef.current = {};
                    try { console.debug('[RUN-CHASE] DOT/KEEPER', { target: cTarget, score: cScore, toWin: Math.max(0, cTarget - cScore), wickets: cWickets, ballsAfter: ballsBowledAfterThis }); } catch {}
                    scheduleNextBall(2500);
                }
            }
            setBall(newBall);

        } else if (cState === 'BALL_IN_PLAY') {
            const newBall = { ...cBall };
            newBall.dz -= GRAVITY; newBall.z += newBall.dz;
            if (newBall.z < 0) { newBall.z = 0; newBall.dz = -newBall.dz * BOUNCE_FACTOR; newBall.dx *= 0.95; newBall.dy *= 0.95; }
            newBall.x += newBall.dx; newBall.y += newBall.dy;

            const currentRadius = BALL_RADIUS + newBall.z * 0.5;
            const newTrail = [...newBall.trail, { x: newBall.x, y: newBall.y, z: newBall.z, radius: currentRadius }];
            if (newTrail.length > TRAIL_LENGTH) newTrail.shift();
            newBall.trail = newTrail;

            const speed = Math.sqrt(newBall.dx * newBall.dx + newBall.dy * newBall.dy);
            const isEffectivelyStopped = newBall.z <= 0 && speed < 0.1;
            const outOfBounds = newBall.y > CANVAS_HEIGHT * 3 || newBall.y < -CANVAS_HEIGHT * 3 || newBall.x < -CANVAS_WIDTH * 3 || newBall.x > CANVAS_WIDTH * 3;
            
            if (outOfBounds || isEffectivelyStopped) {
                if (isTutorialSwing) {
                    setCurrentGameState('TUTORIAL');
                    setTutorialStep('COMPLETE');
                } else {
                    setCurrentGameState('BALL_DEAD');
                    // Send deferred hit commentary once per delivery
                    const dc: any = deliveryContextRef.current;
                    if (dc && dc.event && !dc.commentarySent) {
                        // Score was already committed at contact; only ensure ballsBowled is consistent
                        if (typeof dc.ballsAfter === 'number') setBallsBowled(dc.ballsAfter);
                        commentary.triggerDynamicCommentary({
                            event: dc.event,
                            runsScoredThisBall: dc.runs,
                            score: dc.scoreAfter ?? stateRefs.score,
                            targetScore: dc.targetSnapshot ?? stateRefs.targetScore,
                            wickets: dc.wicketsSnapshot ?? stateRefs.wickets,
                            ballsBowled: dc.ballsAfter ?? stateRefs.ballsBowled,
                            totalBalls: stateRefs.totalBalls,
                            currentLevelTitle: LEVELS[stateRefs.currentLevelIndex].title,
                            conceptTriggered: dc.concept
                        });
                        dc.commentarySent = true;
                        try {
                            const calcToWin = Math.max(0, (dc.targetSnapshot ?? stateRefs.targetScore) - (dc.scoreAfter ?? stateRefs.score));
                            console.debug('[RUN-CHASE] DELIVERY_END', {
                                event: dc.event, runs: dc.runs,
                                target: dc.targetSnapshot ?? stateRefs.targetScore,
                                score: dc.scoreAfter ?? stateRefs.score,
                                toWin: calcToWin,
                                wickets: dc.wicketsSnapshot ?? stateRefs.wickets,
                                balls: dc.ballsAfter ?? stateRefs.ballsBowled,
                            });
                        } catch {}
                    }
                    scheduleNextBall(2000);
                }
                // Clear transient concept/lesson after the play finishes
                setActiveConcept(null);
                setActiveLesson(null);
                deliveryContextRef.current = {} as any;
            }
            setBall(newBall);
        }
    }, [stateRefs, assets.wicketSoundRef, commentary, gameOver, scheduleNextBall, showAppMessage, triggerImpactEffect, initGameElements, bowlTutorialBall]);


    // --- Effects ---
    useEffect(() => {
        if (assets.assetsLoaded.all) {
            setCurrentGameState('PLAYER_SELECT');
            setMessage('Choose Your Player');
            initGameElements();
        } else {
            // If assets never resolve, fail open after a short delay to avoid infinite loading
            const t = window.setTimeout(() => {
                setCurrentGameState('PLAYER_SELECT');
                setMessage('Choose Your Player');
                initGameElements();
            }, 3000);
            return () => window.clearTimeout(t);
        }
    }, [assets.assetsLoaded.all, initGameElements]);

    // Ensure core elements exist whenever we’re in active states
    useEffect(() => {
        if ((currentGameState === 'READY' || currentGameState === 'BOWLING' || currentGameState === 'HITTING') && (!stateRefs.ball || !stateRefs.batsman || !stateRefs.bat || !stateRefs.stumps)) {
            initGameElements();
        }
    }, [currentGameState, stateRefs.ball, stateRefs.batsman, stateRefs.bat, stateRefs.stumps, initGameElements]);

    // Auto-bowl whenever we enter READY and no bowl timer is set
    useEffect(() => {
        if (currentGameState === 'READY') {
            if (bowlTimeoutIdRef.current) clearTimeout(bowlTimeoutIdRef.current);
            bowlTimeoutIdRef.current = window.setTimeout(bowlLogic, 1200);
        }
    }, [currentGameState]);

    // Load lessons once
    useEffect(() => {
        loadLessons().then(data => { lessonsRef.current = { hits: [...data.hits], badPractices: [...data.badPractices] }; });
    }, []);

    // Load per-section content for richer, non-repetitive messages
    useEffect(() => {
        loadSectionContent().then(sc => { sectionContentRef.current = sc || {}; });
    }, []);

    useEffect(() => {
        const loop = () => {
            if (stateRefs.currentGameState !== 'PAUSED' && (stateRefs.currentGameState === 'BOWLING' || stateRefs.currentGameState === 'HITTING' || stateRefs.currentGameState === 'BALL_IN_PLAY')) {
                updateBallPosition();
            }
            gameLoopIdRef.current = requestAnimationFrame(loop);
        };
        if (!gameLoopIdRef.current) gameLoopIdRef.current = requestAnimationFrame(loop);
        return () => { if (gameLoopIdRef.current) { cancelAnimationFrame(gameLoopIdRef.current); gameLoopIdRef.current = null; } };
    }, [updateBallPosition, stateRefs]);


    const startGame = useCallback(async () => {
        if (currentGameState === 'LOADING' || isExecutingNextBallLogicRef.current) return;

        if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current); gameLoopIdRef.current = null;
        if (bowlTimeoutIdRef.current) clearTimeout(bowlTimeoutIdRef.current);
        if (nextBallTimeoutIdRef.current) clearTimeout(nextBallTimeoutIdRef.current);
        if (messageTimeoutIdRef.current) clearTimeout(messageTimeoutIdRef.current);
        if (commentary.safetyNetNextBallTimeoutRef.current) clearTimeout(commentary.safetyNetNextBallTimeoutRef.current);
        commentary.pendingNextBallActionRef.current = null;
        
        // Start from Level 1
        try { await commentary.initLiveSession(); 
        } catch (e) { console.error("Failed to initialize commentary:", e); showAppMessage("Commentary failed to connect.", 3000); }
        
        startLevel(0);

    }, [currentGameState, commentary, showAppMessage, startLevel]);
    
    const nextLevel = useCallback(() => {
        const nextIdx = currentLevelIndex + 1;
        if (nextIdx < LEVELS.length) {
            startLevel(nextIdx);
        } else {
            // Should have been handled in executeNextBallLogic as win, but fallback:
            setCurrentGameState('GAME_OVER');
        }
    }, [currentLevelIndex, startLevel]);

    const setShotDirectionWithTutorial = useCallback((dir: ShotDirection) => {
        setShotDirection(dir);
        const { currentGameState: cS, tutorialStep: tS } = stateRefs;
        if (cS === 'TUTORIAL') {
            if (dir === 'OFF' && tS === 'AIM_OFF') setTutorialStep('AIM_STRAIGHT');
            else if (dir === 'STRAIGHT' && tS === 'AIM_STRAIGHT') setTutorialStep('AIM_LEG');
            else if (dir === 'LEG' && tS === 'AIM_LEG') setTutorialStep('AIM_DONE');
        }
    }, [stateRefs]);

    // --- Pause/Resume and Book navigation ---
    const pauseGame = useCallback(() => {
        setCurrentGameState(prev => {
            if (prev === 'PAUSED') return prev;
            prevStateRef.current = prev;
            return 'PAUSED';
        });
        // Clear timers so nothing auto-bowls while paused
        if (bowlTimeoutIdRef.current) { clearTimeout(bowlTimeoutIdRef.current); bowlTimeoutIdRef.current = null; }
        if (nextBallTimeoutIdRef.current) { clearTimeout(nextBallTimeoutIdRef.current); nextBallTimeoutIdRef.current = null; }
        if (messageTimeoutIdRef.current) { clearTimeout(messageTimeoutIdRef.current); messageTimeoutIdRef.current = null; }
        if (commentary.safetyNetNextBallTimeoutRef.current) { clearTimeout(commentary.safetyNetNextBallTimeoutRef.current); commentary.safetyNetNextBallTimeoutRef.current = null; }
        commentary.pendingNextBallActionRef.current = null;
        showAppMessage('Paused — open Knowledge Book', 1500);
    }, [commentary, showAppMessage]);

    const resumeGame = useCallback(() => {
        if (stateRefs.currentGameState !== 'PAUSED') return;
        const restore = prevStateRef.current || 'READY';
        prevStateRef.current = null;
        setCurrentGameState(restore);
        showAppMessage('Resumed', 800);
        // Let state commit, then schedule next action (avoids PAUSED guard)
        window.setTimeout(() => {
            if (restore === 'READY') {
                if (bowlTimeoutIdRef.current) clearTimeout(bowlTimeoutIdRef.current);
                bowlTimeoutIdRef.current = window.setTimeout(bowlLogic, 800);
            } else if (restore === 'OUT' || restore === 'BALL_DEAD') {
                scheduleNextBall(800);
            }
        }, 20);
    }, [stateRefs.currentGameState, showAppMessage, scheduleNextBall, bowlLogic]);

    const goPrevPage = useCallback(() => {
        setCurrentPage(p => Math.max(0, p - 1));
    }, []);

    const goNextPage = useCallback(() => {
        setCurrentPage(p => Math.min(bookEntries.length - 1, p + 1));
    }, [bookEntries.length]);

    useEffect(() => {
        if (currentGameState !== 'TUTORIAL') return;
        if (messageTimeoutIdRef.current) clearTimeout(messageTimeoutIdRef.current);
        switch (tutorialStep) {
            case 'INTRO':
                showAppMessage("Welcome! Let's learn the controls.", 0);
                messageTimeoutIdRef.current = window.setTimeout(() => setTutorialStep('AIM_OFF'), 2500);
                break;
            case 'AIM_OFF': showAppMessage("Use LEFT ARROW or ← button to aim OFF side.", 0); break;
            case 'AIM_STRAIGHT': showAppMessage("Good! Now use UP ARROW or ↑ for STRAIGHT.", 0); break;
            case 'AIM_LEG': showAppMessage("Perfect! And RIGHT ARROW or → for LEG side.", 0); break;
            case 'AIM_DONE':
                showAppMessage("Aiming is set! Great job.", 0);
                messageTimeoutIdRef.current = window.setTimeout(() => setTutorialStep('SWING_INTRO'), 2500);
                break;
            case 'SWING_INTRO':
                showAppMessage("Now, let's hit! Press SPACEBAR or SWING.", 0);
                messageTimeoutIdRef.current = window.setTimeout(() => {
                    initGameElements(); setTutorialStep('SWING_PRACTICE'); bowlTimeoutIdRef.current = window.setTimeout(bowlTutorialBall, 500);
                }, 2500);
                break;
            case 'COMPLETE':
                showAppMessage("Tutorial Complete! You're ready to play.", 0);
                messageTimeoutIdRef.current = window.setTimeout(() => {
                    setCurrentGameState('IDLE'); setTutorialStep('NONE');
                    setMessage("Press Start Game to begin!");
                }, 3000);
                break;
        }
    }, [currentGameState, tutorialStep, showAppMessage, initGameElements, bowlTutorialBall]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const cS = stateRefs.currentGameState; const tS = stateRefs.tutorialStep;

            // Pause/Resume keys
            if (e.code === 'KeyP') { e.preventDefault(); pauseGame(); return; }
            if (e.code === 'KeyR') { e.preventDefault(); resumeGame(); return; }

            if (cS === 'PAUSED') {
                if (e.code === 'ArrowLeft') { e.preventDefault(); goPrevPage(); return; }
                if (e.code === 'ArrowRight') { e.preventDefault(); goNextPage(); return; }
                return;
            }

            if (cS === 'TUTORIAL') {
                if (e.code === 'ArrowLeft' && tS === 'AIM_OFF') setTutorialStep('AIM_STRAIGHT');
                else if (e.code === 'ArrowUp' && tS === 'AIM_STRAIGHT') setTutorialStep('AIM_LEG');
                else if (e.code === 'ArrowRight' && tS === 'AIM_LEG') setTutorialStep('AIM_DONE');
            }

            if (e.code === 'ArrowLeft') setShotDirection('OFF');
            else if (e.code === 'ArrowRight') setShotDirection('LEG');
            else if (e.code === 'ArrowUp') setShotDirection('STRAIGHT');

            if (e.code === 'Space') {
                e.preventDefault();
                if (cS === 'BOWLING') swingBat();
                else if (cS === 'IDLE' || cS === 'GAME_OVER') startGame();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stateRefs, startGame, swingBat, pauseGame, resumeGame, goPrevPage, goNextPage]);

    return {
        score, targetScore, ballsBowled, totalBalls: stateRefs.totalBalls, wickets, maxWickets, currentGameState,
        message, shotDirection, ball, batsman, bat, stumps, canvasRef, impactEffectText,
        showImpactEffect, tutorialStep, startGame, swingBat, setShotDirection: setShotDirectionWithTutorial, playerWasSelected,
        currentLevel, nextLevel, activeConcept, activeLesson, toWin,
        // Knowledge Book API
        bookEntries, currentPage, isPaused: currentGameState === 'PAUSED',
        pauseGame, resumeGame, goPrevPage, goNextPage
    };
}
