/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const Controls: React.FC = () => {
    return (
        <div className="controls-info text-sm text-gray-400 mt-4">
            <p className='my-1'>Aim: Arrow Left (Off) | Arrow Up (Straight) | Arrow Right (Leg)</p>
            <p className="hit-instruction text-base font-bold text-yellow-300 mt-2">Hit: SPACEBAR</p>
        </div>
    );
};

export default Controls;
