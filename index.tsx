/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import CricketGame from './src/CricketGame';
import './index.css'; // Ensure global styles are applied

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <CricketGame />
        </React.StrictMode>
    );
}
