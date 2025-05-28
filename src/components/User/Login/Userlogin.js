import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Login/Userlogin.css';

function Userlogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRightPanelActive, setRightPanelActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if the user is already logged in (based on user role in localStorage)
  useEffect(() => {
    const userType = localStorage.getItem('usertype');
    const userEmail = localStorage.getItem('userEmail');
    // Redirect only if both the user type and the user email exist
    if (userType === 'user' && userEmail) {
      navigate('/'); // Redirect to user home if logged in as a user
    }
  }, [navigate]);
  

  const handleSignUpClick = () => {
    setRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setRightPanelActive(false);
  };

  const handleSignIn = async (e, email, password) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = { email, password };

    try {
      const response = await axios.post('https://ticketflix-backend.onrender.com/userlogin', userData);
      if (response.status === 201) {
        console.log('Signed in successfully:', response.data);
      
        // Store the whole user object
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Store user type as 'user'
        localStorage.setItem('usertype', 'user');
        // *Store the email explicitly*
        localStorage.setItem('userEmail', response.data.user.email);
      
        // Check for a redirect URL in localStorage
        const redirectTo = localStorage.getItem('redirectTo');
        if (redirectTo) {
          navigate(redirectTo);
          localStorage.removeItem('redirectTo');
        } else {
          navigate('/');
        }
      }       else {
        setErrorMessage('Invalid email or password.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.status === 401) {
        setErrorMessage('Invalid email or password.');
      } else {
        setErrorMessage('An error occurred while logging in. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name, email, password) => {
    try {
      const response = await axios.post('https://ticketflix-backend.onrender.com/userssignup', { name, email, password });
      if (response.status === 200) {
        setErrorMessage('Sign up successful! Please log in.');
        setRightPanelActive(false); // Switch to Sign In panel
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Sign up failed. Please try again later.');
    }
  };

  return (
    <div className={`user-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      <SignUpContainer onSignUp={handleSignUp} errorMessage={errorMessage} />
      <SignInContainer onSignIn={handleSignIn} errorMessage={errorMessage} />
      <OverlayContainer onSignUpClick={handleSignUpClick} onSignInClick={handleSignInClick} />
    </div>
  );
}

function SignUpContainer({ onSignUp, errorMessage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onSignUp(name, email, password);  // Pass data to parent function
  };

  return (
    <div className="form-container-user user-sign-up-container">
      <form className="form-userlogin-user" onSubmit={handleSubmit}>
        <h1 className="user-login-heading">Create Account</h1>
        <div className="social-container-signup">
          <a href="#" className="social"><ion-icon name="logo-facebook"></ion-icon></a>
          <a href="#" className="social"><ion-icon name="logo-google"></ion-icon></a>
          <a href="#" className="social"><ion-icon name="logo-linkedin"></ion-icon></a>
        </div>
        <span className="span-userlogin">or use your email for registration</span>
        <input className="signup-input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="signup-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="signup-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error-message">{error}</p>}
        {errorMessage && <p className="success-message">{errorMessage}</p>} {/* Display success or error message */}
        <button className="signup-button" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

function SignInContainer({ onSignIn, errorMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onSignIn(e, email, password);  // Pass data to parent function
  };

  return (
    <div className="form-container-user sign-in-container-user">
      <form className="form-userlogin-user" onSubmit={handleSubmit}>
        <h1 className="heading">Sign in</h1>
        <div className="social-container-signup">
          <a href="#" className="social"><ion-icon name="logo-facebook"></ion-icon></a>
          <a href="#" className="social"><ion-icon name="logo-google"></ion-icon></a>
          <a href="#" className="social"><ion-icon name="logo-linkedin"></ion-icon></a>
        </div>
        <span className="span-userlogin">or use your account</span>
        <input className="signup-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="signup-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error-message">{error}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
        <a href="#">Forgot your password?</a>
        <button className="signup-button" type="submit">Sign In</button>
      </form>
    </div>
  );
}

function OverlayContainer({ onSignUpClick, onSignInClick }) {
  return (
    <div className="overlay-container-userlogin">
      <div className="overlay-userlogin">
        <OverlayPanelLeft onSignInClick={onSignInClick} />
        <OverlayPanelRight onSignUpClick={onSignUpClick} />
      </div>
    </div>
  );
}

function OverlayPanelLeft({ onSignInClick }) {
  return (
    <div className="overlay-panel-user overlay-left-left">
      <h1 className="heading">Welcome Back!</h1>
      <p className="para-userlogin">To keep connected with us please login with your personal info</p>
      <button className="button-ghost" id="signIn" onClick={onSignInClick}>Sign In</button>
    </div>
  );
}

function OverlayPanelRight({ onSignUpClick }) {
  return (
    <div className="overlay-panel-user overlay-right-right">
      <h1 className="heading">Hello, Friend!</h1>
      <p className="para-userlogin">Enter your personal details and start journey with us</p>
      <button className="button-ghost" id="signUp" onClick={onSignUpClick}>Sign Up</button>
    </div>
  );
}

export default Userlogin;