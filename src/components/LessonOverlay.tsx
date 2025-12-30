/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';

interface LessonOverlayProps {
  text: string | null;
}

const LessonOverlay: React.FC<LessonOverlayProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (text) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4500);
      return () => clearTimeout(t);
    }
  }, [text]);

  if (!text || !visible) return null;
  return (
    <div className="lesson-overlay">
      <div className="lesson-card">
        <div className="lesson-header">
          <span className="lesson-icon">📘</span>
          <span className="lesson-label">Lesson</span>
        </div>
        <p className="lesson-text">{text}</p>
      </div>
    </div>
  );
};

export default LessonOverlay;

