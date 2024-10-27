
//chatgpt
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';

// function ChatRoom({ chatroomId, userId, username, message, language }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [socket, setSocket] = useState(null);
//     const [canType, setCanType] = useState(false);
//     const [waitingForSecondUser, setWaitingForSecondUser] = useState(true);
    
//     useEffect(() => {
//         const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatroomId}/`);
//         setSocket(ws);

//         let timer = null;

//         ws.onopen = () => {
//             // Start a timer to wait for the second user for 2 minutes
//             timer = setTimeout(() => {
//                 if (waitingForSecondUser) {
//                     setCanType(true); // Allow typing for the first user if no second user joins
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { username: 'System', message: 'You are now connected.' }
//                     ]);
//                 }
//             }, 120000); // 2 minutes timeout
//         };

//         ws.onmessage = async function (e) {
//             const data = JSON.parse(e.data);

//             if (data.user2_joined) {
//                 if (waitingForSecondUser) {
//                     clearTimeout(timer); // Clear the timer if the second user joins
//                     setCanType(true); // Allow typing for both users
//                     setWaitingForSecondUser(false); // Stop waiting for the second user
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { username: 'System', message: 'A second user has joined the chat.' }
//                     ]);
//                 }
//             } else if (data.user2_left) {
//                 setCanType(false); // Disable typing if the second user leaves
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { username: 'System', message: 'You are disconnected.' }
//                 ]);
//             } else if (data.message && data.username !== username) {
//                 // Translate incoming messages to the user's selected language
//                 const translatedMessage = await translateMessage(data.message, language); // Use selected language
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { username: data.username, message: translatedMessage }
//                 ]);
//             } else if (data.message && data.username === username) {
//                 // Display the sender's own message without translation
//                 setMessages((prevMessages) => [
//                     ...prevMessages,
//                     { username: data.username, message: data.message }
//                 ]);
//             }
//         };

//         ws.onclose = function (e) {
//             console.error('WebSocket connection closed:', e);
//             clearTimeout(timer); // Ensure timer is cleared on close
//         };

//         return () => {
//             ws.close();
//             clearTimeout(timer); // Cleanup the timer on component unmount
//         };
//     }, [chatroomId, language, username, waitingForSecondUser]);

//     const translateMessage = async (text, targetLanguage) => {
//         try {
//             const response = await axios.post(
//                 'https://translation.googleapis.com/language/translate/v2',
//                 {},
//                 {
//                     params: {
//                         q: text,
//                         target: targetLanguage, // Use the selected language here
//                         key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY, // Your API Key
//                     },
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             // Return the translated text
//             if (response.data && response.data.data && response.data.data.translations) {
//                 return response.data.data.translations[0].translatedText;
//             } else {
//                 console.error('Unexpected response format:', response.data);
//                 return text; // Return original text if unexpected response format
//             }
//         } catch (error) {
//             console.error('Error translating message:', error);
//             return text; // Fallback to the original message in case of error
//         }
//     };

//     const sendMessage = () => {
//         if (socket && newMessage.trim()) {
//             socket.send(JSON.stringify({
//                 'message': newMessage,
//                 'username': username,
//             }));
//             setNewMessage('');
//         }
//     };

//     const leaveChatroom = async () => {
//         try {
//             const csrfToken = Cookies.get('csrftoken');

//             await axios.post(
//                 'http://localhost:8000/chat/leave-chatroom/',
//                 {
//                     user_id: userId,
//                     chatroom_id: chatroomId
//                 },
//                 {
//                     headers: {
//                         'X-CSRFToken': csrfToken,
//                     },
//                     withCredentials: true,
//                 }
//             );
//         } catch (error) {
//             console.error('Error leaving chatroom:', error);
//         }
//     };

//     return (
//         <div>
//             <h1>Chat Room: {chatroomId}</h1>
//             <p>{message}</p>
            
//             <ul>
//                 {messages.map((message, index) => (
//                     <li key={index}><strong>{message.username}: </strong>{message.message}</li>
//                 ))}
//             </ul>
//             <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type a message..."
//                 disabled={!canType}
//             />
//             <button onClick={sendMessage} disabled={!canType}>Send</button>
//             <button onClick={leaveChatroom}>Leave</button>
//         </div>
//     );
// }

// export default ChatRoom;




// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// // import './ChatRoom.css'; // Optional: For styling instructions

// function ChatRoom({ chatroomId, userId, username, message, language }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [socket, setSocket] = useState(null);
//     const [canType, setCanType] = useState(false);

//     // State variable for user role
//     const [userRole, setUserRole] = useState(null); // 'first' or 'second'

//     // Refs for userRole and timer
//     const userRoleRef = useRef(null);
//     const timerRef = useRef(null);

//     useEffect(() => {
//         const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatroomId}/`);
//         setSocket(ws);

//         ws.onopen = () => {
//             console.log('WebSocket connected');
//             // Connection established, wait for role message
//         };

//         ws.onmessage = async function (e) {
//             const data = JSON.parse(e.data);

//             switch (data.type) {
//                 case 'role':
//                     setUserRole(data.role);
//                     userRoleRef.current = data.role; // Update the ref
//                     console.log(`Assigned role: ${data.role}`);

//                     if (data.role === 'first') {
//                         // Start timer to wait for second user
//                         timerRef.current = setTimeout(() => {
//                             setCanType(true); // Allow typing if no second user joins
//                             setMessages((prevMessages) => [
//                                 ...prevMessages,
//                                 { username: 'System', message: 'You are now connected.' }
//                             ]);
//                             // Instructions remain for the first user
//                             console.log('2 minutes elapsed. Allowing typing for first user.');
//                         }, 120000); // 2 minutes
//                     } else if (data.role === 'second') {
//                         setCanType(true); // Allow typing immediately
//                         // Instructions are handled by conditional rendering below
//                         console.log('Second user connected. Allowing typing immediately.');
//                     }
//                     break;

//                 case 'user_joined':
//                     if (userRoleRef.current === 'first') {
//                         // Second user has joined, first user can type
//                         if (timerRef.current) {
//                             clearTimeout(timerRef.current); // Clear the timer
//                             timerRef.current = null;
//                             console.log('Second user joined before timer elapsed. Timer cleared.');
//                         }
//                         setCanType(true);
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: 'System', message: data.message }
//                         ]);
//                         // Do not change instructions for the first user
//                     }
//                     // No action needed for second user regarding instructions
//                     break;

//                 case 'user_left':
//                     setCanType(false); // Disable typing if the second user leaves
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { username: 'System', message: data.message }
//                     ]);
//                     // Instructions are handled by conditional rendering below
//                     console.log('A user has left the chatroom. Typing disabled.');
//                     break;

//                 case 'chat':
//                     if (data.username !== username) {
//                         // Translate incoming messages to the user's selected language
//                         const translatedMessage = await translateMessage(data.message, language); // Use selected language
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: translatedMessage }
//                         ]);
//                     } else {
//                         // Display the sender's own message without translation
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: data.message }
//                         ]);
//                     }
//                     break;

//                 default:
//                     console.warn('Unknown message type:', data.type);
//             }
//         };

//         ws.onclose = function (e) {
//             console.error('WebSocket connection closed:', e);
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current);
//                 timerRef.current = null;
//                 console.log('WebSocket closed. Timer cleared.');
//             }
//         };

//         // Cleanup on component unmount
//         return () => {
//             ws.close();
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current); // Cleanup the timer on component unmount
//                 console.log('Component unmounted. Timer cleared.');
//             }
//         };
//     }, [chatroomId, language, username]); // Removed userRole and timer from dependencies

//     const translateMessage = async (text, targetLanguage) => {
//         try {
//             const response = await axios.post(
//                 'https://translation.googleapis.com/language/translate/v2',
//                 {},
//                 {
//                     params: {
//                         q: text,
//                         target: targetLanguage, // Use the selected language here
//                         key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY, // Your API Key
//                     },
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             // Return the translated text
//             if (response.data && response.data.data && response.data.data.translations) {
//                 return response.data.data.translations[0].translatedText;
//             } else {
//                 console.error('Unexpected response format:', response.data);
//                 return text; // Return original text if unexpected response format
//             }
//         } catch (error) {
//             console.error('Error translating message:', error);
//             return text; // Fallback to the original message in case of error
//         }
//     };

//     const sendMessage = () => {
//         if (socket && newMessage.trim()) {
//             socket.send(JSON.stringify({
//                 'message': newMessage,
//                 'username': username,
//             }));
//             setNewMessage('');
//             console.log(`Message sent: ${newMessage}`);
//         }
//     };

//     const leaveChatroom = async () => {
//         try {
//             const csrfToken = Cookies.get('csrftoken');

//             await axios.post(
//                 'http://localhost:8000/chat/leave-chatroom/',
//                 {
//                     user_id: userId,
//                     chatroom_id: chatroomId
//                 },
//                 {
//                     headers: {
//                         'X-CSRFToken': csrfToken,
//                     },
//                     withCredentials: true,
//                 }
//             );
//             console.log('Left the chatroom successfully.');
//         } catch (error) {
//             console.error('Error leaving chatroom:', error);
//         }
//     };

//     return (
//         <div className="chatroom-container">
//             <h1>Chat Room: {chatroomId}</h1>
//             <p>{message}</p>

//             {/* Instruction for First User */}
//             {userRole === 'first' && (
//                 <div id="first-user-instructions" style={{ display: 'block' }}>
//                     <h2>Welcome to the Chat!</h2>
//                     <p>Here are some instructions to get you started:</p>
//                     <img src="/images/first-user-instruction.png" alt="First User Instructions" />
//                     {/* Add more instructional content as needed */}
//                 </div>
//             )}

//             {/* Instruction for Second User */}
//             {userRole === 'second' && (
//                 <div id="second-user-instructions" style={{ display: 'block' }}>
//                     <h3>Welcome, Second User!</h3>
//                     <p>Here are some different instructions for you:</p>
//                     <img src="/images/taskimg1.jpg" alt="Second User Instructions" />
//                     {/* Add more instructional content as needed */}
//                 </div>
//             )}

//             <ul className="messages-list">
//                 {messages.map((message, index) => (
//                     <li key={index}><strong>{message.username}: </strong>{message.message}</li>
//                 ))}
//             </ul>
//             <div className="chatbar">
//                 <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     disabled={!canType}
//                 />
//                 <button onClick={sendMessage} disabled={!canType}>Send</button>
//                 <button onClick={leaveChatroom}>Leave</button>
//             </div>
//         </div>
//     );

// }

// export default ChatRoom;

// chatgpt logic
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// // import './ChatRoom.css'; // Optional: For styling instructions

// function ChatRoom({ chatroomId, userId, username, message, language }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [socket, setSocket] = useState(null);
//     const [canType, setCanType] = useState(false);

//     // State variable for user role
//     const [userRole, setUserRole] = useState(null); // 'first' or 'second'

//     // New state variable to track if connected to ChatGPT
//     const [isChatGPT, setIsChatGPT] = useState(false);

//     // Refs for userRole and timer
//     const userRoleRef = useRef(null);
//     const timerRef = useRef(null);

//     useEffect(() => {
//         const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatroomId}/`);
//         setSocket(ws);

//         ws.onopen = () => {
//             console.log('WebSocket connected');
//             // Connection established, wait for role message
//         };

//         ws.onmessage = async function (e) {
//             const data = JSON.parse(e.data);

//             switch (data.type) {
//                 case 'role':
//                     setUserRole(data.role);
//                     userRoleRef.current = data.role; // Update the ref
//                     setIsChatGPT(data.isChatGPT || false); // Set isChatGPT flag
//                     console.log(`Assigned role: ${data.role}, isChatGPT: ${data.isChatGPT}`);

//                     if (data.role === 'first') {
//                         // Start timer to wait for second user
//                         timerRef.current = setTimeout(() => {
//                             setCanType(true); // Allow typing if no second user joins
//                             setMessages((prevMessages) => [
//                                 ...prevMessages,
//                                 { username: 'System', message: 'You are now connected.' }
//                             ]);
//                             // Instructions remain for the first user
//                             console.log('2 minutes elapsed. Allowing typing for first user.');
//                         }, 120000); // 2 minutes
//                     } else if (data.role === 'second') {
//                         setCanType(true); // Allow typing immediately
//                         // Instructions are handled by conditional rendering below
//                         console.log('Second user connected. Allowing typing immediately.');
//                     }
//                     break;

//                 case 'user_joined':
//                     if (userRoleRef.current === 'first') {
//                         // Second user has joined, first user can type
//                         if (timerRef.current) {
//                             clearTimeout(timerRef.current); // Clear the timer
//                             timerRef.current = null;
//                             console.log('Second user joined before timer elapsed. Timer cleared.');
//                         }
//                         setCanType(true);
//                         setIsChatGPT(data.isChatGPT || false); // Update isChatGPT flag
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: 'System', message: data.message }
//                         ]);
//                         // Do not change instructions for the first user
//                     }
//                     // No action needed for second user regarding instructions
//                     break;

//                 case 'user_left':
//                     setCanType(false); // Disable typing if the second user leaves
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { username: 'System', message: data.message }
//                     ]);
//                     // Instructions are handled by conditional rendering below
//                     console.log('A user has left the chatroom. Typing disabled.');
//                     break;

//                 case 'chat':
//                     if (data.username !== username) {
//                         // Translate incoming messages to the user's selected language
//                         const translatedMessage = await translateMessage(data.message, language); // Use selected language
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: translatedMessage }
//                         ]);
//                     } else {
//                         // Display the sender's own message without translation
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: data.message }
//                         ]);
//                     }
//                     break;

//                 default:
//                     console.warn('Unknown message type:', data.type);
//             }
//         };

//         ws.onclose = function (e) {
//             console.error('WebSocket connection closed:', e);
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current);
//                 timerRef.current = null;
//                 console.log('WebSocket closed. Timer cleared.');
//             }
//         };

//         // Cleanup on component unmount
//         return () => {
//             ws.close();
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current); // Cleanup the timer on component unmount
//                 console.log('Component unmounted. Timer cleared.');
//             }
//         };
//     }, [chatroomId, language, username]); // Removed userRole and timer from dependencies

//     const translateMessage = async (text, targetLanguage) => {
//         try {
//             const response = await axios.post(
//                 'https://translation.googleapis.com/language/translate/v2',
//                 {},
//                 {
//                     params: {
//                         q: text,
//                         target: targetLanguage, // Use the selected language here
//                         key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY, // Your API Key
//                     },
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             // Return the translated text
//             if (response.data && response.data.data && response.data.data.translations) {
//                 return response.data.data.translations[0].translatedText;
//             } else {
//                 console.error('Unexpected response format:', response.data);
//                 return text; // Return original text if unexpected response format
//             }
//         } catch (error) {
//             console.error('Error translating message:', error);
//             return text; // Fallback to the original message in case of error
//         }
//     };

//     const sendMessage = () => {
//         if (socket && newMessage.trim()) {
//             socket.send(JSON.stringify({
//                 'message': newMessage,
//                 'username': username,
//             }));
//             setNewMessage('');
//             console.log(`Message sent: ${newMessage}`);
//         }
//     };

//     const leaveChatroom = async () => {
//         try {
//             const csrfToken = Cookies.get('csrftoken');

//             await axios.post(
//                 'http://localhost:8000/chat/leave-chatroom/',
//                 {
//                     user_id: userId,
//                     chatroom_id: chatroomId
//                 },
//                 {
//                     headers: {
//                         'X-CSRFToken': csrfToken,
//                     },
//                     withCredentials: true,
//                 }
//             );
//             console.log('Left the chatroom successfully.');
//         } catch (error) {
//             console.error('Error leaving chatroom:', error);
//         }
//     };

//     return (
//         <div className="chatroom-container">
//             <h1>Chat Room: {chatroomId}</h1>
//             <p>{message}</p>

//             {/* Instruction for First User or when connected to ChatGPT */}
//             {(userRole === 'first' || (userRole === 'second' && isChatGPT)) && (
//                 <div id="first-user-instructions" style={{ display: 'block' }}>
//                     <h2>Welcome to the Chat!</h2>
//                     <p>Here are some instructions to get you started:</p>
//                     <img src="/images/first-user-instruction.png" alt="First User Instructions" />
//                     {/* Add more instructional content as needed */}
//                 </div>
//             )}

//             {/* Instruction for Second User (only when not connected to ChatGPT) */}
//             {userRole === 'second' && !isChatGPT && (
//                 <div id="second-user-instructions" style={{ display: 'block' }}>
//                     <h3>Welcome, Second User!</h3>
//                     <p>Here are some different instructions for you:</p>
//                     <img src="/images/taskimg1.jpg" alt="Second User Instructions" />
//                     {/* Add more instructional content as needed */}
//                 </div>
//             )}

//             <ul className="messages-list">
//                 {messages.map((message, index) => (
//                     <li key={index}><strong>{message.username}: </strong>{message.message}</li>
//                 ))}
//             </ul>
//             <div className="chatbar">
//                 <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     disabled={!canType}
//                 />
//                 <button onClick={sendMessage} disabled={!canType}>Send</button>
//                 <button onClick={leaveChatroom}>Leave</button>
//             </div>
//         </div>
//     );

// }

// export default ChatRoom;
// annotation
// annotation
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Annotation from 'react-image-annotation';

// // import './ChatRoom.css'; // Ensure you have the necessary styles

// function ChatRoom({ chatroomId, userId, username, message, language }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [socket, setSocket] = useState(null);
//     const [canType, setCanType] = useState(false);

//     // State variables for user role and ChatGPT connection
//     const [userRole, setUserRole] = useState(null); // 'first' or 'second'
//     const [isChatGPT, setIsChatGPT] = useState(false);

//     // State for annotations
//     const [annotation, setAnnotation] = useState({});
//     const [annotations, setAnnotations] = useState([]);

//     // Refs for userRole and timer
//     const userRoleRef = useRef(null);
//     const timerRef = useRef(null);
    
//     // State for selected tool
//     const [selectedTool, setSelectedTool] = useState('rectangle'); // default tool

//     // Memoize loadAnnotations to prevent redefinition on every render
//     const loadAnnotations = useCallback(async () => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:8000/chat/api/annotations/?chatroom_id=${chatroomId}`,
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     withCredentials: true,
//                 }
//             );

//             if (response.status === 200) {
//                 setAnnotations(response.data.map(annot => ({
//                     geometry: annot.geometry,
//                     data: annot.data,
//                     id: annot.id, // Ensure each annotation has a unique ID
//                 })));
//                 console.log('Annotations loaded successfully.');
//             }
//         } catch (error) {
//             console.error('Error loading annotations:', error);
//         }
//     }, [chatroomId]);

//     useEffect(() => {
//         const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatroomId}/`);
//         setSocket(ws);

//         ws.onopen = () => {
//             console.log('WebSocket connected');
//             // Connection established, wait for role message
//         };

//         ws.onmessage = async function (e) {
//             const data = JSON.parse(e.data);

//             switch (data.type) {
//                 case 'role':
//                     setUserRole(data.role);
//                     userRoleRef.current = data.role; // Update the ref
//                     setIsChatGPT(data.isChatGPT || false); // Set isChatGPT flag
//                     console.log(`Assigned role: ${data.role}, isChatGPT: ${data.isChatGPT}`);

//                     if (data.role === 'first') {
//                         // Start timer to wait for second user
//                         timerRef.current = setTimeout(() => {
//                             setCanType(true); // Allow typing if no second user joins
//                             setMessages((prevMessages) => [
//                                 ...prevMessages,
//                                 { username: 'System', message: 'You are now connected.' }
//                             ]);
//                             // Instructions remain for the first user
//                             console.log('2 minutes elapsed. Allowing typing for first user.');
//                         }, 120000); // 2 minutes

//                         // Load existing annotations for the first user
//                         loadAnnotations();
//                     } else if (data.role === 'second') {
//                         setCanType(true); // Allow typing immediately
//                         // Instructions are handled by conditional rendering below
//                         console.log('Second user connected. Allowing typing immediately.');
//                     }
//                     break;

//                 case 'user_joined':
//                     if (userRoleRef.current === 'first') {
//                         // Second user has joined, first user can type
//                         if (timerRef.current) {
//                             clearTimeout(timerRef.current); // Clear the timer
//                             timerRef.current = null;
//                             console.log('Second user joined before timer elapsed. Timer cleared.');
//                         }
//                         setCanType(true);
//                         setIsChatGPT(data.isChatGPT || false); // Update isChatGPT flag
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: 'System', message: data.message }
//                         ]);
//                         // Do not change instructions for the first user
//                     }
//                     // No action needed for second user regarding instructions
//                     break;

//                 case 'user_left':
//                     setCanType(false); // Disable typing if the second user leaves
//                     setMessages((prevMessages) => [
//                         ...prevMessages,
//                         { username: 'System', message: data.message }
//                     ]);
//                     // Instructions are handled by conditional rendering below
//                     console.log('A user has left the chatroom. Typing disabled.');
//                     break;

//                 case 'chat':
//                     if (data.username !== username) {
//                         // Translate incoming messages to the user's selected language
//                         const translatedMessage = await translateMessage(data.message, language); // Use selected language
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: translatedMessage }
//                         ]);
//                     } else {
//                         // Display the sender's own message without translation
//                         setMessages((prevMessages) => [
//                             ...prevMessages,
//                             { username: data.username, message: data.message }
//                         ]);
//                     }
//                     break;

//                 default:
//                     console.warn('Unknown message type:', data.type);
//             }
//         };

//         ws.onclose = function (e) {
//             console.error('WebSocket connection closed:', e);
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current);
//                 timerRef.current = null;
//                 console.log('WebSocket closed. Timer cleared.');
//             }
//         };

//         // Cleanup on component unmount
//         return () => {
//             ws.close();
//             if (timerRef.current) {
//                 clearTimeout(timerRef.current); // Cleanup the timer on component unmount
//                 console.log('Component unmounted. Timer cleared.');
//             }
//         };
//     }, [chatroomId, language, username, loadAnnotations]); // Included 'loadAnnotations' here

//     const translateMessage = async (text, targetLanguage) => {
//         try {
//             const response = await axios.post(
//                 'https://translation.googleapis.com/language/translate/v2',
//                 {},
//                 {
//                     params: {
//                         q: text,
//                         target: targetLanguage, // Use the selected language here
//                         key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY, // Your API Key
//                     },
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             // Return the translated text
//             if (response.data && response.data.data && response.data.data.translations) {
//                 return response.data.data.translations[0].translatedText;
//             } else {
//                 console.error('Unexpected response format:', response.data);
//                 return text; // Return original text if unexpected response format
//             }
//         } catch (error) {
//             console.error('Error translating message:', error);
//             return text; // Fallback to the original message in case of error
//         }
//     };

//     const sendMessage = () => {
//         if (socket && newMessage.trim()) {
//             socket.send(JSON.stringify({
//                 'message': newMessage,
//                 'username': username,
//             }));
//             setNewMessage('');
//             console.log(`Message sent: ${newMessage}`);
//         }
//     };

//     const leaveChatroom = async () => {
//         try {
//             const csrfToken = Cookies.get('csrftoken');

//             await axios.post(
//                 'http://localhost:8000/chat/leave-chatroom/',
//                 {
//                     user_id: userId,
//                     chatroom_id: chatroomId
//                 },
//                 {
//                     headers: {
//                         'X-CSRFToken': csrfToken,
//                     },
//                     withCredentials: true,
//                 }
//             );
//             console.log('Left the chatroom successfully.');
//         } catch (error) {
//             console.error('Error leaving chatroom:', error);
//         }
//     };

//     // Function to handle annotation changes
//     const onChange = (annotation) => {
//         setAnnotation(annotation);
//     };

//     // Function to handle annotation submission
//     const onSubmit = async (annotation) => {
//         if (selectedTool === 'erase') {
//             // Find the annotation to erase
//             const annotationToErase = annotations.find(
//                 (ann) =>
//                     ann.geometry.x === annotation.geometry.x &&
//                     ann.geometry.y === annotation.geometry.y &&
//                     ann.geometry.width === annotation.geometry.width &&
//                     ann.geometry.height === annotation.geometry.height
//             );

//             if (annotationToErase) {
//                 // Remove the annotation from the state
//                 const updatedAnnotations = annotations.filter(
//                     (ann) => ann !== annotationToErase
//                 );
//                 setAnnotations(updatedAnnotations);

//                 // Optionally, update the backend
//                 try {
//                     await axios.delete(
//                         `http://localhost:8000/chat/api/annotations/${annotationToErase.id}/`,
//                         {
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'X-CSRFToken': Cookies.get('csrftoken'),
//                             },
//                             withCredentials: true,
//                         }
//                     );
//                     console.log('Annotation erased successfully.');
//                 } catch (error) {
//                     console.error('Error erasing annotation:', error);
//                 }
//             }
//         } else {
//             // Handle adding a new annotation
//             const { geometry, data } = annotation;

//             // Prepare the annotation data to send to the backend
//             const annotationData = {
//                 chatroom_id: chatroomId,
//                 user_id: userId,
//                 geometry: geometry,
//                 data: data,
//             };

//             try {
//                 const response = await axios.post(
//                     'http://localhost:8000/chat/api/annotations/',
//                     annotationData,
//                     {
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'X-CSRFToken': Cookies.get('csrftoken'),
//                         },
//                         withCredentials: true,
//                     }
//                 );

//                 if (response.status === 201) {
//                     console.log('Annotation saved successfully.');
//                     // Update the annotations state with the new annotation
//                     setAnnotations([...annotations, response.data]);
//                 }
//             } catch (error) {
//                 console.error('Error saving annotation:', error);
//             }
//         }

//         // Reset the annotation value
//         setAnnotation({});
//     };

//     // Function to load existing annotations from the backend
    

//     // Function to clear all annotations
//     const clearAnnotations = async () => {
//         try {
//             // Optionally, implement backend API to delete all annotations for the chatroom
//             await axios.delete(
//                 `http://localhost:8000/chat/api/annotations/clear/?chatroom_id=${chatroomId}`,
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-CSRFToken': Cookies.get('csrftoken'),
//                     },
//                     withCredentials: true,
//                 }
//             );

//             setAnnotations([]);
//             console.log('All annotations cleared successfully.');
//         } catch (error) {
//             console.error('Error clearing annotations:', error);
//         }
//     };

//     return (
//         <div className="chatroom-container">
//             <h1>Chat Room: {chatroomId}</h1>
//             <p>{message}</p>

//             {/* Annotation Tools */}
//             {(userRole === 'first' || (userRole === 'second' && isChatGPT)) && (
//                 <div id="first-user-instructions" style={{ display: 'block' }}>
//                     <h2>Welcome to the Chat!</h2>
//                     <p>Here are some instructions to get you started:</p>
                    
//                     {/* Annotation Tool Buttons */}
//                     <div className="annotation-tools">
//                         <button
//                             onClick={() => setSelectedTool('rectangle')}
//                             className={selectedTool === 'rectangle' ? 'active' : ''}
//                         >
//                             Rectangle
//                         </button>
//                         <button
//                             onClick={() => setSelectedTool('erase')}
//                             className={selectedTool === 'erase' ? 'active' : ''}
//                         >
//                             Erase
//                         </button>
//                         <button
//                             onClick={clearAnnotations}
//                         >
//                             Clear All
//                         </button>
//                     </div>

//                     {/* Annotation Component */}
//                     <Annotation
//                         src="/images/taskimg1.jpg"
//                         alt="First User Instructions"
//                         annotations={annotations}
//                         type={selectedTool === 'erase' ? 'rectangle' : 'rectangle'} // Keep type as rectangle for drawing
//                         value={annotation}
//                         onChange={onChange}
//                         onSubmit={onSubmit}
//                     />

//                     {/* Instructions */}
//                     <p>Use the tools above to annotate the image as needed.</p>
//                 </div>
//             )}

//             {/* Instruction for Second User (only when not connected to ChatGPT) */}
//             {userRole === 'second' && !isChatGPT && (
//                 <div id="second-user-instructions" style={{ display: 'block' }}>
//                     <h3>Welcome, Second User!</h3>
//                     <p>Here are some different instructions for you:</p>
//                     <img src="/images/taskimg1.jpg" alt="Second User Instructions" />
//                     {/* Add more instructional content as needed */}
//                 </div>
//             )}

//             <ul className="messages-list">
//                 {messages.map((message, index) => (
//                     <li key={index}><strong>{message.username}: </strong>{message.message}</li>
//                 ))}
//             </ul>
//             <div className="chatbar">
//                 <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     disabled={!canType}
//                 />
//                 <button onClick={sendMessage} disabled={!canType}>Send</button>
//                 <button onClick={leaveChatroom}>Leave</button>
//             </div>
//         </div>
//     );

// }

// export default ChatRoom;

// revised annotation
// src/components/ChatRoom.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Annotation from 'react-image-annotation';
import './ChatRoom.css'; // Ensure you have the necessary styles
import html2canvas from 'html2canvas';
import crypto from 'crypto';

function ChatRoom({ chatroomId, userId, username, message, language }) {
    // **State Variables**
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [canType, setCanType] = useState(false);

    // **User Role and ChatGPT Connection**
    const [userRole, setUserRole] = useState(null); // 'first' or 'second'
    const [isChatGPT, setIsChatGPT] = useState(false);

    // **Annotations State**
    const [annotation, setAnnotation] = useState({});
    const [annotations, setAnnotations] = useState([]);
    
    
   

    // **Refs**
    const userRoleRef = useRef(null);
    const timerRef = useRef(null);
    const annotationRef = useRef(null);
    // **Selected Tool**
    const [selectedTool] = useState('RECTANGLE'); // Default tool// Default tool
    const [isSaving, setIsSaving] = useState(false); // <-- Define isSaving
    const [saveSuccess, setSaveSuccess] = useState(false); // <-- Define saveSuccess
    const [saveError, setSaveError] = useState(null);
    const [annotationCount, setAnnotationCount] = useState(0);
    const [paymentCode, setPaymentCode] = useState(null);

    const generateSHA256Code = (userId, chatroomId) => {
        const timestamp = new Date().toISOString(); // Use timestamp for added uniqueness
        const uniqueString = `${userId}-${chatroomId}-${timestamp}`;
        
        return crypto.createHash('sha256').update(uniqueString).digest('hex');
    };
    /**
     * **Load Annotations**
     * Fetches existing annotations from the backend for the current chatroom.
     */
    const loadAnnotations = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/chat/api/annotations/?chatroom_id=${chatroomId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setAnnotations(response.data.map(annot => ({
                    geometry: annot.geometry,
                    data: annot.data,
                    id: annot.id, // Ensure each annotation has a unique ID
                })));
                console.log('Annotations loaded successfully.');
            }
        } catch (error) {
            console.error('Error loading annotations:', error);
        }
    }, [chatroomId]);

   
    /**
     * **WebSocket Setup**
     * Establishes a WebSocket connection and handles incoming messages.
     */
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatroomId}/`);
        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connected');
            // Connection established, wait for role message
        };

        ws.onmessage = async function (e) {
            const data = JSON.parse(e.data);

            switch (data.type) {
                case 'role':
                    setUserRole(data.role);
                    userRoleRef.current = data.role; // Update the ref
                    setIsChatGPT(data.isChatGPT || false); // Set isChatGPT flag
                    console.log(`Assigned role: ${data.role}, isChatGPT: ${data.isChatGPT}`);

                    if (data.role === 'first') {
                        // Start timer to wait for second user
                        timerRef.current = setTimeout(() => {
                            setCanType(true); // Allow typing if no second user joins
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                { username: 'System', message: 'You are now connected.' }
                            ]);
                            console.log('2 minutes elapsed. Allowing typing for first user.');
                        }, 120000); // 2 minutes

                        // Load existing annotations for the first user
                        loadAnnotations();
                    } else if (data.role === 'second') {
                        setCanType(true); // Allow typing immediately
                        console.log('Second user connected. Allowing typing immediately.');
                    }
                    break;

                case 'user_joined':
                    if (userRoleRef.current === 'first') {
                        // Second user has joined, first user can type
                        if (timerRef.current) {
                            clearTimeout(timerRef.current); // Clear the timer
                            timerRef.current = null;
                            console.log('Second user joined before timer elapsed. Timer cleared.');
                        }
                        setCanType(true);
                        setIsChatGPT(data.isChatGPT || false); // Update isChatGPT flag
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { username: 'System', message: data.message }
                        ]);
                        // Do not change instructions for the first user
                    }
                    break;

                case 'user_left':
                    setCanType(false); // Disable typing if the second user leaves
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { username: 'System', message: data.message }
                    ]);
                    console.log('A user has left the chatroom. Typing disabled.');
                    break;

                case 'chat':
                    if (data.username !== username) {
                        // Translate incoming messages to the user's selected language
                        const translatedMessage = await translateMessage(data.message, language); // Use selected language
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { username: data.username, message: translatedMessage }
                        ]);
                    } else {
                        // Display the sender's own message without translation
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { username: data.username, message: data.message }
                        ]);
                    }
                    break;

                default:
                    console.warn('Unknown message type:', data.type);
            }
        };

        ws.onclose = function (e) {
            console.error('WebSocket connection closed:', e);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
                console.log('WebSocket closed. Timer cleared.');
            }
        };

        // Cleanup on component unmount
        return () => {
            ws.close();
            if (timerRef.current) {
                clearTimeout(timerRef.current); // Cleanup the timer on component unmount
                console.log('Component unmounted. Timer cleared.');
            }
        };
    }, [chatroomId, language, username, loadAnnotations]); // Included 'loadAnnotations' here

    /**
     * **Translate Message**
     * Translates a given text to the target language using Google Translate API.
     */
    const translateMessage = async (text, targetLanguage) => {
        try {
            const response = await axios.post(
                'https://translation.googleapis.com/language/translate/v2',
                {},
                {
                    params: {
                        q: text,
                        target: targetLanguage, // Use the selected language here
                        key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY, // Your API Key
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Return the translated text
            if (response.data && response.data.data && response.data.data.translations) {
                return response.data.data.translations[0].translatedText;
            } else {
                console.error('Unexpected response format:', response.data);
                return text; // Return original text if unexpected response format
            }
        } catch (error) {
            console.error('Error translating message:', error);
            return text; // Fallback to the original message in case of error
        }
    };

    /**
     * **Send Message**
     * Sends a new message through the WebSocket connection.
     */
    const sendMessage = () => {
        if (socket && newMessage.trim()) {
            socket.send(JSON.stringify({
                'message': newMessage,
                'username': username,
            }));
            setNewMessage('');
            console.log(`Message sent: ${newMessage}`);
        }
    };

    /**
     * **Leave Chatroom**
     * Allows the user to leave the chatroom by notifying the backend.
     */
    // const leaveChatroom = async () => {
    //     try {
    //         const csrfToken = Cookies.get('csrftoken');

    //         await axios.post(
    //             'http://localhost:8000/chat/leave-chatroom/',
    //             {
    //                 user_id: userId,
    //                 chatroom_id: chatroomId
    //             },
    //             {
    //                 headers: {
    //                     'X-CSRFToken': csrfToken,
    //                 },
    //                 withCredentials: true,
    //             }
    //         );
    //         console.log('Left the chatroom successfully.');
    //         // Optionally, redirect the user or update the UI accordingly
    //     } catch (error) {
    //         console.error('Error leaving chatroom:', error);
    //     }
    // };

    /**
     * **Handle Annotation Change**
     * Updates the current annotation being created.
     */
    const onChange = (annotation) => {
        console.log('Annotation changed:', annotation);
        setAnnotation(annotation);
    };

    const onSubmit = async (annotation) => {
        console.log('Submitting annotation:', annotation);
        const { geometry, data } = annotation;
    
        // Prompt the user to enter text for the annotation
        const annotationText = prompt('Enter annotation text:', data.text || '');
    
        if (!annotationText) {
            alert('Annotation text is required.');
            return;
        }
    
        const annotationData = {
            chatroom: chatroomId,
            user: userId,
            geometry, 
            text: annotationText,  // Use the entered text
        };
    
        try {
            const response = await axios.post(
                'http://localhost:8000/chat/api/annotations/',
                annotationData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': Cookies.get('csrftoken'),
                    },
                    withCredentials: true,
                }
            );
    
            if (response.status === 201) {
                console.log('Annotation saved successfully.');
                // Update the annotations state with the new annotation
                setAnnotations([...annotations, {
                    geometry: response.data.geometry,
                    data: { text: response.data.text },
                    id: response.data.id,
                }]);
                const newCount = annotationCount + 1;
                setAnnotationCount(newCount);
    
                // Display SHA-256 payment code on 5th annotation submission
                if (newCount === 5) {
                    const shaCode = generateSHA256Code(userId, chatroomId); // Generate unique SHA-256 code
                    setPaymentCode(shaCode);
                    alert(`Congratulations! Your payment code is: ${shaCode}`);
                }
            
            }
        } catch (error) {
            console.error('Error saving annotation:', error);
        }
        // Reset the annotation value
        setAnnotation({});
    };
    const saveAnnotatedImage = async () => {
        if (annotationRef.current) {
            try {
                console.log('Starting saveAnnotatedImage function');
                setIsSaving(true); // Set saving state to true
    
                const canvas = await html2canvas(annotationRef.current, {
                    useCORS: true, // Enable cross-origin images if necessary
                    allowTaint: true,
                    backgroundColor: null, // Preserve transparency
                });
    
                const imgData = canvas.toDataURL('image/png');
                console.log('Canvas captured:', imgData);
    
                // Trigger download
                // const link = document.createElement('a');
                // link.href = imgData;
                // link.download = `annotated_chatroom_${chatroomId}.png`;
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);
                // console.log('Image download triggered');
    
                // Upload to backend
                const uploadResponse = await axios.post(
                    'http://localhost:8000/chat/api/annotated-image/save/',
                    {
                        image: imgData,
                        chatroom_id: chatroomId,
                        user_id: userId,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': Cookies.get('csrftoken'),
                        },
                        withCredentials: true,
                    }
                );
    
                console.log('Upload response:', uploadResponse.data);
    
                setIsSaving(false); // Reset saving state
                setSaveSuccess(true); // Indicate success
                setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
            } catch (error) {
                console.error('Error saving annotated image:', error);
                setIsSaving(false); // Reset saving state
                setSaveError('Failed to save annotated image.'); // Set error message
                setTimeout(() => setSaveError(null), 3000); // Hide error message after 3 seconds
            }
        }
    };
    
    
    
    return (
        <div className="chatroom-container">
            <h1>Chat Room: {chatroomId}</h1>
            {/* <p>{message}</p> */}
        <div className="task-instructions">
               
            

            {/* **Annotation Tools and Instructions** */}
            {(userRole === 'first' || (userRole === 'second' && isChatGPT)) && (
                <div id="annotation-section" className="annotation-section" ref={annotationRef}>
                    {/* <h2>Welcome to the Chat!</h2> */}
                    <p>
                        {/* Hello! Welcome to the task. Read the instructions carefully below:
                    <br></br> */}
                    {/* This task is about annotation of images. You will be provided with an image that you need to annotate using the Rectangle tool.<br></br>
                    You have to place the cursor on the image and drag it to create a rectangle around the object in the image.<br></br>
                    Once you have created the rectangle, you will be prompted to enter a text description for the annotation.<br></br>
                    Click on the Save Annotated Image button to save the annotated image.<br></br><br></br>
                     */}
                    <strong>Chat Instructions</strong><br></br>
                    Use the chat window to communicate with the other user.<br></br>
                    The user connected to you will help you with the task.<br></br>
                    You can also use the chat window to ask questions or seek clarifications.<br></br>
                    The other user will tell you which things you need to annotate in the image.<br></br>
                    Remember to save the annotated image once you have completed the task.<br></br>
                    There are total three questions in this task.<br></br>
                    Only when you submit the annotations of the three questions, the task will be completed and payment code will be revealed.<br></br>

                    Let's get started! Ask questions in your chosen language in the chatbox below about the task.<br></br>





                    </p>
                    
                    {/* Annotation Tool Buttons */}


        <Annotation
            src="/images/taskimg1.jpg" // Ensure this path is correct
            alt="Annotation Area"
            annotations={annotations}
            type={selectedTool }// 'NONE' disables drawing when erase is selected
            value={annotation}
            onChange={onChange}
            onSubmit={onSubmit}
             // Handle clicks for erase
        />
                    {/* <p>Use the Rectangle tool above to annotate the image as needed.</p>
                    {/* **Feedback Messages** */}
                    {/* {saveSuccess && <p style={{ color: 'green' }}>Annotated image saved successfully!</p>}
                    {saveError && <p style={{ color: 'red' }}>{saveError}</p>} */} 
                

            
                    <div className="annotation-tools">
                    {/* <button
                        onClick={() => setSelectedTool('RECTANGLE')}
                        className={selectedTool === 'RECTANGLE' ? 'active' : ''}
                    >
                        Rectangle
                    </button>  */}
                    
                <button
                                    onClick={saveAnnotatedImage}
                                    disabled={annotations.length === 0 || isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Annotated Image'}
                                </button>
                                <p>Use the Rectangle tool above to annotate the image as needed.</p>
                            {/* **Feedback Messages** */}
                            {saveSuccess && <p style={{ color: 'green' }}>Annotated image saved successfully!</p>}
                            {saveError && <p style={{ color: 'red' }}>{saveError}</p>}
                    
                    </div>
                    {paymentCode && (
                    <div className="payment-code">
                        <p>Your Payment Code: <strong>{paymentCode}</strong></p>
                    </div>
                )}
                </div>

            )}

            {/* **Instructions for Second User (Non-ChatGPT)** */}
            {userRole === 'second' && !isChatGPT && (
                <div id="second-user-instructions" className="second-user-instructions" >
                    <h3>Welcome, Second User!</h3>
                    <p>Here are some different instructions for you:</p>
                    <img src="/images/taskimg1.jpg" alt="Second User Instructions" />
                    {/* Add more instructional content as needed */}
                </div>
            )}
            </div>
            <div className="chat-section">
            <p>{message}</p>
            <div className="chat-window">
            {/* **Messages List** */}

            {messages.map((msg, index) => (
                         <div key={index} className={`message-container ${msg.username === username ? 'self' : 'other'}`}>
                         <div className={`chat-message ${msg.username === username ? 'self' : 'other'}`}>
                            <strong>{msg.username}: </strong>
                            <span>{msg.message}</span>
                        </div>
                        </div>
                    ))}
            
            </div>
            {/* **Chat Input and Controls** */}
            <div className="chatbar">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    disabled={!canType}
                />
                <button onClick={sendMessage} disabled={!canType}>Send</button>
                {/* <button onClick={leaveChatroom}>Leave</button> */}
            </div>
            </div>
        </div>
    );
}

export default ChatRoom;

