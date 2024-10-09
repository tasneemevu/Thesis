import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import axios from 'axios';

function App() {
    const [chatroomId, setChatroomId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState('');  // Initially empty to ensure the user selects a language

    const fetchChatroom = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/chat/assign-chatroom/', {
                params: { language: language }  // Send language preference to backend
            });
            setChatroomId(response.data.chatroom_id);
            setUserId(response.data.user_id);
            setUsername(response.data.username);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error assigning chatroom:', error);
        }
    }, [language]);

    useEffect(() => {
        if (language) {  // Only fetch chatroom if a language is selected
            fetchChatroom();
        }
    }, [language, fetchChatroom]);  // Add fetchChatroom to the dependency array

    return (
        <Router>
            <Switch>
                <Route path="/chatroom" render={(props) => (
                    chatroomId ? (
                        <ChatRoom {...props} chatroomId={chatroomId} userId={userId} username={username} message={message} language={language} />
                    ) : (
                        <div>
                            <h2>Select Your Preferred Language</h2>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="">Select Language</option>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="zh">Chinese</option>
                                <option value="hi">Hindi</option>
                                <option value="ar">Arabic</option>
                                <option value="fr">French</option>
                                <option value="ru">Russian</option>
                                <option value="ja">Japanese</option>
                                <option value="de">German</option>
                                <option value="pt">Portuguese</option>
                            </select>
                            <button onClick={fetchChatroom} disabled={!language}>Join Chatroom</button>
                        </div>
                    )
                )} />
                <Redirect to="/chatroom" />
            </Switch>
        </Router>
    );
}

export default App;
