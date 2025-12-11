import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContainer = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login');
  const [authError, setAuthError] = useState('');

  //  LOGIN part 
  const handleLogin = async (loginData) => {
  try {
    setAuthError('');

    // Build payload matching UserModel (case-sensitive)
    const payload = {
      loginame: loginData.phone,      
      Password: loginData.password
    };
    debugger;
    const response = await axios.post(
      'https://grillnshakesapi.scurryinfotechllp.com/api/Order/Login',
      payload
    );

    if (response.data.success) {
      debugger;
      localStorage.setItem('userId', response.data.user.userId);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('loginame', response.data.user.loginame);
      toast.success('Login successful!');
      onAuthSuccess({
        user: response.data.user,
        token: response.data.token,
        type: 'login',
      });
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    setAuthError(error.response?.data?.message || error.message);
    throw error;
  }
};

  // ------------------ SIGNUP ------------------
  const handleSignup = async (signupData) => {
    

    try {
      setAuthError('');

      // Build payload matching UserModel
      const payload = {
        loginame: signupData.phone,   // required
        password: signupData.password,   // required
        name: signupData.name,  
        phone:signupData.phone         // required
        // createdDate: new Date().toISOString(), // backend requires DateTime
        // isActive: true,                  // default to active
      };
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkdyaWxsX05fU2hha2VzIiwibmJmIjoxNzU5MTMyMzY3LCJleHAiOjE3NjY5MDgzNjcsImlhdCI6MTc1OTEzMjM2N30.ko8YPHfApg0uN0k3kUTLcJXpZp-2s-6TiRHpsiab42Q"
      const response = await axios.post(
        'https://grillnshakesapi.scurryinfotechllp.com/api/Order/AddUser',
        payload,
        {
        headers: {
          Authorization: `Bearer ${token}`  // send token here
        }
      }
      );

      if (response.data.success) {
  localStorage.setItem("userId", response.data.user.userId);
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("loginame", response.data.user.loginame);
  toast.success("Signup successful — you are logged in!");
  onAuthSuccess({
    user: response.data.loginame,
    token: response.data.token,
    type: "signup",
  });
}
 else {
        throw new Error(response.data.message || 'Signup failed');
      }
      debugger;
    } catch (error) {
      setAuthError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  // ------------------ SWITCH VIEWS ------------------
  const handleSwitchToSignup = () => {
    setCurrentView('signup');
    setAuthError('');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
    setAuthError('');
  };

  return (
    <div>
      {currentView === 'login' ? (
        <Login
          onSwitchToSignup={handleSwitchToSignup}
          onLogin={handleLogin}
          authError={authError}
        />
      ) : (
        <Signup
          onSwitchToLogin={handleSwitchToLogin}
          onSignup={handleSignup}
          authError={authError}
        />
      )}
    </div>
  );
};

export default AuthContainer;
