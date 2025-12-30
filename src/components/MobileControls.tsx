/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ShotDirection, TutorialStep } from '../types';

interface MobileControlsProps {
    shotDirection: ShotDirection;
    onDirectionChange: (direction: ShotDirection) => void;
    onSwing: () => void;
    tutorialStep: TutorialStep;
}

const MobileControls: React.FC<MobileControlsProps> = ({ shotDirection, onDirectionChange, onSwing, tutorialStep }) => {
    
    const isOffHighlighted = tutorialStep === 'AIM_OFF';
    const isStraightHighlighted = tutorialStep === 'AIM_STRAIGHT';
    const isLegHighlighted = tutorialStep === 'AIM_LEG';
    const isSwingHighlighted = tutorialStep === 'SWING_PRACTICE' || tutorialStep === 'SWING_INTRO';
    
    return (
        <div className="mobile-controls-container">
            {/* Directional Pad on the Left */}
            <div className="mobile-d-pad">
                <button
                    className={`mobile-btn ${shotDirection === 'OFF' ? 'active' : ''} ${isOffHighlighted ? 'tutorial-highlight' : ''}`}
                    onClick={() => onDirectionChange('OFF')}
                    aria-label="Aim off side"
                >
                    &larr;
                </button>
                <button
                    className={`mobile-btn ${shotDirection === 'STRAIGHT' ? 'active' : ''} ${isStraightHighlighted ? 'tutorial-highlight' : ''}`}
                    onClick={() => onDirectionChange('STRAIGHT')}
                    aria-label="Aim straight"
                >
                    &uarr;
                </button>
                <button
                    className={`mobile-btn ${shotDirection === 'LEG' ? 'active' : ''} ${isLegHighlighted ? 'tutorial-highlight' : ''}`}
                    onClick={() => onDirectionChange('LEG')}
                    aria-label="Aim leg side"
                >
                    &rarr;
                </button>
            </div>

            {/* Action Pad on the Right */}
            <div className="mobile-action-pad">
                <button className={`mobile-btn mobile-swing-btn ${isSwingHighlighted ? 'tutorial-highlight' : ''}`} onClick={onSwing} aria-label="Swing bat">
                    SWING
                </button>
            </div>
        </div>
    );
};

export default MobileControls;