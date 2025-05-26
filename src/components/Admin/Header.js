import React, { useEffect, useState } from "react";
import { Link, useNavigate,Outlet } from "react-router-dom";
//import { Logout } from "../Logout";
const Header = () => {
  const [isUserLogin, setIsUserLogin] = useState(false);
  const navigate = useNavigate();
  console.log("users");
  
  const handleLogout = () => {
      // Clear local storage
      //console.log("hi")
      localStorage.clear();
      setIsUserLogin(true);
      // Optionally, navigate to the login page or home page
      navigate('/logout',{replace:true}); // Change this route based on your app's routing
    };
useEffect(() => {
  if(localStorage.getItem("user")!==null)
    {
      setIsUserLogin(true);
    }
}, []);
  return (
   
    <div class="container">
    <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
      <a href="/" class="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"></svg>
      </a>

      <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        <li><a href="/" class="nav-link px-2 link-secondary">Dashboard</a></li>
        <li><a href="#" class="nav-link px-2 link-dark">Movies</a></li>
        <li><a href="#" class="nav-link px-2 link-dark">show Timing</a></li>
        <li><a href="#" class="nav-link px-2 link-dark">Screen</a></li>
        
      </ul>

      {/* <div class="col-md-4 text-end"> */}
      {/* {isUserLogin && (
     <Link to={`/logout`}><button type="button" class="btn btn-outline-primary me-2">Logout</button></Link>
      )} */}
      {/* {!isUserLogin && (
      <Link to={`/login`}><button type="button" class="btn btn-outline-primary me-2">Login</button></Link>
     
      )}
        <Link to={`/admin`}><button type="button" class="btn btn-outline-primary me-2">Admin Login</button></Link>
        {!isUserLogin && (
        <Link to={`/signup`}><button type="button" class="btn btn-primary">Sign-up</button></Link>
      )}
      </div> */}
    </header>
    
  </div>
  );
};

export default Header;