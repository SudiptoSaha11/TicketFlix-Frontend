import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Usernavbar from "./Usernavbar";   
import "./Event.css"
import BottomNav from "./BottomNav";
import "@fortawesome/fontawesome-free/css/all.min.css";
import api from "../../../Utils/api";

const Event = ({ searchTerm, setSearchTerm }) => {
  const [data, setData] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("https://ticketflix-backend.onrender.com/event");
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
      <div className="pt-[90px] px-[10px] flex flex-col items-center mb-[100px] 
      2xl:pt-[90px] 2xl:px-[20px] 2xl:flex 2xl:flex-col 2xl:items-center 2xl:mb-[30px]">
        <div className="font-sans text-[#444441] mb-[10px]
        2xl:font-sans 2xl:text-[#444441] 2xl:mb-[20px]">
          <h2>Events</h2>
        </div>

        {/* Language Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6
        2xl:flex 2xl:flex-wrap 2xl:justify-center 2xl:gap-2 2xl:mb-6">
          <button className={`px-3 py-2 rounded-full    2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.length === 0 ? "bg-orange-600 text-white" : 'bg-gray-200 text-gray-700'}`} onClick={() => toggleLanguage("All")}>All</button>
          {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map(lang => (
            <button
              key={lang}
              className={`px-3 py-2 rounded-full     2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.includes(lang) ? "bg-orange-600 text-white" : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[35px] 2xl:gap-[70px]">
          {filteredEvents.map((item) => (
            <Link
              key={item._id}
              to={`/eventdetails/${item._id}`}
              className="text-current no-underline"
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
              <div className="w-[150px] h-[280px] rounded-[8px] mb-[-30px] overflow-hidden cursor-pointer text-center flex flex-col justify-start transition-transform transition-shadow duration-300 ease hover:-translate-y-[5px] 
              2xl:w-[220px] 2xl:h-[425px]">
                <img
                  src={item.image}
                  alt={item.eventName}
                  className="w-full h-[200px] object-cover
                             2xl:w-full 2xl:h-[320px]"
                />
                <h3 className="mt-[5px] mb-[10px] text-[1rem] font-bold text-left hover:text-black-900 ">{item.eventName}</h3>
                
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Event;