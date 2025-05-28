import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import '../Admin/Screen.css'; 

const Screen = () => {
  const [data, Setdata] = useState([]);

  const fetchData = async () => {
    try {
      localStorage.setItem("id", "");
      localStorage.setItem("Screen Number", "");
      localStorage.setItem("Movie Name", "");
      localStorage.setItem("Gold Seat", "");
      localStorage.setItem("Silver Seat", "");
      localStorage.setItem("Platinum Seat", "");
      const response = await axios("https://ticketflix-backend.onrender.com/screen");
      Setdata(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function setid(
    id,
    ScreenNumber,
    MovieName,
    GoldSeat,
    SilverSeat,
    PlatinumSeat
  ) {
    console.log("screen" + id);
    localStorage.setItem("id", id);
    localStorage.setItem("ScreenNumber", ScreenNumber);
    localStorage.setItem("MovieName", MovieName);
    localStorage.setItem("GoldSeat", GoldSeat);
    localStorage.setItem("SilverSeat", SilverSeat);
    localStorage.setItem("PlatinumSeat", PlatinumSeat);
  }

  async function deleted(id) {
    try {
      const response = await axios.delete(`https://ticketflix-backend.onrender.com/screen/delete/${id}`);
      console.log(response);
    } catch (err) {
      console.log("error");
      console.log("Data", err.response.data.message);
      console.log("Status", err.response.status);
    }
    fetchData();
  }

  return (
    <div className="screen-page">
      <Navbar /> <br />
      <div className="table-container_2">
        <table striped bordered hover size="sm" className="table_3">
          <thead>
            <tr>
              <th>Screen Number</th>
              <th>Movie Name</th>
              <th>Gold Seat</th>
              <th>Silver Seat</th>
              <th>Platinum Seat</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.ScreenNumber}</td>
                <td>{item.MovieName}</td>
                <td>{item.GoldSeat}</td>
                <td>{item.SilverSeat}</td>
                <td>{item.PlatinumSeat}</td>
                <td>
                  <Link to="/editscreen">
                    <button className="update"
                      onClick={() =>
                        setid(
                          item._id,
                          item.ScreenNumber,
                          item.MovieName,
                          item.GoldSeat,
                          item.SilverSeat,
                          item.PlatinumSeat
                        )
                      }
                      variant="info"
                    >
                      Update
                    </button>
                  </Link>
                </td>
                <td>
                  <button className="delete"
                  onClick={() => deleted(item._id)} variant="danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br></br>
        <div className="add-button-screen-container">
          <Link to="/addscreen">
            <button className="Addbutton">
              Add Show
            </button>
          </Link>
          </div>
      </div>
    </div>
  );
};

export default Screen;
