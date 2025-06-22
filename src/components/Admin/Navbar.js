import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();

    // Navigate to login page after logout
    navigate('/login');
  };

  useEffect(() => {
    // Redirect to login page if 'usertype' is null
    if (localStorage.getItem("usertype") === null) {
      navigate('/login');
    }
  }, [navigate]);

  const goToUserHome = () => {
    navigate('/'); // Navigate to the user home page
  };

  return (
    <div className="Navbar">
      <nav>
        <h2 className="Logo"> <span> Welcome Admin </span> </h2>
        <ul>
        <li> 
            <NavLink className="nav" exact to="/dashboard"> Dashboard </NavLink> 
          </li>
          <li> 
            <NavLink className="nav" exact to="/booking"> Bookings </NavLink> 
          </li>
          <li> 
            <NavLink className="nav" to="/movieview"> Movies </NavLink> 
          </li>
          <li> 
            <NavLink className="nav" to="/showtime"> Show Timing </NavLink> 
          </li>
          <li> 
            <NavLink className="nav" to="/eventview"> Event </NavLink> 
          </li>
          <li> 
            <NavLink className="nav" to="/eventscheduleview"> Event Schedule</NavLink> 
          </li>
          <li> 
            <NavLink className="nav" to="/beverages"> Beverages</NavLink> 
          </li>
        </ul>
        
        {/* Button to navigate to User Home */}
        <button type="button" className="Navbutton UserHomeButton" onClick={goToUserHome}>
          User Home
        </button>

        {/* Logout button */}
        <button type="button" className="Navbutton" onClick={handleLogout}> Log Out </button>
      </nav>
    </div>
  );
};

export default Navbar;
