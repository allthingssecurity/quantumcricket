/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { BookEntry } from '../types';

interface KnowledgeBookProps {
  entries: BookEntry[];
  currentPage: number;
  isPaused: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const KnowledgeBook: React.FC<KnowledgeBookProps> = ({ entries, currentPage, isPaused, onPrev, onNext }) => {
  const count = entries.length;
  const hasPages = count > 0;
  const page = Math.min(Math.max(0, currentPage), Math.max(0, count - 1));
  const entry = hasPages ? entries[page] : null;

  // Mini dock during play: last entry preview + count
  if (!isPaused) {
    const last = hasPages ? entries[count - 1] : null;
    return (
      <aside className="book-dock" aria-label="Knowledge Book Dock">
        <div className="book-dock-header">Knowledge Book</div>
        {last ? (
          <div className={`book-dock-entry ${last.kind}`}>
            <div className="book-dock-title">{last.levelTitle}</div>
            <div className="book-dock-text">{last.text}</div>
          </div>
        ) : (
          <div className="book-dock-empty">Score runs to collect concepts.</div>
        )}
        <div className="book-dock-footer">{count} entries • Press P to Pause/Read</div>
      </aside>
    );
  }

  // Full view when paused — book-like spread
  return (
    <div className="book-overlay" role="dialog" aria-modal="true">
      <div className="book-panel">
        <div className="book-header">
          <div className="book-title">Knowledge Book</div>
          <div className="book-nav">
            <button className="book-btn" onClick={onPrev} aria-label="Previous Page">←</button>
            <span className="book-page">{hasPages ? page + 1 : 0}/{count}</span>
            <button className="book-btn" onClick={onNext} aria-label="Next Page">→</button>
          </div>
        </div>
        <div className="book-content book-spread">
          <div className="book-page-left">
            <div className="book-page-title">{entry ? entry.levelTitle : 'No Entries'}</div>
            <div className="book-page-sub">Collected notes from gameplay</div>
          </div>
          <div className="book-page-right">
            {entry ? (
              <div className={`book-entry ${entry.kind}`}>
                <div className="book-entry-text">{entry.text}</div>
              </div>
            ) : (
              <div className="book-empty">Score runs or get bowled to collect your first note.</div>
            )}
          </div>
        </div>
        <div className="book-help">Use ← and → to flip pages. Press R to resume.</div>
      </div>
    </div>
  );
};

export default KnowledgeBook;
