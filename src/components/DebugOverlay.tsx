/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface DebugOverlayProps {
  targetScore: number;
  score: number;
  wickets: number;
  ballsBowled: number;
  totalBalls: number;
  toWin?: number;
  gameState: string;
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({
  targetScore,
  score,
  wickets,
  ballsBowled,
  totalBalls,
  toWin,
  gameState,
}) => {
  const computedToWin = Math.max(0, (targetScore || 0) - (score || 0));
  const shownToWin = typeof toWin === 'number' ? toWin : computedToWin;
  return (
    <div className="debug-overlay" role="status" aria-live="polite">
      <div>STATE: {gameState}</div>
      <div>TARGET: {targetScore}</div>
      <div>SCORE: {score}</div>
      <div>WICKETS: {wickets}</div>
      <div>BALLS: {ballsBowled}/{totalBalls}</div>
      <div>TO WIN (engine): {shownToWin}</div>
      <div>TO WIN (calc): {computedToWin}</div>
    </div>
  );
};

export default DebugOverlay;

