// import React, { useState, useEffect, useCallback } from 'react';
// import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
// import ChatRoom from './components/ChatRoom';
// import axios from 'axios';


// function App() {
//     const [chatroomId, setChatroomId] = useState(null);
//     const [userId, setUserId] = useState(null);
//     const [username, setUsername] = useState('');
//     const [message, setMessage] = useState('');
//     const [language, setLanguage] = useState('');  // Initially empty to ensure the user selects a language
//     const [workerId, setWorkerId] = useState(null);
//     const [campaignId, setCampaignId] = useState(null);
//     const currentLocation = useLocation()
//     useEffect(() => {
//         const queryParams = new URLSearchParams(location.search);
//         const worker = queryParams.get('worker_id');
//         const campaign = queryParams.get('campaign_id');
//         if (worker && campaign) {
//             setWorkerId(worker);
//             setCampaignId(campaign);
//         }
//     }, [currentLocation.search]);

//     const fetchChatroom = useCallback(async () => {
//         try {
//             const response = await axios.get('http://localhost:8000/chat/assign-chatroom/', {
//                 params: { language: language,
//                     worker_id: workerId,
//                     campaign_id: campaignId
//                  }  // Send language preference to backend
//             });
//             setChatroomId(response.data.chatroom_id);
//             setUserId(response.data.user_id);
//             setUsername(response.data.username);
//             setMessage(response.data.message);
//         } catch (error) {
//             console.error('Error assigning chatroom:', error);
//         }
//     }, [language, workerId, campaignId]);
   

//     useEffect(() => {
//         if (language) {  // Only fetch chatroom if a language is selected
//             fetchChatroom();
//         }
//     }, [language, fetchChatroom]);  // Add fetchChatroom to the dependency array

//     return (
//         <Router>
//             <Switch>
//                 <Route path="/chatroom" render={(props) => (
//                     chatroomId ? (
//                         <ChatRoom {...props} chatroomId={chatroomId} userId={userId} username={username} message={message} language={language} />
//                     ) : (
//                         <div><div className='annotation-section'><center><strong>Hello! Welcome to the task. Read the instructions carefully below:</strong></center>
//                         <br></br>
//                         <ul>
//                        <li>This task involves the annotation of images with the assistance of an <b>Instructor </b>.</li>
//                         <li>You can be either a <b>Performer</b> or an <b>Instructor</b>. Your role will be determined once you join the chatroom.</li>
//                         <li>Please select your <b>Native Language</b>. If your <b>Native Language</b> is not available there in the dropdown, select a language you can read, write, and understand well.</li>
//                         <li>You will need to perform or instruct the task while interacting with <b>Performer</b> or the <b>Instructor</b> in the <b>Selected Language</b>.</li>
//                         <li>Once you select the language, you will be redirected to the chatroom. Enjoy the task!</li>
//                         </ul>
//                         </div>
//                             <div className="language-selection-container">
//                             <h2>Select Your Native/Preferred Language</h2>
//                             <select value={language} onChange={(e) => setLanguage(e.target.value)}>
//                                 <option value="">Select Language</option>
//                                 <option value="ar">Arabic</option>
//                                 <option value="bn">Bengali</option>
//                                 <option value="zh">Chinese</option>
//                                 <option value="en">English</option>
//                                 <option value="fr">French</option>
//                                 <option value="de">German</option>
//                                 <option value="hi">Hindi</option>
//                                 <option value="ja">Japanese</option>
//                                 <option value="pt">Portuguese</option>
//                                 <option value="ru">Russian</option>
//                                 <option value="es">Spanish</option>
//                             </select>
//                             <button onClick={fetchChatroom} disabled={!language} className="join-button">Join Chatroom</button>
//                         </div></div>
//                     )
//                 )} />
//                 <Redirect to="/chatroom" />
//             </Switch>
//         </Router>
//     );
// }

// export default App;
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import axios from 'axios';

function App() {
    const [chatroomId, setChatroomId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState('');  // Initially empty to ensure the user selects a language
    const [workerId, setWorkerId] = useState(null);
    const [campaignId, setCampaignId] = useState(null);

    const currentLocation = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(currentLocation.search);
        const worker = queryParams.get('worker_id');
        const campaign = queryParams.get('campaign_id');
        if (worker && campaign) {
            setWorkerId(worker);
            setCampaignId(campaign);
        }
    }, [currentLocation.search]);

    const fetchChatroom = useCallback(async () => {
        if (!workerId || !campaignId) {
            console.error('Worker ID or Campaign ID is missing');
            return;
        }
    
        try {
            const response = await axios.get('https://thesismaster2-b9f77d674540.herokuapp.com/chat/assign-chatroom/', {
                params: {
                    language: language,
                    worker_id: workerId,
                    campaign_id: campaignId,
                },
            });
            setChatroomId(response.data.chatroom_id);
            setUserId(response.data.user_id);
            setUsername(response.data.username);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error assigning chatroom:', error);
        }
    }, [language, workerId, campaignId]);
    

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
                        <div><div className='annotation-section'><center><strong>Hello! Welcome to the task. Read the instructions carefully below:</strong></center>
                        <br></br>
                        <ul>
                       <li>This task involves the annotation of images with the assistance of an <b>Instructor </b>.</li>
                        <li>You can be either a <b>Performer</b> or an <b>Instructor</b>. Your role will be determined once you join the chatroom.</li>
                        <li>Please select your <b>Native Language</b>. If your <b>Native Language</b> is not available there in the dropdown, select a language you can read, write, and understand well.</li>
                        <li>You will need to perform or instruct the task while interacting with <b>Performer</b> or the <b>Instructor</b> in the <b>Selected Language</b>.</li>
                        <li>Once you select the language, you will be redirected to the chatroom. Enjoy the task!</li>
                        </ul>
                        </div>
                            <div className="language-selection-container">
                            <h2>Select Your Native/Preferred Language</h2>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="">Select Language</option>
                                <option value="ar">Arabic</option>
                                <option value="bn">Bengali</option>
                                <option value="zh">Chinese</option>
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="hi">Hindi</option>
                                <option value="ja">Japanese</option>
                                <option value="pt">Portuguese</option>
                                <option value="ru">Russian</option>
                                <option value="es">Spanish</option>
                            </select>
                            <button onClick={fetchChatroom} disabled={!language} className="join-button">Join Chatroom</button>
                        </div></div>
                    )
                )} />
                <Redirect to="/chatroom" />
            </Switch>
        </Router>
    );
}

export default App;
