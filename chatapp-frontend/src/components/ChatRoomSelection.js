import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function ChatRoomSelection({ setChatroomId }) {
    const [chatrooms, setChatrooms] = useState([]);
    const history = useHistory();

    useEffect(() => {
        const fetchChatrooms = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetched token:', token); // Debug the token
                if (!token) {
                    throw new Error("No token found");
                }
                const response = await axios.get('http://localhost:8000/chat/chatrooms/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                setChatrooms(response.data);
            } catch (error) {
                console.error('Error fetching chatrooms:', error);
                setChatrooms([]);
            }
        };
        fetchChatrooms();
    }, []);

    const handleChatRoomSelection = async (chatroomId) => {
        try {
            const token = localStorage.getItem('token'); // Ensure consistent token usage
            console.log('Joining chatroom with token:', token); // Debug the token
            if (!token) {
                throw new Error("No token found");
            }
            const response = await axios.post('http://localhost:8000/chat/join-chatroom/', { chatroom_id: chatroomId }, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setChatroomId(response.data.chatroom_id);
            history.push('/chatroom');
        } catch (error) {
            console.error('Error joining chatroom:', error);
        }
    };

    return (
        <div>
            <h1>Select a Chat Room</h1>
            {chatrooms.length === 0 ? (
                <p>No chat rooms available</p>
            ) : (
                chatrooms.map((chatroom) => (
                    <button key={chatroom.id} onClick={() => handleChatRoomSelection(chatroom.id)}>
                        {chatroom.name}
                    </button>
                ))
            )}
        </div>
    );
}

export default ChatRoomSelection;
