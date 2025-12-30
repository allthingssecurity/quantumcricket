/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ScoreboardProps {
    score: number;
    targetScore: number;
    ballsBowled: number;
    totalBalls: number;
    wickets: number;
    maxWickets: number;
    toWin?: number; // optional: engine-provided, immune to wicket updates
}

const Scoreboard: React.FC<ScoreboardProps> = ({
    score,
    targetScore,
    ballsBowled,
    totalBalls,
    wickets,
    maxWickets,
    toWin
}) => {
    // Prefer engine-provided toWin if present, else derive
    const runsToWin = (typeof toWin === 'number')
        ? Math.max(0, toWin)
        : Math.max(0, (targetScore || 0) - (score || 0));
    const ballsLeft = Math.max(0, (totalBalls || 0) - (ballsBowled || 0));

    return (
        <div className="scoreboard">
            <div className="score-item">
                <span className="score-label">Score</span>
                <span className="score-value">{score}/{wickets}</span>
            </div>
             <div className="score-item">
                <span className="score-label">Target</span>
                <span className="score-value">{targetScore > 0 ? targetScore : '--'}</span>
            </div>
            <div className="score-item">
                <span className="score-label">Balls Left</span>
                <span className="score-value">{ballsLeft}</span>
            </div>
             <div className="score-item">
                <span className="score-label">To Win</span>
                <span className="score-value">{targetScore > 0 ? runsToWin : '--'}</span>
            </div>
        </div>
    );
};

export default Scoreboard;
