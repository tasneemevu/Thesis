import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function Waiting({ chatroomId, checkConnection }) {
    const history = useHistory();

    useEffect(() => {
        const interval = setInterval(async () => {
            const isConnected = await checkConnection();
            if (isConnected) {
                history.push(`/chatroom/${chatroomId}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [chatroomId, history, checkConnection]);

    return (
        <div>
            <h1>Please wait for another user to join...</h1>
        </div>
    );
}

export default Waiting;

