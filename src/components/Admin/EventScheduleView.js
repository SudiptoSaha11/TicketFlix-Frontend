import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./EventScheduleView.css";  // reuse your existing table styles
import { Link } from "react-router-dom";

const EventScheduleView = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      ["scheduleId", "scheduleEventName", "scheduleVenues", "scheduleShowTime"]
        .forEach(k => localStorage.removeItem(k));

      const response = await axios.get("http://localhost:5000/eventschedule");
      setData(response.data);
      console.log("Fetched schedules:", response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setID = (id, eventName, eventVenue, EventshowTime) => {
    localStorage.setItem("scheduleId", id);
    localStorage.setItem("scheduleEventName", eventName);
    localStorage.setItem("scheduleVenues", JSON.stringify(eventVenue));
    localStorage.setItem("scheduleShowTime", JSON.stringify(EventshowTime));
  };

  const deleted = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/eventschedule/delete/${id}`);
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
    fetchData();
  };

  return (
    <div className="eventscheduleview">
      <Navbar />
      <div className="eventscheduleview-table-container">
        <table className="eventscheduleview-table_1">
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
                  {item.EventshowTime?.map((showtime, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      {Object.entries(showtime)
                        .filter(([key]) => key !== "_id")
                        .map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {value}
                          </div>
                      ))}
                    </div>
                  ))}
                </td>
                <td>
                  <Link to="/editschedule">
                    <button
                      className="eventscheduleview-update"
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
                    className="eventscheduleview-delete"
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

      <div className="eventscheduleview-Add-button-container">
        <Link to="/addeventschedule" style={{ textDecoration: "none" }}>
          <button className="eventscheduleview-Addbutton">Add Schedule</button>
        </Link>
      </div>
    </div>
  );
};

export default EventScheduleView;
