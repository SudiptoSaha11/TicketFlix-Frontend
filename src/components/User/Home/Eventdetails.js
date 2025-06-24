import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";

function Eventdetails() {
  // Event detail states
  const [eventImage, setEventImage] = useState("");
  const [Name, seteventName] = useState("");
  const [eventLanguage, seteventLanguage] = useState("");
  const [eventDuration, seteventDuration] = useState("");
  const [eventArtist, seteventArtist] = useState([]);
  const [Venue, seteventVenue] = useState("");
  const [eventAbout, seteventAbout] = useState("");
  const [eventDate, seteventDate] = useState("");
  const [Time, seteventTime] = useState([]); // Now an array
  const [eventType, seteventType] = useState("");
  const [eventSchedule, setEventSchedule] = useState(null);
  const [eventPricing, setEventPricing] = useState(null);
  const [location, setlocation] = useState(null);

  // Popups
  const [eventtimePopup, seteventtimePopup] = useState(false);

  const [id, setId] = useState("");
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Fetch event details by ID from the server.
   */
  const fetchData = async (eventID) => {
    try {
      // Fetch event details
      const eventResponse = await axios.get(
        `https://ticketflix-backend.onrender.com/getevent/${eventID}`
      );

      const {
        eventName: Name,
        eventLanguage,
        eventDuration,
        eventArtist,
        eventVenue: Venue,
        imageURL,
        eventAbout,
        eventDate,
        eventTime: Time,
        eventType,
        location,
      } = eventResponse.data;

      setEventImage(imageURL);
      seteventName(Name);
      seteventLanguage(eventLanguage);
      seteventDuration(eventDuration);
      seteventArtist(eventArtist || []);
      seteventVenue(Venue);
      seteventAbout(eventAbout);
      seteventDate(eventDate);
      seteventTime(Array.isArray(Time) ? Time : []);
      seteventType(eventType);
      setlocation(location);

      // Fetch event schedule
      const scheduleResponse = await axios.get(
        `https://ticketflix-backend.onrender.com/eventschedule`
      );
      const matchedSchedule = scheduleResponse.data.find(
        (schedule) => schedule.eventName === Name
      );

      if (matchedSchedule) {
        setEventSchedule(matchedSchedule);
        const pricingData = matchedSchedule.EventshowTime?.[0] || {};
        setEventPricing(pricingData);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // On mount, get event ID from localStorage then fetch details.
  useEffect(() => {
    const eventID = localStorage.getItem("id");
    if (!eventID) {
      navigate("/");
      return;
    }
    setId(eventID);
    fetchData(eventID);
  }, [navigate]);

  // Handle Event Time popup
  const handleClick = () => {
    seteventtimePopup(true);
  };

  const handleTimeSelect = (chosenTime) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    navigate("/eventticketbooking", {
      state: {
        Name,
        Venue,
        eventDate,
        Time,
        pricing: eventPricing || {},
        userEmail: storedEmail,
        chosenTime,
      },
    });
    seteventtimePopup(false);
  };

  const closeTimePopup = () => {
    seteventtimePopup(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <div className="container mx-auto px-4 pt-4 flex flex-col gap-4">
        {/* Banner */}
        <div className="w-full h-64 rounded-lg bg-gray-200 overflow-hidden">
          <img
            src={eventImage}
            alt={Name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Details */}
        <div className="relative bg-white p-4 rounded-lg ">
          <h2 className="text-xl sm:text-2xl text-gray-800 font-bold mb-1">
            {Name}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            {eventType} | {eventLanguage} | {eventDuration}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-gray-600">
            <span className="flex items-center">
              🗓 {new Date(eventDate).toDateString()}
            </span>
            <span className="flex items-center">
              📍 {Venue}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            🎟 {eventSchedule?.EventshowTime?.[0]?.BronzeTicketPrice
              ? `₹${eventSchedule.EventshowTime[0].BronzeTicketPrice} onwards`
              : "Lowest Price: N/A"}
          </p>

          {/* Book button for md+ */}
          <button
            onClick={handleClick}
            className="hidden md:block absolute top-4 right-4 bg-red-500 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
          >
            Book
          </button>
        </div>

        {/* THREE-COLUMN GRID: Artist + Share | About | Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LEFT COLUMN: Artist + Share */}
          <div className="flex flex-col gap-4">
            {/* MIDDLE COLUMN: About */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {eventAbout}
              </p>
            </div>

            {/* Artist Panel */}
            <div className="bg-white rounded-lg p-3 flex flex-col items-center">
              {eventArtist.length > 0 ? (
                eventArtist.map((artist, idx) => (
                  <div
                    key={idx}
                    className="w-full flex flex-col items-center mb-4"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <p className="text-sm font-semibold text-gray-700">
                      {artist.artist}
                    </p>
                    <p className="text-xs text-gray-600">{artist.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No artist info</p>
              )}
            </div>


            {/* RIGHT COLUMN: Map */}
            {location?.coordinates && (
              <div className="bg-white rounded-lg  p-3 flex flex-col items-center">
                <div className="w-full h-40 rounded overflow-hidden mb-2">
                  <iframe
                    title="Event location"
                    src={`https://maps.google.com/maps?q=${location.coordinates[0]},${location.coordinates[1]}&z=15&output=embed`}
                    loading="lazy"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                {location.address && (
                  <p className="text-sm text-gray-700 text-center">
                    {location.address}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Share This Event */}
        <div className="bg-white rounded-lg p-3 text-center">
          <h6 className="font-bold text-sm mb-2">Share This Event</h6>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com"
              className="text-gray-700 hover:text-yellow-500 transition"
            >
              <i className="fab fa-facebook-f fa-lg" />
            </a>
            <a
              href="https://www.twitter.com"
              className="text-gray-700 hover:text-yellow-500 transition"
            >
              <i className="fab fa-twitter fa-lg" />
            </a>
          </div>
        </div>
      </div>

      {/* Time Popup */}
      {eventtimePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-500 text-xl"
              onClick={closeTimePopup}
            >
              &times;
            </button>
            <h4 className="text-lg font-bold mb-3">Select Event Time</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {Time.length > 0 ? (
                Time.map((time, i) => (
                  <button
                    key={i}
                    className="border-2 border-blue-500 rounded-full px-3 py-1 text-sm hover:bg-blue-500 hover:text-white transition"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available times</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom Book button on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-inner flex justify-center md:hidden">
        <button
          onClick={handleClick}
          className="bg-red-500 text-white w-full max-w-md py-2 rounded-md text-base font-semibold hover:bg-red-600 transition"
        >
          Book
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Eventdetails;
