/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ConceptDisplayProps {
    concept: string | null;
}

const ConceptDisplay: React.FC<ConceptDisplayProps> = ({ concept }) => {
    if (!concept) return null;

    return (
        <div className="concept-overlay">
            <div className="concept-card">
                <div className="concept-header">
                    <span className="concept-icon">💡</span>
                    <span className="concept-label">Insight</span>
                </div>
                <p className="concept-text">{concept}</p>
            </div>
        </div>
    );
};

export default ConceptDisplay;
