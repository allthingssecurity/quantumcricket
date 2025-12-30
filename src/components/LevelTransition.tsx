/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { LevelData } from '../types';

interface LevelTransitionProps {
    nextLevel: LevelData | undefined;
    onNextLevel: () => void;
}

const LevelTransition: React.FC<LevelTransitionProps> = ({ nextLevel, onNextLevel }) => {
    if (!nextLevel) return null;

    return (
        <div className="level-transition-overlay">
            <div className="level-card">
                <h2>Level Complete!</h2>
                <div className="divider"></div>
                <h3>Coming Up: Level {nextLevel.id}</h3>
                <h1 className="level-title">{nextLevel.title}</h1>
                <p className="level-desc">{nextLevel.description}</p>
                
                <div className="level-stats">
                    <div>Target: {nextLevel.targetScore} Runs</div>
                    <div>Balls: {nextLevel.totalBalls}</div>
                </div>

                <button className="btn-retro start-level-btn" onClick={onNextLevel}>
                    Start Level
                </button>
            </div>
        </div>
    );
};

export default LevelTransition;