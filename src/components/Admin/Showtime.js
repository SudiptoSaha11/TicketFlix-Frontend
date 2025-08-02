import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import "./Showtime.css";

const Showtime = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      // Clear localStorage for old fields
      localStorage.setItem("id", "");
      localStorage.setItem("MovieName", "");
      localStorage.setItem("hallName", "");
      localStorage.setItem("showTime", "");
      localStorage.setItem("GoldTicketPrice", "");
      localStorage.setItem("SilverTicketPrice", "");
      localStorage.setItem("PlatinumTicketPrice", "");

      // Fetch schedules from the backend
      const response = await axios.get("https://ticketflix-backend.onrender.com/Scheduleschema");
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to save selected schedule info for editing.
  // Ticket prices are now stored inside the showTime objects.
  function setid(id, MovieName, hallName, showTime) {
    console.log("Selected schedule id: " + id);
    localStorage.setItem("id", id);
    localStorage.setItem("MovieName", MovieName);
    localStorage.setItem("hallName", JSON.stringify(hallName));
    localStorage.setItem("showTime", JSON.stringify(showTime));
    // If showTime exists, use the first hall's prices (assuming uniformity)
    if (Array.isArray(showTime) && showTime.length > 0) {
      localStorage.setItem("GoldTicketPrice", showTime[0].GoldTicketPrice);
      localStorage.setItem("SilverTicketPrice", showTime[0].SilverTicketPrice);
      localStorage.setItem("PlatinumTicketPrice", showTime[0].PlatinumTicketPrice);
    }
  }

  // Delete a schedule by ID
  async function deleted(id) {
    try {
      const response = await axios.delete(`https://ticketflix-backend.onrender.com/Scheduleschema/delete/${id}`);
      console.log(response);
      fetchData();
    } catch (err) {
      console.log("Error deleting schedule:", err);
    }
  }

  // Helper function to format a 24-hour time string (HH:mm) to 12-hour format with AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="showtimepage">
      <Navbar />
      <br />
      <div className="table-container_1">
        <table className="table_2">
          <thead>
            <tr>
              <th>Movie Name</th>
              <th>Hall Name</th>
              <th>Show Times</th>
              <th>Gold Ticket Price</th>
              <th>Silver Ticket Price</th>
              <th>Platinum Ticket Price</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.MovieName}</td>
                <td>
                  {/* List each hall name in its own div */}
                  {item.hallName &&
                    item.hallName.map((hall, index) => (
                      <div key={index}>{hall}</div>
                    ))}
                </td>
                <td>
                  {/* For each hall's showTime, display its times */}
                  {item.showTime &&
                    item.showTime.map((hallShow, index) => (
                      <div key={index}>
                        {item.hallName && item.hallName[index] ? (
                          <strong>{item.hallName[index]}: </strong>
                        ) : (
                          <strong>Hall {index + 1}: </strong>
                        )}
                        {hallShow.time && Array.isArray(hallShow.time)
                          ? hallShow.time.map(formatTime).join(", ")
                          : formatTime(hallShow.time)}
                      </div>
                    ))}
                </td>
                <td>
                  {/* Display Gold Ticket Price for each hall */}
                  {item.showTime &&
                    item.showTime.map((hallShow, index) => (
                      <div key={index}>₹{hallShow.GoldTicketPrice}</div>
                    ))}
                </td>
                <td>
                  {/* Display Silver Ticket Price for each hall */}
                  {item.showTime &&
                    item.showTime.map((hallShow, index) => (
                      <div key={index}>₹{hallShow.SilverTicketPrice}</div>
                    ))}
                </td>
                <td>
                  {/* Display Platinum Ticket Price for each hall */}
                  {item.showTime &&
                    item.showTime.map((hallShow, index) => (
                      <div key={index}>₹{hallShow.PlatinumTicketPrice}</div>
                    ))}
                </td>
                <td>
                  <Link to="/editshow">
                    <button
                      className="update"
                      onClick={() =>
                        setid(item._id, item.MovieName, item.hallName, item.showTime)
                      }
                    >
                      Update
                    </button>
                  </Link>
                </td>
                <td>
                  <button className="delete" onClick={() => deleted(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <div className="add-button-screen-container">
          <Link to="/Addshow">
            <button className="Addbutton">Add Show Time</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Showtime;
