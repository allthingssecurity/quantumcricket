/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface MessageDisplayProps {
    message: string;
    commentaryStatus: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, commentaryStatus }) => {
    return (
        <>
            <div 
                className="message-area"
                aria-live="polite"
            >
                {message}
            </div>
            {commentaryStatus && (
                <div 
                    className="commentary-status"
                    aria-live="polite"
                >
                    {commentaryStatus}
                </div>
            )}
        </>
    );
};

export default MessageDisplay;
