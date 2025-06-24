import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserLogin() {
  const [toggleSignUp, setToggleSignUp] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('usertype');
    const userEmail = localStorage.getItem('userEmail');
    if (userType === 'user' && userEmail) {
      navigate('/');
    }
  }, [navigate]);

  const handleToggle = () => {
    setToggleSignUp(prev => !prev);
  };

  const handleLoginSubmit = async e => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all login fields.');
      return;
    }
    setIsLoading(true);
    try {
      const { status, data } = await axios.post('https://ticketflix-backend.onrender.com/userlogin', {
        email: loginEmail,
        password: loginPassword,
      });
      if (status === 201) {
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('usertype', 'user');
        localStorage.setItem('userEmail', user.email);
        const redirectTo = localStorage.getItem('redirectTo');
        if (redirectTo) {
          navigate(redirectTo);
          localStorage.removeItem('redirectTo');
        } else {
          navigate('/');
        }
      } else {
        toast.error('Invalid email or password.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async e => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all signup fields.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://ticketflix-backend.onrender.com/userssignup', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      // treat any 2xx as success
      if (response.status >= 200 && response.status < 300) {
        toast.success('Sign up successful!');
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        // flip back after a short delay so the toast is visible
        setTimeout(() => {
          setToggleSignUp(false);
        }, 300);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('User exists already, please login instead.');
      } else {
        toast.error(err.response?.data?.message || 'Sign up failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white pb-24">
      {/* single ToastContainer for all toasts */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <div className="relative" style={{ perspective: '1000px' }}>
        {/* Toggle */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <span
            className={`text-sm font-semibold transition-colors duration-200 ${
              toggleSignUp ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            Log in
          </span>
          <div
            onClick={handleToggle}
            className="relative w-12 h-6 border-2 border-gray-900 rounded-md bg-white cursor-pointer transition-colors duration-200"
          >
            <div
              className={`absolute inset-0 rounded-2 transition-colors duration-200 ${
                toggleSignUp ? 'bg-blue-500' : 'bg-white'
              }`}
            />
            <div
              className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 border-gray-900 rounded-md transform transition-transform duration-200 ${
                toggleSignUp ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
          <span
            className={`text-sm font-semibold transition-colors duration-200 ${
              toggleSignUp ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Sign up
          </span>
        </div>

        {/* Flip Card */}
        <div
          className="w-72 h-80 relative transition-transform duration-700"
          style={{
            transform: toggleSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Login Side */}
          <div
            className="absolute inset-0 bg-orange-500 border-2 border-gray-900 rounded-lg shadow-[4px_4px_0_#323232] flex flex-col items-center justify-center p-5"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <h2 className="text-gray-900 text-2xl font-bold mb-4">Log in</h2>
            <form
              className="w-full flex flex-col items-center gap-4"
              onSubmit={handleLoginSubmit}
            >
              <input
                type="email"
                placeholder="Email"
                className="w-64 h-10 px-3 border-2 border-gray-900 rounded-md shadow-[4px_4px_0_#323232] outline-none focus:border-blue-500"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-64 h-10 px-3 border-2 border-gray-900 rounded-md shadow-[4px_4px_0_#323232] outline-none focus:border-blue-500"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-32 h-10 mt-2 border-2 border-gray-900 rounded-md bg-white shadow-[4px_4px_0_#323232] font-bold active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {isLoading ? 'Loading...' : "Let's go!"}
              </button>
            </form>
          </div>

          {/* Signup Side */}
          <div
            className="absolute inset-0 bg-orange-500 border-2 border-gray-900 rounded-lg shadow-[4px_4px_0_#323232] flex flex-col items-center justify-center p-5"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h2 className="text-gray-900 text-2xl font-bold mb-4">Sign up</h2>
            <form
              className="w-full flex flex-col items-center gap-4"
              onSubmit={handleSignupSubmit}
            >
              <input
                type="text"
                placeholder="Name"
                className="w-64 h-10 px-3 border-2 border-gray-900 rounded-md shadow-[4px_4px_0_#323232] outline-none focus:border-blue-500"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-64 h-10 px-3 border-2 border-gray-900 rounded-md shadow-[4px_4px_0_#323232] outline-none focus:border-blue-500"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-64 h-10 px-3 border-2 border-gray-900 rounded-md shadow-[4px_4px_0_#323232] outline-none focus:border-blue-500"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-32 h-10 mt-2 border-2 border-gray-900 rounded-md bg-white shadow-[4px_4px_0_#323232] font-bold active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {isLoading ? 'Loading...' : 'Confirm!'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}