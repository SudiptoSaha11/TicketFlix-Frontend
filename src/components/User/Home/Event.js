import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Usernavbar from "./Usernavbar";   
import "./Event.css"
import "@fortawesome/fontawesome-free/css/all.min.css";

const Event = ({ searchTerm, setSearchTerm }) => {
  const [data, setData] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/event");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const toggleLanguage = (lang) => {
    if (lang === "All") {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([lang]);
    }
  };

  const filteredEvents = data.filter((event) => {
    const lowerSearch = searchTerm?.toLowerCase() || "";

    const eventLangs = event.eventLanguage?.split(/[\/,]/).map(l => l.trim().toLowerCase()) || [];

    const matchesLanguage =
      selectedLanguages.length === 0 ||
      selectedLanguages.some(sel => eventLangs.includes(sel.toLowerCase()));

    const matchesSearch =
      event.eventName?.toLowerCase().includes(lowerSearch) ||
      event.eventVenue?.toLowerCase().includes(lowerSearch) ||
      event.eventType?.toLowerCase().includes(lowerSearch);

    return matchesLanguage && matchesSearch;
  });

  const setID = (_id, eventName, eventLanguage, eventVenue, eventDate, eventTime, eventType) => {
    localStorage.setItem("id", _id);
    localStorage.setItem("eventName", eventName);
    localStorage.setItem("eventLanguage", eventLanguage);
    localStorage.setItem("eventVenue", eventVenue);
    localStorage.setItem("eventDate", eventDate);
    localStorage.setItem("eventTime", eventTime);
    localStorage.setItem("eventType", eventType);
  };

  return (
    <>
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="userevent-container main">
        <div className="main-movie-name">
          <h2>Events</h2>
        </div>

        {/* Language Filter Buttons */}
        <div className="language-buttons">
          <button className={`language-button ${selectedLanguages.length === 0 ? "active" : ""}`} onClick={() => toggleLanguage("All")}>All</button>
          {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map(lang => (
            <button
              key={lang}
              className={`language-button ${selectedLanguages.includes(lang) ? "active" : ""}`}
              onClick={() => toggleLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="movie-cards-container">
          {filteredEvents.map((item) => (
            <Link
              key={item._id}
              to={`/eventdetails/${item._id}`}
              className="movie-card-link"
              onClick={() =>
                setID(
                  item._id,
                  item.eventName,
                  item.eventLanguage,
                  item.eventVenue,
                  item.eventDate,
                  item.eventTime,
                  item.eventType
                )
              }
            >
              <div className="movie-card">
                <img
                  src={item.image}
                  alt={item.eventName}
                  className="movie-poster"
                />
                <h3 className="movie-title">{item.eventName}</h3>
                <p className="movie-language">{item.eventVenue}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Event;
