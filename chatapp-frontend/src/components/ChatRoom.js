
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
// import crypto from 'crypto';
import crypto from 'crypto';
const images = [
    '/images/taskimg1.jpg',  // Image for Task 1
    '/images/taskimg1.jpg',  // Image for Task 2
    '/images/taskimg1.jpg'   // Image for Task 3
];
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
    const [taskIndex, setTaskIndex] = useState(0);
    // **Refs**
    const userRoleRef = useRef(null);
    const timerRef = useRef(null);
    const annotationRef = useRef(null);
    // **Selected Tool**
    // const [selectedTool] = useState('RECTANGLE'); // Default tool// Default tool
    const [isSaving, setIsSaving] = useState(false); // <-- Define isSaving
    const [saveSuccess, setSaveSuccess] = useState(false); // <-- Define saveSuccess
    const [saveError, setSaveError] = useState(null);
    const [annotationCount, setAnnotationCount] = useState(0);
    const [paymentCode, setPaymentCode] = useState(null);

    // const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false); // Disable until 5 annotations are done
    const [copySuccess, setCopySuccess] = useState(false);
    const [taskAnnotations, setTaskAnnotations] = useState([]); // Store annotations for each task


    // const generateSHA256Code = (userId, chatroomId) => {
    //     const timestamp = new Date().toISOString(); // Use timestamp for added uniqueness
    //     const uniqueString = `${userId}-${chatroomId}-${timestamp}`;
        
    //     return crypto.createHash('sha256').update(uniqueString).digest('hex');
    // };
    /**
     * **Load Annotations**
     * Fetches existing annotations from the backend for the current chatroom.
     */
     // Uncomment if using Node's crypto package

// Step 3: Add useEffect to start the 12-minute timer when the second user joins
    const savePaymentCodeToBackend = useCallback(async (generatedCode) => {
        try {
            await axios.post(
                'https://thcrowdchatb-4acf13a87d2c.herokuapp.com/chat/api/save-payment-code/',
                {
                    chatroom_id: chatroomId,
                    user_id: userId,
                    payment_code: generatedCode,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log('Payment code saved successfully.');
        } catch (error) {
            console.error('Error saving payment code:', error);
        }
    }, [chatroomId, userId]);

    useEffect(() => {
        if (userRole === 'second' && !isChatGPT) {
            const paymentCodeTimer = setTimeout(() => {
                // Generate the payment code after 12 minutes
                const generatedCode = generatePaymentCode(userId, chatroomId);
                setPaymentCode(generatedCode); // Set the generated code to state
                savePaymentCodeToBackend(generatedCode); // Save payment code after generation
            }, 3 * 60 * 1000); // 12 minutes in milliseconds

            return () => clearTimeout(paymentCodeTimer); // Cleanup on component unmount or user leave
        }
    }, [userRole, isChatGPT, userId, chatroomId, savePaymentCodeToBackend]); // Include savePaymentCodeToBackend in the dependency array


    // const savePaymentCodeToBackend = async (generatedCode) => {
    //     try {
    //         await axios.post(
    //             'http://localhost:8000/chat/api/save-payment-code/',
    //             {
    //                 chatroom_id: chatroomId,
    //                 user_role: userRole, // Specify whether it's user1 or user2
    //                 payment_code: generatedCode
    //             },
    //             {
    //                 headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
    //                 withCredentials: true,
    //             }
    //         );
    //         console.log('Payment code saved successfully.');
    //     } catch (error) {
    //         console.error('Error saving payment code:', error);
    //     }
    // };
// Step 4: Function to generate SHA-based payment code
    const generatePaymentCode = (userId, chatroomId) => {
        const timestamp = new Date().toISOString(); // Add uniqueness with timestamp
        const uniqueString = `${userId}-${chatroomId}-${timestamp}`;
        return crypto.createHash('sha256').update(uniqueString).digest('hex');
    };

    const taskRequirements = [1, 6, 3];
    const handleCopyCode = () => {
        if (paymentCode) {
            navigator.clipboard.writeText(paymentCode)
                .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000); // Hide message after 2 seconds
                })
                .catch((err) => console.error('Failed to copy:', err));
        }
    };
    
    const loadAnnotations = useCallback(async () => {
        try {
            const response = await axios.get(
                `https://thcrowdchatb-4acf13a87d2c.herokuapp.com/chat/api/annotations/?chatroom_id=${chatroomId}`,
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
        const ws = new WebSocket(`wss://thcrowdchatb-4acf13a87d2c.herokuapp.com/ws/chat/${chatroomId}/`);
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
                                { username: 'System', message: 'The Instructor has joined the chat. After reading all the instructions on the left side of your screen, please ask questions here.' }
                            ]);
                            console.log('2 minutes elapsed. Allowing typing for first user.');
                        }, 120000); // 2 minutes

                        // Load existing annotations for the first user
                        loadAnnotations();
                    } else if (data.role === 'second') {
                        setCanType(true); // Allow typing immediately
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { username: 'System', message: 'You are now connected to the Intructor. After reading all the instructions on the left side of your screen, please guide here properly.' }
                        ]);
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
                        key: process.env.GOOGLE_TRANSLATOR_KEY, // Your API Key
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
        const { geometry, data } = annotation;
        const annotationText = prompt('Enter annotation text:', data.text || '');
    
        if (!annotationText) {
            alert('Annotation text is required.');
            return;
        }
    
        const annotationData = {
            chatroom: chatroomId,
            user: userId,
            geometry,
            text: annotationText,
        };
    
        try {
            // Assign the result of axios to response directly
            const response = await axios.post(
                'https://thcrowdchatb-4acf13a87d2c.herokuapp.com/chat/api/annotations/',
                annotationData,
                {
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
                    withCredentials: true,
                }
            );
    
            // Check response exists and status is correct
            if (response.status === 201) {
                setAnnotations([...annotations, {
                    geometry: response.data.geometry,
                    data: { text: response.data.text },
                    id: response.data.id,
                }]);
                setAnnotationCount(annotationCount + 1);
            }
        } catch (error) {
            console.error('Error saving annotation:', error);
        }
        setAnnotation({});
    };
    

    const handleNextTask = async () => {
        try {
            const canvas = await html2canvas(document.querySelector('#annotation-section'), { useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL('image/png');
            setTaskAnnotations([...taskAnnotations, { task: taskIndex + 1, imgData, annotations }]);
            setTaskIndex(taskIndex + 1);
            setAnnotationCount(0);
            setAnnotations([]);
        } catch (error) {
            console.error('Error capturing task annotation:', error);
        }
    };

    // const saveAnnotatedImage = async () => {
    //     setIsSaving(true);  // Set to true at start of save
    //     try {
    //         const response = await axios.post(
    //             'http://localhost:8000/chat/api/annotated-image/save/',
    //             {
    //                 chatroom_id: chatroomId,
    //                 user_id: userId,
    //                 tasks: taskAnnotations,
    //             },
    //             {
    //                 headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
    //                 withCredentials: true,
    //             }
    //         );
    
    //         setSaveSuccess(true);
    //         setPaymentCode(response.data.payment_code);
    //         setTimeout(() => setSaveSuccess(false), 3000);
    //     } catch (error) {
    //         console.error('Error saving annotated image:', error);
    //         setSaveError('Failed to save annotated images.');
    //         setTimeout(() => setSaveError(null), 3000);
    //     }
    //     setIsSaving(false);  // Set to false after save completes
    // };
    const saveAnnotatedImage = async () => {
        setIsSaving(true);  // Start saving process
    
        let updatedAnnotations = taskAnnotations;
        let imgData = null;
    
        // Check and capture Task 3 annotations if not already captured
        if (taskIndex === 2 && taskAnnotations.length < 3) {
            const canvas = await html2canvas(document.querySelector('#annotation-section'), { useCORS: true, allowTaint: true });
            imgData = canvas.toDataURL('image/png');
    
            // Add Task 3 annotations to `taskAnnotations`
            updatedAnnotations = [
                ...taskAnnotations,
                { task: taskIndex + 1, imgData, annotations }
            ];
    
            // Update state with Task 3 and wait for the state to be updated
            await new Promise(resolve => {
                setTaskAnnotations(updatedAnnotations);
                setTimeout(resolve, 100); // Small delay to ensure state update
            });
        }
    
        // Use the final `taskAnnotations` including Task 3
        try {
             await axios.post(
                'https://thcrowdchatb-4acf13a87d2c.herokuapp.com/chat/api/annotated-image/save/',
                {
                    chatroom_id: chatroomId,
                    user_id: userId,
                    tasks: updatedAnnotations,  // Send final annotations state
                },
                {
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Cookies.get('csrftoken') },
                    withCredentials: true,
                }
            );
    
            setSaveSuccess(true);
            const generatedCode = generatePaymentCode(userId, chatroomId);
            setPaymentCode(generatedCode);
            await savePaymentCodeToBackend(generatedCode);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving annotated image:', error);
            setSaveError('Failed to save annotated images.');
            setTimeout(() => setSaveError(null), 3000);
        }
        setIsSaving(false);  // End saving process
    };
    // Use isSaving to disable button during save operation
    // <button onClick={saveAnnotatedImage} disabled={isSaving || taskIndex < 2}>
    //     {isSaving ? 'Saving...' : 'Save Annotated Images'}
    // </button>
    
    return (
        <div className="chatroom-container">
            <h1>Chat Room: {chatroomId}</h1>
            {/* <p>{message}</p> */}
        <div className="content-container">
        <div className="task-instructions">
               
            

            {/* **Annotation Tools and Instructions** */}
            {(userRole === 'first' || (userRole === 'second' && isChatGPT)) && (
                <div id="annotation-section" className="annotation-section" ref={annotationRef}>
                    {/* <h2>Welcome to the Chat!</h2> */}
                    
                        {/* Hello! Welcome to the task. Read the instructions carefully below:
                    <br></br> */}
                    {/* This task is about annotation of images. You will be provided with an image that you need to annotate using the Rectangle tool.<br></br>
                    You have to place the cursor on the image and drag it to create a rectangle around the object in the image.<br></br>
                    Once you have created the rectangle, you will be prompted to enter a text description for the annotation.<br></br>
                    Click on the Save Annotated Image button to save the annotated image.<br></br><br></br>
                     */}
                    <center><strong>Welcome! You are the <b>Performer</b> of the Task. Please read the instructions carefully:</strong></center>
                    <ul>
                    <li>There will be a total of three annotation tasks: <b>Task 1</b>, <b>Task 2</b>, and <b>Task 3</b>.</li>
                    <li>At the end of the initial instructions, you will find <b>Task 1</b>, which is already visible.</li>
                    <li>Upon completing the annotation of the image in <b>Task 1</b>, a <b>Next button</b> will appear, allowing you to proceed to <b>Task 2</b>, followed by <b>Task 3</b> in the same manner.</li>
                    <li>On the <b>Right Side</b> of the screen, there is a <b>Chat Window</b> where an <b>Instructor</b> will be available to guide you through each task.</li>
                    <li>You will receive a notification when another user connects.</li>
                    <li>Use the <b>Chat Window</b> to ask questions in your previously <b>Selected Language</b> whenever you need clarification for correctly annotating an image.</li>
                    <li>For <b>example</b>, if your <b>Selected Language</b> is English, you could ask: "Hello! What do I need to do in <b>Task 1</b>?"</li>
                    <li>It is essential to ask questions in your <b>Selected Language</b>.</li>
                    <li>Please be specific when asking questions and <b>avoid sharing any personal information</b>.</li>
                    <li>Once you complete <b>Task 3</b> and click on <b>Save Annotated Images</b>, you will see a <b>Payment Code</b> at the bottom of the page.</li>
                    <li>Copy the <b>Payment Code</b> and paste it into Microworkers to receive your payment.</li>
                    <li>No worries, if the <b>Instructor</b> leaves the chat without guiding you properly, you will still be paid .</li>
                    </ul>


                    <center><strong style={{ color: 'green' }}>Task {taskIndex + 1} <br></br>  {taskIndex === 0 && 'Welcome to Task 1'}
                        {taskIndex === 1 && 'Congratulations, you are now on Task 2'}
                        {taskIndex === 2 && 'Congratulations, you are on Task 3'}</strong></center><br/>
                        <p>Annotate the image according to Instructor's guidance by placing the <b>Cursor</b>, clicking and then dragging to draw <b>Rectangles</b> on the image.
                        After drawing <b>Rectangle</b> on the fruits, there will be a <b> Description</b> popup. Please write the name of the fruit there and if you are sure about the
                        annotation, then press the <b>Submit</b> button there. If you are not sure, you can click anywhere on the image, then again you can draw the <b>Rectangle</b>.</p>
                    

                        <Annotation
                            src={images[taskIndex]}
                            alt="Annotation Area"
                            annotations={annotations}
                            type="RECTANGLE"
                            value={annotation}
                            onChange={onChange}
                            onSubmit={onSubmit}
                        />

                        {annotationCount >= taskRequirements[taskIndex] && (
                            taskIndex < 2 ? (
                                <button onClick={handleNextTask}>Next</button>
                            ) : (
                                <button onClick={saveAnnotatedImage} disabled={isSaving || taskIndex < 2}>
                                     {isSaving ? 'Saving...' : 'Save Annotated Images'}
                                 </button>
                        ))}
                        {saveSuccess && <p style={{ color: 'green' }}>Annotated image saved successfully!</p>}
                        {saveError && <p style={{ color: 'red' }}>{saveError}</p>}
                    </div>
                )}
                {paymentCode && (
                     <div className="payment-code-container">
                    <div className="payment-code-box">
                        <p>Your Payment Code: <strong>{paymentCode}</strong></p>
                        <button onClick={handleCopyCode} className="copy-button">Copy</button>
                        </div>
                        {copySuccess && <p>Copied to clipboard!</p>}
                    </div>
                )}
                
              <br></br>

            {/* **Instructions for Second User (Non-ChatGPT)** */}
            {userRole === 'second' && !isChatGPT && (
                <div id="second-user-instructions" className="second-user-instructions" >
                    <center><strong>Welcome! You are the Instructor of the task. Please read the instructions carefully:</strong></center>
                   
    <li>You are the Instructor. So you do not need to annotate anything, you will only guide the <b>Performer</b> to annotate.</li>               <ul>
    <li>There will be a total of three annotation tasks in the below <b>Image</b>: <b>Task 1</b>, <b>Task 2</b>, and <b>Task 3</b>.</li>
    <li>On the <b>right side</b> of the screen, there is a <b>Chat Window</b> where a <b>Performer</b> will be connected, whom you will guide through each task.</li>
    <li>The performer will complete <b>Task 1</b>, <b>Task 2</b>, and <b>Task 3</b>. You need to instruct them only on your previously <b>Selected Language</b> about what to perform in each task.</li>
    <li><b>Task 1</b> is to find and <b>annotate</b> the <b>banana</b> in the basket.</li>
    <li><b>Task 2</b> is to find and mark all the <b>red fruits</b> in the basket.</li>
    <li><b>Task 3</b> is to find and mark the <b>strawberry</b> in the basket.</li>
    <li>After each task there will be <b>Next button</b> below the image to go the next task for the Performer.</li>
    <li>The annotation will be done by clicking the mouse cursor and dragging it to draw a rectangle around the fruits.</li>
    <li><b>Do not share any personal information in the chat.</b></li>
    <li>When you are notified in the <b>Chat Window</b> that another user is connected, you can begin assisting them.</li>
    <li>Please do not rush; take your time and help them step by step.</li>
    <li>You can start your conversation by writing in your <b>Selected Language</b> as for Example in English, "Hello! How can I assist you today?"</li>
    <li>It is essential to instruct the <b>Performer</b> in your <b>Selected Language</b>.</li>
    <li>After assisting the Performer, you will see a <b>Payment Code</b> at the bottom of the page.</li>
    <li>Please wait for a total of <b>8 minutes</b> for the <b>Payment Code</b> to be generated. The <b>8 minutes</b> will be counted from the time you joined the chatroom. </li>
    <li>You need to copy and paste the <b>Payment Code</b> into Microworkers to receive your payment.</li>
    <li>If you do not properly assist and guide the <b>Performer</b>, you may not receive the payment, even if you copy and paste the code.</li>
    <li>But no worries, if the <b>Performer</b> leaves the chat in the middle of the task, you will still be paid.</li>
</ul>

        <br></br>
        
                    <img src="/images/taskimg1.jpg" alt="Second User Instructions" />
                    {/* Add more instructional content as needed */}
                </div>
            )}
               {/* Payment Code Display after 12-minute Timer */}
               {paymentCode && userRole === 'second' && !isChatGPT && (
                    <div className="payment-code-container">
                        <p>Your Payment Code: <strong>{paymentCode}</strong></p>
                        <button onClick={handleCopyCode} className="copy-button">Copy</button>
                        {copySuccess && <p>Copied to clipboard!</p>}
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
                            <strong>{msg.username === username ? 'You' : msg.username}:</strong>
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
        </div>
    );
}

export default ChatRoom;

