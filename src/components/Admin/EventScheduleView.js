import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "../Admin/Eventview.css";  // reuse your existing table styles
import { Link } from "react-router-dom";

const EventScheduleView = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      // Clear any previous schedule-related localStorage keys
      ["scheduleId", "scheduleEventName", "scheduleVenues", "scheduleShowTime"]
        .forEach(k => localStorage.removeItem(k));

      // Fetch schedules
      const response = await axios.get("https://ticketflix-backend.onrender.com/eventschedule");
      setData(response.data);
      console.log("Fetched schedules:", response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Store schedule data for editing
  const setID = (id, eventName, eventVenue, EventshowTime) => {
    localStorage.setItem("scheduleId", id);
    localStorage.setItem("scheduleEventName", eventName);
    localStorage.setItem("scheduleVenues", JSON.stringify(eventVenue));
    localStorage.setItem("scheduleShowTime", JSON.stringify(EventshowTime));
  };

  // Delete a schedule then refresh
  const deleted = async (id) => {
    try {
      await axios.delete(`https://ticketflix-backend.onrender.com/eventschedule/delete/${id}`);
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
    fetchData();
  };

  return (
    <div className="eventview">
      <Navbar />
      <div className="table-container">
        <table className="table1">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Venue(s)</th>
              <th>ShowTime Price Blocks</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item._id}>
                <td>{item.eventName}</td>
                <td>
                  {Array.isArray(item.eventVenue)
                    ? item.eventVenue.join(", ")
                    : item.eventVenue}
                </td>
                <td style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
                  {JSON.stringify(item.EventshowTime, null, 2)}
                </td>
                <td>
                  <Link to="/editschedule">
                    <button
                      className="update"
                      onClick={() =>
                        setID(
                          item._id,
                          item.eventName,
                          item.eventVenue,
                          item.EventshowTime
                        )
                      }
                    >
                      Update
                    </button>
                  </Link>
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={() => deleted(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="Add_button_container">
        <Link to="/addeventschedule" style={{ textDecoration: "none" }}>
          <button className="Addbutton">Add Schedule</button>
        </Link>
      </div>
    </div>
  );
};

export default EventScheduleView;
