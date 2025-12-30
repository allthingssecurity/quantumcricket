/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { PlayerCharacter } from '../types';

interface PlayerSelectProps {
    onPlayerSelect: (player: PlayerCharacter) => void;
    spImage: HTMLImageElement;
    dhImage: HTMLImageElement;
}

const PlayerSelect: React.FC<PlayerSelectProps> = ({ onPlayerSelect, spImage, dhImage }) => {
    return (
        <div className="player-select-overlay">
            <div className="player-select-container">
                <h2 className="player-select-title">Choose Your Player</h2>
                <div className="player-options">
                    <div className="player-card" onClick={() => onPlayerSelect('SP')} role="button" tabIndex={0} aria-label="Select player SP">
                        <img src={spImage.src} alt="SP Batsman" />
                        <div className="player-name">SP</div>
                    </div>
                    <div className="player-card" onClick={() => onPlayerSelect('DH')} role="button" tabIndex={0} aria-label="Select player DH">
                        <img src={dhImage.src} alt="DH Batsman" />
                        <div className="player-name">DH</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerSelect;
