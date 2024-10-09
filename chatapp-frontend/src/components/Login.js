import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8000/dj-rest-auth/login/', {
        email,
        password,
      });
     
      const token = response.data.key;
            console.log('Login successful, token:', token); // Debugging token
            localStorage.setItem('token', token);
              // Fetch the username using the token
      const userResponse = await axios.get('http://localhost:8000/dj-rest-auth/user/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      const username = userResponse.data.username;
      localStorage.setItem('email', email);
      localStorage.setItem('username', username); // Store username in local storage

      history.push('/chatroom-selection');
    
    } catch (error) {
      console.error('Error logging in', error.response.data);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default Login;
