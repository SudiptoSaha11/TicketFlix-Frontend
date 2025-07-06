import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';

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

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);
  const goToHome = () => navigate('/');

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

      const combinedResults = [...movieResults, ...eventResults];
      setSuggestions(combinedResults);
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((query) => {
      fetchSuggestions(query);
    }, 300),
    [isMoviePage]
  );

  useEffect(() => {
    debouncedFetchSuggestions(searchTerm);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm('');
    setSuggestions([]);

    const detailPath = suggestion.type === 'movie' ? 'moviedetails' : 'eventdetails';
    navigate(`/${detailPath}/${suggestion._id}`, { state: suggestion });
  };

  const handleSearch = async () => {
    try {
      if (searchTerm.trim() === '') return;

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
      <div className="fixed top-0 w-full h-[65px] lg:h-[80px] bg-[#fff] px-[2px] py-3 z-[1000] flex justify-between items-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-colors duration-300 ease md:gap-[10px]">
        <div
  className="flex items-center cursor-pointer
             sm:left-0
             md:ml-[8rem]
             lg:ml-[10rem]
             xl:ml-[12.2rem]
             2xl:ml-[12.4rem]
             antarikh:ml-[14.2rem]
             debojit:ml-[17rem]"
  onClick={goToHome}
>
  <div className="h-[70px] w-[70px] pb-2 flex items-center justify-center">
  <img
    src={require('./logo-png.png')}
    alt="Your Logo"
    className="h-full w-auto object-contain"
  />
</div>
</div>


        <div className="flex items-center gap-[2px] hidden
                         xl:block  xl:justify-around xl:pl-[20px]">
          <NavLink
            to="/MoviePage"
            className="text-[1.1rem] font-medium text-[#333333] no-underline transition-colors duration-300 ease hover:text-[#f39c12]"
          >
            Movies
          </NavLink>
        </div>

        <div className="flex items-center  ml-[3rem] hidden
                         xl:block xl:mr-[1.7rem]">
          <NavLink
            to="/event"
            className="text-[1.1rem] font-medium text-[#333333] no-underline transition-colors duration-300 ease hover:text-[#f39c12]"
          >
            Events
          </NavLink>
        </div>
      <div className='w-full flex justify-end lg:hidden'>
        {/* SEARCH BAR */}
        <img
          src={require('./search.png')}
          onClick={() => { navigate("/search") }}
          alt="Search"
          className="w-[23px] h-[23px] mb-[10px] ml-auto mr-4
                           sm:w-[20px] sm:h-[20px] sm:mr-[15px] sm:ml-[35rem] sm:mb-[10px]
                           md:w-[25px] md:h-[25px] md:mr-[18px] md:ml-[230px] md:mb-[10px] md:hidden
                           debojit:w-[30px] debojit:h-[30px] debojit:mr-[20px]"
        />
      </div>
        <div className="flex-1 flex justify-center max-lg:hidden">

          <div className="relative flex items-center w-full max-w-[250px] bg-white border border-[#cccccc] rounded-none px-[15px] py-[5px] shadow-[0_2px_5px_rgba(0,0,0,0.1)]
                          sm:max-w-[400px] 
                          md:max-w-[600px]
                          debojit:max-w-[800px]">
            <div className="flex items-center justify-center pb-[8px] cursor-pointer" onClick={handleSearch}>
              <img
                src={require('./search.png')}
                alt="Search"
                className="w-[15px] h-[15px] mr-[10px]
                           sm:w-[20px] sm:h-[20px] sm:mr-[15px]
                           md:w-[25px] md:h-[25px] md:mr-[18px]
                           debojit:w-[30px] debojit:h-[30px] debojit:mr-[20px]"
              />
            </div>

            <input
              type="text"
              placeholder="Search for movies or events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-[12px] focus:outline-none border-none p-[8px] placeholder:text-[#aaaaaa]
                         sm:text-[20px]"
            />
            {/* SUGGESTIONS */}
            <ul className="absolute top-full left-0 right-0 bg-white border border-[#cccccc] border-t-0 z-[9999] list-none m-0 p-0 block">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSuggestion(item)}
                  className="block px-[10px] py-[10px] cursor-pointer hover:bg-[#f0f0f0]"
                >
                  {item.movieName || item.eventName || '❌ No Name Found'}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-[1rem] relative">
          {isLoggedIn && (
            <div className="mr-[20px] font-bold hidden 
                            sm:hidden
                            xl:block ">
              <span>Welcome, {username.split(' ')[0]}</span>
            </div>
          )}

          <div className="relative inline-block pr-[10px]
                          sm:right-0
                          md:mr-[7rem] pl-[8px]
                          lg:mr-[10rem]
                          xl:mr-[12.2rem]
                          2xl:mr-[12.4rem]
                          antarikh:mr-[14.2rem]
                          debojit:mr-[18.8rem]">
            <div
              className="flex flex-col cursor-pointer "
              onClick={toggleMenu}
            >
              <div
                className={`block w-[30px] h-[2px] my-[3px] bg-[#333333] transition-all duration-300 origin-center ${isOpen ? 'translate-y-[8px] rotate-45' : ''
                  }`}
              />
              <div
                className={`block w-[30px] h-[2px] my-[3px] bg-[#333333] transition-all duration-300 origin-center ${isOpen ? 'opacity-0' : ''
                  }`}
              />
              <div
                className={`block w-[30px] h-[2px] my-[3px] bg-[#333333] transition-all duration-300 origin-center ${isOpen ? '-translate-y-[8px] -rotate-45' : ''
                  }`}
              />
            </div>

            <div
              className={`
                absolute top-[220%] right-0 w-[250px] bg-white
                shadow-[0_4px_12px_rgba(0,0,0,0.2)] py-[15px] flex flex-col items-start
                rounded-[8px] transition-opacity duration-300 ease-in-out transform
                ${isOpen ? 'translate-y-0 opacity-100 flex' : '-translate-y-[10px] opacity-0 hidden'}
                md:w-[300px] md:py-[10px]
              `}
            >
              <ul className="flex flex-col items-center w-full m-0 p-0 list-none">

                <li className="w-full px-[20px] py-[12px] xl:hidden">
                  <NavLink
                    to="/MoviePage"
                    className="text-[1.1rem] font-medium text-[#333333] no-underline transition-colors duration-300 ease hover:text-[#f39c12]
                                "
                  >
                    Movies
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px] xl:hidden">
                  <NavLink
                    to="/event"
                    className="text-[1.1rem] font-medium text-[#333333] no-underline transition-colors duration-300 ease hover:text-[#f39c12]
                                "
                  >
                    Events
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px]">
                  <NavLink
                    to="/Aboutus"
                    onClick={closeMenu}
                    className="no-underline block w-full text-[1rem] font-medium text-[#333333] rounded-[4px] transition-colors duration-300 ease hover:bg-[#f7f7f7] hover:text-[#f39c12]"
                  >
                    About Us
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px]">
                  <NavLink
                    to="/mybooking"
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        setShowPopup(true);
                      } else {
                        closeMenu();
                      }
                    }}
                    className="no-underline block w-full text-[1rem] font-medium text-[#333333] rounded-[4px] transition-colors duration-300 ease hover:bg-[#f7f7f7] hover:text-[#f39c12]"
                  >
                    My Bookings
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px]">
                  <NavLink
                    to="/support"
                    onClick={closeMenu}
                    className="no-underline block w-full text-[1rem] font-medium text-[#333333] rounded-[4px] transition-colors duration-300 ease hover:bg-[#f7f7f7] hover:text-[#f39c12]"
                  >
                    Help & Support
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px]">
                  <NavLink
                    to="/faq"
                    onClick={closeMenu}
                    className="no-underline block w-full text-[1rem] font-medium text-[#333333] rounded-[4px] transition-colors duration-300 ease hover:bg-[#f7f7f7] hover:text-[#f39c12]"
                  >
                    FAQ
                  </NavLink>
                </li>
                <li className="w-full px-[20px] py-[12px]">
                  <button
                    type="button"
                    onClick={isLoggedIn ? handleLogout : () => navigate('/trylogin')}
                    className="
                      w-full
                      bg-[#e8e8e8]
                      text-[1rem]
                      font-medium
                      text-[#333333]
                      rounded-[4px]
                      py-[8px]
                      transition-colors duration-300 ease
                      hover:bg-[#f0f0f0]
                    "
                  >
                    {isLoggedIn ? 'Logout' : 'Login'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-[1000]">
          <div className="bg-white p-[30px] rounded-[8px] text-center w-[400px] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <p className="text-[16px] mb-[20px]">Please log in to view your bookings.</p>
            <div className="flex justify-around">
              <button
                className="block box-border border-2 border-[#000000] rounded-[0.75em] px-[1.5em] py-[0.75em] bg-[#e8e8e8] text-[#000000] transform -translate-y-[0.2em] transition-transform duration-100 ease-in hover:-translate-y-[0.33em] active:translate-y-0"
                onClick={() => {
                  setShowPopup(false);
                  navigate('/trylogin');
                }}
              >
                <span className="text-[17px] font-bold">Login</span>
              </button>
              <button
                className="block box-border border-2 border-[#000000] rounded-[0.75em] px-[1.5em] py-[0.75em] bg-[#e8e8e8] text-[#000000] transform -translate-y-[0.2em] transition-transform duration-100 ease-in hover:-translate-y-[0.33em] active:translate-y-0"
                onClick={() => setShowPopup(false)}
              >
                <span className="text-[17px] font-bold">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Usernavbar;