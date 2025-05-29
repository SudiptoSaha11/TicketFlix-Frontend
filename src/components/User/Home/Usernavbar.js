import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import '../Home/Usernavbar.css';

const Usernavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check login on load
  useEffect(() => {
    const userType = localStorage.getItem('usertype');
    if (userType === 'user') {
      setIsLoggedIn(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setUsername(userObj.name);
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu  = () => setIsOpen(false);
  const goToHome   = () => navigate('/');

  // Detect if we're on a movie-related page
  const isMoviePage = location.pathname.toLowerCase().includes('movie');

  // Fetch suggestions with debounce
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const [movieRes, eventRes] = await Promise.all([
        axios.get(`https://ticketflix-backend.onrender.com/api/autocomplete?search=${query}`),
        axios.get(`https://ticketflix-backend.onrender.com/api/eventcomplete?search=${query}`)
      ]);
      const movieResults = movieRes.data.map(item => ({ ...item, type: 'movie' }));
      const eventResults = eventRes.data.map(item => ({ ...item, type: 'event' }));
      setSuggestions([...movieResults, ...eventResults]);
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(q => fetchSuggestions(q), 300),
    [isMoviePage]
  );

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleSelectSuggestion = (s) => {
    setSearchTerm('');
    setSuggestions([]);
    const detailPath = s.type === 'movie' ? 'moviedetails' : 'eventdetails';
    navigate(`/${detailPath}/${s._id}`, { state: s });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      if (isMoviePage) {
        const res = await axios.get(`https://ticketflix-backend.onrender.com/movieview?search=${searchTerm}`);
        navigate('/MoviePage', { state: { searchResults: res.data } });
      } else {
        const res = await axios.get(`https://ticketflix-backend.onrender.com/event?search=${searchTerm}`);
        navigate('/event', { state: { searchResults: res.data } });
      }
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  return (
    <>
      <div className="User-Navbar">
        <div className="navbar-logo" onClick={goToHome} style={{ cursor: 'pointer' }}>
          <img src={require('./logo-png.png')} alt="TicketFlix Logo" className="logo-img" />
        </div>

        <div className="navbar-left">
          <NavLink className="user-nav" to="/MoviePage">Movies</NavLink>
        </div>
        <div className="navbar-left">
          <NavLink className="user-nav" to="/event">Events</NavLink>
        </div>

        {/* SEARCH BAR */}
        <div className="navbar-center">
          <div className="search-bar-container">
            <div className="search-logo" onClick={handleSearch}>
              <img src={require('./search.png')} alt="Search" className="search-icon" />
            </div>
            <input
              type="text"
              placeholder="Search for movies or events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="search-bar"
            />
            <ul className="search-suggestions">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="suggestion-item"
                >
                  {item.movieName || item.eventName || '❌ No Name Found'}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="navbar-right">
          {isLoggedIn && (
            <div className="user-info">
              <span>Welcome, {username.split(' ')[0]}</span>
            </div>
          )}

          <div className="hamburger-wrapper">
            <div className={`hamburger-menu ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>

            <div className={`hamburger-dropdown ${isOpen ? 'open' : ''}`}>
              <ul>
                {/* MOBILE ONLY: Movies & Events */}
                <li className="mobile-navlink">
                  <NavLink className="user-nav" to="/MoviePage" onClick={closeMenu}>
                    Movies
                  </NavLink>
                </li>
                <li className="mobile-navlink">
                  <NavLink className="user-nav" to="/event" onClick={closeMenu}>
                    Events
                  </NavLink>
                </li>
                {/* rest of your menu */}
                <li>
                  <NavLink className="user-nav" to="/Aboutus" onClick={closeMenu}>
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="user-nav"
                    to="/mybooking"
                    onClick={e => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        setShowPopup(true);
                      } else closeMenu();
                    }}
                  >
                    My Bookings
                  </NavLink>
                </li>
                <li>
                  <NavLink className="user-nav" to="/support" onClick={closeMenu}>
                    Help & Support
                  </NavLink>
                </li>
                <li>
                  <NavLink className="user-nav" to="/faq" onClick={closeMenu}>
                    FAQ
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="trylog-button"
                    onClick={isLoggedIn ? handleLogout : () => navigate('/trylogin')}
                  >
                    <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay-Booking">
          <div className="popup-Booking">
            <p className="popup-message-Booking">Please log in to view your bookings.</p>
            <div className="popup-buttons-Booking">
              <button
                className="popup-button-Booking"
                onClick={() => {
                  setShowPopup(false);
                  navigate('/trylogin');
                }}
              >
                <span className="button_top">Login</span>
              </button>
              <button
                className="popup-cancel-button-Booking"
                onClick={() => setShowPopup(false)}
              >
                <span className="button_top">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Usernavbar;
