import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext';

const UserAuth = ({ onSuccess }) => {
  const [toggleSignUp, setToggleSignUp] = useState(false); // login or signup
  const [isOtpFormVisible, setOtpFormVisible] = useState(false); // signup → OTP
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // OTP fields
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const userType = localStorage.getItem('usertype');
    const userEmail = localStorage.getItem('userEmail');
    if (!onSuccess && userType === 'user' && userEmail) {
      navigate('/');
    }
  }, [navigate, onSuccess]);

  const handleToggle = () => {
    setToggleSignUp((prev) => !prev);
    setOtpFormVisible(false); // reset OTP form if switching modes
  };

  // LOGIN handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error('Please fill in all login fields.');
      return;
    }
  
    try {
      setIsLoading(true);
  
      const response = await axios.post(
        'http://localhost:5000/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.status === 200) {
        const user = response.data.user;
        const token = response.data.token;
  
        // ✅ Save to localStorage as requested
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('usertype', 'user');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('token', token); // optional, if you want to use it
  
        login(user, token);
  
        if (onSuccess) {
          onSuccess();
        } else {
          const redirectTo = localStorage.getItem('redirectTo');
          if (redirectTo) {
            navigate(redirectTo);
            localStorage.removeItem('redirectTo');
          } else {
            navigate('/');
          }
        }
      } else {
        toast.error('Invalid email or password.');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // SIGNUP handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all signup fields.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(signupEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/auth/register', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success('Signup successful! OTP sent to your email.');
        setOtpFormVisible(true); // Only show OTP form if signup + OTP sending succeeded
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('User already exists. Please log in.');
      } else {
        toast.error(err.response?.data?.message || 'Sign up failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification handler
  // OTP verification handler
  const handleOtpVerification = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter the complete OTP.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:5000/auth/verifyEmail', {
        code: otp, // ✅ backend expects "code"
      });
      if (response.data.success) {
        toast.success('OTP verified! You can now log in.');
        // Reset everything and go back to login form
        setToggleSignUp(false);
        setOtpFormVisible(false);
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setOtp('');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch {
      toast.error('OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      className="max-w-md relative flex flex-col p-4 rounded-md text-black bg-white"
      style={{ backfaceVisibility: 'hidden' }}
    >
      {/* LOGIN FORM */}
      {!toggleSignUp ? (
        <>
          <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">
            Welcome back to <span className="text-orange-400">TicketFlix</span>
          </div>
          <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
            Log in to your account
          </div>
          <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-gray-600 text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="rounded border border-gray-200 text-sm w-full p-[11px] h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="rounded border border-gray-200 text-sm w-full p-[11px] h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-400 w-max m-auto px-6 py-2 rounded text-white text-sm"
            >
              {isLoading ? 'Loading...' : "Let's go!"}
            </button>
          </form>
          <div className="text-sm text-center mt-6">
            Don’t have an account yet?{' '}
            <button
              type="button"
              onClick={handleToggle}
              className="text-orange-400 underline"
            >
              Sign up for free!
            </button>
          </div>
        </>
      ) : (
        // SIGNUP or OTP
        <>
          {!isOtpFormVisible ? (
            <>
              <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center">
                Create your <span className="text-orange-400">TicketFlix</span> account
              </div>
              <form className="flex flex-col gap-3" onSubmit={handleSignupSubmit}>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="rounded border border-gray-200 text-sm w-full p-[11px] h-11"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="rounded border border-gray-200 text-sm w-full p-[11px] h-11"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="rounded border border-gray-200 text-sm w-full p-[11px] h-11"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-400 w-max m-auto px-6 py-2 rounded text-white text-sm"
                >
                  {isLoading ? 'Loading...' : 'Sign up'}
                </button>
              </form>
              <div className="text-sm text-center mt-6">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-orange-400 underline"
                >
                  Log in here
                </button>
              </div>
            </>
          ) : (
            <VerifyOTP
              email={signupEmail}
              otp={otp}
              setOtp={setOtp}
              onVerifyOtp={handleOtpVerification}
              isLoading={isLoading}
            />
          )}
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default UserAuth;

// OTP Component
const VerifyOTP = ({ email, otp, setOtp, onVerifyOtp, isLoading, onResendOtp }) => {
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Countdown effect
  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleResend = async () => {
    try {
      const res = await axios.post("http://localhost:5000/auth/resendVerificationCode", {
        email,
      });

      if (res.data.success) {
        alert("Verification code resent successfully!");
        setTimer(30);
        setIsResendDisabled(true);
      } else {
        alert(res.data.message || "Failed to resend code");
      }
    } catch (err) {
      console.error(err);
      alert("Error resending verification code");
    }
  };

  return (
    <StyledWrapper>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          onVerifyOtp();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px" viewBox="0 0 16 16" fill="none" transform="matrix(1, 0, 0, 1, 0, 0)" stroke="">

          <g id="SVGRepo_bgCarrier" stroke-width="0" />

          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

          <g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16L4.35009 13.3929C2.24773 11.8912 1 9.46667 1 6.88306V3L8 0L15 3V6.88306C15 9.46667 13.7523 11.8912 11.6499 13.3929L8 16ZM12.2071 5.70711L10.7929 4.29289L7 8.08579L5.20711 6.29289L3.79289 7.70711L7 10.9142L12.2071 5.70711Z" fill="#FFA726" /> </g>

        </svg>
        <div className="title">Verify your Email </div>
        <div className="title"></div>
        <p className="message">
          We have sent a verification code to your email ({email})
        </p>

        <div className="inputs">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={otp[i] || ""}
              onChange={(e) => {
                const newOtp = otp.split("");
                newOtp[i] = e.target.value;
                setOtp(newOtp.join(""));
              }}
            />
          ))}
        </div>

        <button className="action" type="submit" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify me"}
        </button>

        <button
          type="button"
          className="resend"
          disabled={isResendDisabled}
          onClick={handleResend}
        >
          {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend Code"}
        </button>
      </form>
    </StyledWrapper>
  );
};

// Styles for OTP form
const StyledWrapper = styled.div`
          .form {
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: space-around;
            width: 300px;
            background-color: white;
            border-radius: 12px;
            padding: 20px;
          }
        
          .title {
            font-size: 20px;
            font-weight: bold;
            color: black
          }
        
          .message {
            color: #a3a3a3;
            font-size: 14px;
            margin-top: 4px;
            text-align: center
          }
        
          .inputs {
            margin-top: 10px
          }
        
          .inputs input {
            width: 32px;
            height: 32px;
            text-align: center;
            border: none;
            border-bottom: 1.5px solid #d2d2d2;
            margin: 0 10px;
          }
        
          .inputs input:focus {
            border-bottom: 1.5px solid royalblue;
            outline: none;
          }

          .resend {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #007bff;
            cursor: pointer;
            border: none;
            background: none;
          }
          .resend[disabled] {
            color: gray;
            cursor: not-allowed;
          }

        
          .action {
            margin-top: 24px;
            padding: 12px 16px;
            border-radius: 8px;
            border: none;
            background-color: #FFA726;
            color: white;
            cursor: pointer;
            align-item:center ;
          }`;