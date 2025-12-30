/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useRef } from 'react';
import { AssetsLoaded } from '../types';

/**
 * Custom hook to manage loading all game assets (images and audio).
 * It returns the loaded status and refs to the loaded assets.
 */
export function useGameAssets() {
    const batImageRef = useRef(new Image());
    const batsmanImageRef = useRef(new Image());
    const dhBatsmanImageRef = useRef(new Image());
    const ballImageRef = useRef(new Image());
    const grassImageRef = useRef(new Image());
    const [assetsLoaded, setAssetsLoaded] = useState<AssetsLoaded>({ bat: false, batsman: false, dhBatsman: false, ball: false, grass: false, all: false });

    const batHitSoundRef = useRef<HTMLAudioElement | null>(null);
    const wicketSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload sounds
        batHitSoundRef.current = new Audio('https://storage.googleapis.com/gemini-95-icons/bathit.mp3');
        batHitSoundRef.current.preload = 'auto';
        wicketSoundRef.current = new Audio('https://storage.googleapis.com/gemini-95-icons/wicket.m4a');
        wicketSoundRef.current.preload = 'auto';

        let loadedCount = 0;
        const totalToLoad = 5;
        const markLoaded = (type: 'bat' | 'batsman' | 'dhBatsman' | 'ball' | 'grass', success: boolean) => {
            setAssetsLoaded(prev => {
                const newAssets = { ...prev, [type]: success };
                loadedCount++;
                // Proceed even if some assets failed; renderer falls back to primitives
                if (loadedCount === totalToLoad) {
                    newAssets.all = true;
                }
                return newAssets;
            });
        };

        batImageRef.current.onload = () => markLoaded('bat', true);
        batsmanImageRef.current.onload = () => markLoaded('batsman', true);
        dhBatsmanImageRef.current.onload = () => markLoaded('dhBatsman', true);
        ballImageRef.current.onload = () => markLoaded('ball', true);
        grassImageRef.current.onload = () => markLoaded('grass', true);


        batImageRef.current.onerror = () => markLoaded('bat', false);
        batsmanImageRef.current.onerror = () => markLoaded('batsman', false);
        dhBatsmanImageRef.current.onerror = () => markLoaded('dhBatsman', false);
        ballImageRef.current.onerror = () => markLoaded('ball', false);
        grassImageRef.current.onerror = () => markLoaded('grass', false);

        batImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/cricketbat-flipped-s.png';
        batsmanImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/spbatsman.png';
        dhBatsmanImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/demisbatsman.png';
        ballImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/cricketball.png';
        grassImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/grass.jpg';
        // Safety net: if onload/onerror callbacks don’t fire (rare), unlock after timeout.
        const safety = window.setTimeout(() => {
            setAssetsLoaded(prev => ({ ...prev, all: true }));
        }, 4000);

        // The effect runs only once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        assetsLoaded,
        batImageRef,
        batsmanImageRef,
        dhBatsmanImageRef,
        ballImageRef,
        grassImageRef,
        batHitSoundRef,
        wicketSoundRef
    };
}
