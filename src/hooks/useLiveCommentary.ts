/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decodeUsed, decodeAudioDataUsed } from '../utils/audioUtils';
import { createPromptForLiveCommentary } from '../utils/commentaryUtils';
import { GameContextForCommentary } from '../types';

let ai: GoogleGenAI | null = null;
const API_KEY = (process.env.API_KEY || (process as any).env?.GEMINI_API_KEY || '').trim?.() || '';
if (API_KEY) {
    try { ai = new GoogleGenAI({ apiKey: API_KEY }); } catch { ai = null; }
}

const initialSystemPrompt = `You are an expert live cricket commentator for an exciting arcade game. Your task is to transform factual game data into immediate, dynamic, and engaging spoken commentary.

**YOUR INPUT:**
I will provide you with a factual "Match Situation" containing two parts:
1.  **Event:** A description of what just happened (e.g., "Event: SIX runs scored.", "Event: WICKET! The batsman is bowled.").
2.  **Overall Situation:** The current state of the game (e.g., "They need 15 runs from 8 balls to win.").

**YOUR TASK - FOLLOW THESE RULES ALWAYS:**

1.  **BE A STORYTELLER, NOT A REPORTER:** Do NOT simply read back the facts I give you. Your job is to add excitement, drama, and personality. For example, if the event is "SIX runs scored," you might say "That's a colossal blow! It's sailed into the stands!" or "Right out of the middle of the bat, magnificent shot for six!".
2.  **REACT TO THE CONTEXT:** Use the "Overall Situation" to color your commentary. A single run is more exciting in a tense final over than at the start. A wicket is more dramatic when the chasing team is close to the target.
3.  **BE CONCISE & PUNCHY:** Your commentary must be very short and impactful—usually less than a full sentence. Think energetic soundbites.
4.  **EMBODY THE PERSONA:**
    *   **Voice:** Upbeat, professional, and genuinely excited British sports commentator, who occasionally uses Urdu/Hindi phrases for extra flair.
    *   **Identity:** You are 'The Voice of the Game'. Never mention being an AI or Gemini.
    *   **Focus:** You ONLY provide commentary. No questions, no summaries. 
5.  **MAINTAIN VARIETY:** Avoid repeating the same phrases. Be creative and unpredictable.
6.  **OUTPUT AUDIO ONLY:** Your response must be purely audio. No text.
7.  **ADD URDU/HINDI FLAVOR (OCCASIONALLY):** During an exciting moment (like a six, four, or a wicket), you can sprinkle in a common Urdu or Hindi cricket phrase. Keep it natural, not forced. Examples include: "Chakka!" (for a six), "Chauka!" (for a four), "Aray wah!" (Wow!), or "Shabash!" (Well done!).

Your goal is to make the player feel like they're in a real, high-stakes cricket match with a world-class commentator reacting to their every move.`;


/**
 * Custom hook to manage all Gemini Live API interactions for commentary.
 */
export function useLiveCommentary() {
    const [commentaryStatus, setCommentaryStatus] = useState('');
    const audioCtxRef = useRef<AudioContext | null>(null);
    const liveSessionRef = useRef<any | null>(null);
    const isLiveSessionReadyRef = useRef(false);
    const nextStartTimeRef = useRef(0);
    const isAudioPlayingRef = useRef(false);
    const pendingNextBallActionRef = useRef<(() => void) | null>(null);
    const audioCompletionCheckTimeoutRef = useRef<number | null>(null);
    const safetyNetNextBallTimeoutRef = useRef<number | null>(null);

    const initAudioContext = useCallback(async () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') return;
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        if (audioCtxRef.current.state === 'suspended') {
            try { await audioCtxRef.current.resume(); console.log("AudioContext resumed."); } catch (e) { console.warn("AudioContext resume failed:", e); throw e; }
        }
        if (audioCtxRef.current.state !== 'running') throw new Error(`AudioContext not running. State: ${audioCtxRef.current.state}.`);
    }, []);

    const scheduleAudioCompletionCheck = useCallback((reason: string) => {
        if (audioCompletionCheckTimeoutRef.current) {
            window.clearTimeout(audioCompletionCheckTimeoutRef.current);
            audioCompletionCheckTimeoutRef.current = null;
        }

        const CHECK_INTERVAL_MS = 50;
        const MARGIN_SECONDS = 0.15;

        const performCheckAndAct = () => {
            audioCompletionCheckTimeoutRef.current = null;
            const audioCtx = audioCtxRef.current;

            if (!isAudioPlayingRef.current || !audioCtx || audioCtx.state !== 'running') {
                if (commentaryStatus.startsWith("🎙️ Speaking")) {
                    setCommentaryStatus(isLiveSessionReadyRef.current ? "🎙️ Live Ready" : "⚠️ Live Disconnected");
                }
                if (pendingNextBallActionRef.current) {
                    const actionToRun = pendingNextBallActionRef.current;
                    pendingNextBallActionRef.current = null;
                    if (safetyNetNextBallTimeoutRef.current) {
                        clearTimeout(safetyNetNextBallTimeoutRef.current);
                        safetyNetNextBallTimeoutRef.current = null;
                    }
                    actionToRun();
                }
                return;
            }

            const currentTime = audioCtx.currentTime;
            const expectedEndTime = nextStartTimeRef.current;

            if (currentTime >= expectedEndTime - MARGIN_SECONDS) {
                isAudioPlayingRef.current = false;
                setCommentaryStatus(isLiveSessionReadyRef.current ? "🎙️ Live Ready" : "⚠️ Live Disconnected");
                if (pendingNextBallActionRef.current) {
                     const actionToRun = pendingNextBallActionRef.current;
                     pendingNextBallActionRef.current = null;
                     if (safetyNetNextBallTimeoutRef.current) {
                        clearTimeout(safetyNetNextBallTimeoutRef.current);
                        safetyNetNextBallTimeoutRef.current = null;
                    }
                    actionToRun();
                }
            } else {
                const timeToWait = Math.max(CHECK_INTERVAL_MS, (expectedEndTime - currentTime + MARGIN_SECONDS) * 1000);
                audioCompletionCheckTimeoutRef.current = window.setTimeout(performCheckAndAct, timeToWait);
            }
        };
        performCheckAndAct();
    }, [commentaryStatus]);

    const initLiveSession = useCallback(async () => {
        if (!ai) { setCommentaryStatus('🎧 Commentary Off'); return; }
        if (liveSessionRef.current) { try { await liveSessionRef.current.close(); } catch (e) { console.warn("Error closing existing live session:", e); } liveSessionRef.current = null; isLiveSessionReadyRef.current = false; }
        try { await initAudioContext(); } catch (e: any) { setCommentaryStatus(`⚠️ Audio Err`); throw e; }
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') { setCommentaryStatus("⚠️ Audio System Err"); throw new Error("AudioContext not running"); }

        nextStartTimeRef.current = audioCtxRef.current.currentTime;
        isAudioPlayingRef.current = false;

        // Fix: Updated model name to one specified in the new guidelines for live audio tasks.
        const modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';
        const voiceName = "Zephyr";

        try {
            setCommentaryStatus("🔌 Connecting Live...");
            const session = await (ai as any).live.connect({
                model: modelName,
                callbacks: {
                    onopen: () => { isLiveSessionReadyRef.current = true; setCommentaryStatus("🎙️ Live Ready"); },
                    onmessage: async (message: any) => {
                        const modelTurn = message.serverContent?.modelTurn;
                        const serverAcknowledgedTurnComplete = message.serverContent?.turnComplete && !modelTurn;

                        if (modelTurn) {
                            const audioPart = modelTurn.parts.find((p: any) => p.inlineData?.mimeType?.startsWith('audio/'));
                            if (audioPart?.inlineData?.data && audioCtxRef.current?.state === 'running') {
                                if (!isAudioPlayingRef.current) {
                                     nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
                                }
                                isAudioPlayingRef.current = true;

                                const audioBytes = decodeUsed(audioPart.inlineData.data);
                                const audioBuffer = await decodeAudioDataUsed(audioBytes, audioCtxRef.current, 24000, 1);
                                const source = audioCtxRef.current.createBufferSource();
                                source.buffer = audioBuffer; source.connect(audioCtxRef.current.destination);

                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                setCommentaryStatus(`🎙️ Speaking...`);
                            }
                            if (message.serverContent?.turnComplete) {
                                scheduleAudioCompletionCheck("model_turn_content_complete");
                            }
                        } else if (serverAcknowledgedTurnComplete) {
                            scheduleAudioCompletionCheck("server_ack_turn_complete");
                        }
                    },
                    onerror: (e: ErrorEvent) => { isLiveSessionReadyRef.current = false; setCommentaryStatus(`⚠️ Live Err`); console.error("Live API Error Event:", e.message, e.error); isAudioPlayingRef.current = false; scheduleAudioCompletionCheck("live_onerror"); },
                    onclose: () => { isLiveSessionReadyRef.current = false; liveSessionRef.current = null; setCommentaryStatus("🔌 Live Closed"); isAudioPlayingRef.current = false; scheduleAudioCompletionCheck("live_onclose"); },
                },
                config: { systemInstruction: initialSystemPrompt, responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
            });
            liveSessionRef.current = session;
        } catch (e: any) { console.error("Live connect error:", e); setCommentaryStatus(`⚠️ Live Connect Err`); isAudioPlayingRef.current = false; throw e; }
    }, [initAudioContext, scheduleAudioCompletionCheck]);

    const triggerDynamicCommentary = useCallback(async (context: GameContextForCommentary): Promise<boolean> => {
        if (!ai || !API_KEY || !liveSessionRef.current || !isLiveSessionReadyRef.current) { return false; }
        try {
            setCommentaryStatus("📝 Creating prompt...");
            const promptText = await createPromptForLiveCommentary(context);
            if (promptText) {
                setCommentaryStatus("💬 Sending...");
                await liveSessionRef.current.sendRealtimeInput({ text: promptText });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("triggerDynamicCommentary: Error sending prompt:", error);
            setCommentaryStatus(`⚠️ Comm. Send Err`);
            isAudioPlayingRef.current = false;
            scheduleAudioCompletionCheck("commentary_trigger_error");
            return false;
        }
    }, [scheduleAudioCompletionCheck]);

    return {
        commentaryStatus,
        isAudioPlayingRef,
        pendingNextBallActionRef,
        safetyNetNextBallTimeoutRef,
        initLiveSession,
        triggerDynamicCommentary
    };
}
