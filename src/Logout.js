import React, { useState, useContext, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
export  const Logout=()=>{
    const navigate=useNavigate();
    useEffect(() => {
       
        localStorage.clear();
        localStorage.removeItem("user");
        navigate('/', { replace: true });
      }, [navigate]);

return(

    <div>
Logging out...
    </div>
);
}