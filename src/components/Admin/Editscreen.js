// Filename - Edit.js
import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Editscreen.css';

// Used for navigation with logic in javascript
function Editscreen() {
	// Here usestate has been used in order
	// to set and get values from the jsx
	const [ScreenNumber, SetScreenNumber] = useState('');
    const [MovieName, SetMovieName] = useState('');
    const [GoldSeat, SetGoldSeat] = useState('');
    const [SilverSeat, SetSilverSeat] = useState('');
    const [PlatinumSeat, SetPlatinumSeat] = useState('');
    const [id, setid] = useState('');

    let history = useNavigate();
    const handelSubmit = async(event) => {
        event.preventDefault();

        try{
            const response = await axios.patch(`https://ticketflix-backend.onrender.com/screen/update/${id}`,
            {
                ScreenNumber,
                MovieName,
                GoldSeat,
                SilverSeat,
                PlatinumSeat,
                

            }
        )
        } catch (err){
            console.log("error");
            console.log("Data ", err.response.data.message);
            console.log("Status ", err.response.data.status);
        }
        history ("/showtime");
    };
      // Call fetchData on component mount
  useEffect(() => {
    SetScreenNumber(localStorage.getItem("ScreenNumber"));
    SetMovieName(localStorage.getItem("MovieName"));
    SetGoldSeat(localStorage.getItem("GoldSeat"));
    SetSilverSeat(localStorage.getItem("SilverSeat"));
    SetPlatinumSeat(localStorage.getItem("PlatinumSeat"));
   
    setid(localStorage.getItem("id"));
  }, []);

  return (
    <body className="editscreen-body-screen">
    <div>
    <form style={{ margin: "5rem" }}  onSubmit={handelSubmit}>
    
    <div className="mb-3">
    <label>Enter Screen Number</label>
    <input type="number" className="form-control" id="formGroupExampleInput" placeholder="Enter Screen Number"
    value={ScreenNumber} onChange={(e) =>SetScreenNumber(e.target.value)} required /><br></br></div>
    
    <div className="mb-3">
      <label>Enter Movie Name</label>
      <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Enter Movie Name"
      value={MovieName} onChange={(e) =>SetMovieName(e.target.value)} required /><br></br>
      
    </div>
    <div className="mb-3">
      <label>Enter Gold Seat</label>
      <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Enter Gold Seat"
      value={GoldSeat} onChange={(e) =>SetGoldSeat(e.target.value)} required /><br></br>
      
    </div>
    <div className="mb-3">
      <label>Enter Silver Seat</label>
      <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Enter Silver Seat"
      value={SilverSeat} onChange={(e) =>SetSilverSeat(e.target.value)} required /><br></br>
      
    </div>
    <div className="mb-3">
      <label>Enter Platinum Seat</label>
      <input type="text" className="form-control" id="formGroupExampleInput2" placeholder="Enter Platinum Seat"
      value={PlatinumSeat} onChange={(e) =>SetPlatinumSeat(e.target.value)} required /><br></br></div>
      <Link style={{ textDecoration: 'none' }} to="/screen"><div class="Update_container3"><button className="Updatebutton3"onClick={(e)=>handelSubmit(e)}>Update</button></div></Link>
    <br></br>
    <Link style={{ textDecoration: 'none' }} to = "/screen"><div class="Update_container3"><button className="Homebutton3" type="submit" >Home</button></div>  </Link>
    </form>
    </div>
    </body>
    );
    }

export default Editscreen;