/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ImpactMessageProps {
  text: string;
  visible: boolean;
}

const ImpactMessage: React.FC<ImpactMessageProps> = ({ text, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="impact-message-overlay" aria-live="assertive" role="alert">
      <div className="impact-message-text">
        {text}
      </div>
    </div>
  );
};

export default ImpactMessage;
