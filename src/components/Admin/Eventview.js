import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "../Admin/Eventview.css";
import { Link } from "react-router-dom";

const Eventview = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      // Clear any previous event-related localStorage keys
      const keys = [
        "id","eventname","eventlanguage","eventduration",
        "eventartist","eventvenue","eventabout","eventdate",
        "eventtime","eventtype","image","location"
      ];
      keys.forEach(k => localStorage.removeItem(k));

      // Fetch events from the backend
      const response = await axios.get("https://ticketflix-backend.onrender.com/event");
      setData(response.data);
      console.log("Fetched events:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When an event is selected for editing, store its data in localStorage
  function setID(
    _id,
    eventName,
    eventLanguage,
    eventDuration,
    eventArtist,
    eventVenue,
    eventAbout,
    eventDate,
    eventTime,
    eventType,
    image,
    location
  ) {
    console.log("Selected event ID:", _id);
    localStorage.setItem("id", _id);
    localStorage.setItem("eventname", eventName);
    localStorage.setItem("eventlanguage", eventLanguage);
    localStorage.setItem("eventduration", eventDuration);
    localStorage.setItem("eventartist", JSON.stringify(eventArtist));
    localStorage.setItem("eventvenue", eventVenue);
    localStorage.setItem("eventabout", eventAbout);
    // store ISO date
    localStorage.setItem("eventdate", eventDate);
    // store array of times
    localStorage.setItem("eventtime", JSON.stringify(eventTime));
    localStorage.setItem("eventtype", eventType);
    localStorage.setItem("image", image);
    // store full location object
    localStorage.setItem("location", JSON.stringify(location));
  }

  async function deleted(id) {
    try {
      await axios.delete(`https://ticketflix-backend.onrender.com/event/delete/${id}`);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
    fetchData();
  }

  return (
    <div className="eventview">
      <Navbar />
      <div className="eventview-table-container">
        <table className="eventview-table1">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Name</th>
              <th>Language</th>
              <th>Duration</th>
              <th>Artists</th>
              <th>Venue</th>
              <th>About</th>
              <th>Date</th>
              <th>Time(s)</th>
              <th>Type</th>
              <th>Location</th>
              <th>Coords</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const dateStr = new Date(item.eventDate).toLocaleDateString();
              const times = Array.isArray(item.eventTime)
                ? item.eventTime.join(", ")
                : item.eventTime;
              const loc = item.location || {};
              const coords = Array.isArray(loc.coordinates)
                ? loc.coordinates.join(", ")
                : "";

              return (
                <tr key={item._id}>
                  <td>
                    <img
                      className="eventview-poster"
                      src={item.image}
                      alt={item.eventName}
                    />
                  </td>
                  <td>{item.eventName}</td>
                  <td>{item.eventLanguage}</td>
                  <td>{item.eventDuration}</td>
                  <td>
                    {item.eventArtist?.map((artist, i) => (
                      <div key={i} className="eventview-cast-container-admin">
                        <img
                          className="eventview-cast-image-admin"
                          src={artist.image}
                          alt={artist.name}
                        />
                        <div>{artist.name}</div>
                      </div>
                    ))}
                  </td>
                  <td>{item.eventVenue}</td>
                  <td>{item.eventAbout}</td>
                  <td>{dateStr}</td>
                  <td>{times}</td>
                  <td>{item.eventType}</td>
                  <td>{loc.address}</td>
                  <td>{coords}</td>
                  <td>
                    <Link to="/editevent">
                      <button
                        className="eventview-update"
                        onClick={() =>
                          setID(
                            item._id,
                            item.eventName,
                            item.eventLanguage,
                            item.eventDuration,
                            item.eventArtist,
                            item.eventVenue,
                            item.eventAbout,
                            item.eventDate,
                            item.eventTime,
                            item.eventType,
                            item.image,
                            item.location
                          )
                        }
                      >
                        Update
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="eventview-delete"
                      onClick={() => deleted(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="eventview-Add-button-container">
        <Link to="/addevent" style={{ textDecoration: "none" }}>
          <button className="eventview-Addbutton">Add Event</button>
        </Link>
      </div>
    </div>
  );
};

export default Eventview;
