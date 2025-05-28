import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Eventdetails.css"; // Ensure the path is correct
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
      console.log("Fetching event details for ID:", eventID);

      // Fetch event details
      const eventResponse = await axios.get(`https://ticketflix-backend.onrender.com/getevent/${eventID}`);
      console.log("Fetched Event Data:", eventResponse.data);

      const {
        eventName: Name,
        eventLanguage,
        eventDuration,
        eventArtist,
        eventVenue: Venue,
        imageURL,
        eventAbout,
        eventDate,
        eventTime: Time, // Already an array
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
      seteventTime(Array.isArray(Time) ? Time : []); // Ensure it's an array
      seteventType(eventType);
      setlocation(location)

      // Fetch event schedule
      console.log("Fetching event schedule...");
      const scheduleResponse = await axios.get(`https://ticketflix-backend.onrender.com/eventschedule`);
      console.log("Fetched Schedule Data:", scheduleResponse.data);

      // Find matching schedule by event name
      const matchedSchedule = scheduleResponse.data.find(schedule => schedule.eventName === Name);

      if (matchedSchedule) {
        console.log("Matched Schedule:", matchedSchedule);
        setEventSchedule(matchedSchedule);

        // Extract ticket prices from the first available showtime
        const pricingData = matchedSchedule.EventshowTime?.[0] || {};
        setEventPricing(pricingData);
      } else {
        console.log("No matching schedule found for", Name);
      }

    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // On mount, get event ID from localStorage then fetch details.
  useEffect(() => {
    const eventID = localStorage.getItem("id");
    console.log("Event ID from localStorage:", eventID);

    if (!eventID) {
      navigate("/");
      return;
    }

    setId(eventID);
    fetchData(eventID);
  }, [navigate]);

  // Log eventName to check if it updates
  useEffect(() => {
    console.log("Updated eventName:", Name);
  }, [Name]);

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
        Time, // Now an array
        pricing: eventPricing || {}, // Pass extracted prices
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
    <div className="main-event">
      <div className="event-container">
        {/* Banner */}
        <div className="event-banner">
          <img src={eventImage} alt={Name} />
        </div>

        {/* Event Details */}
        <div className="event-details">
          <h2>{Name}</h2>
          <p className="subtext">
            {eventType} | {eventLanguage} | {eventDuration}
          </p>
          <p className="date">🗓 {new Date(eventDate).toDateString()}</p>
          <p className="venue">📍 {Venue}</p>
          {/* Show lowest ticket price if schedule exists */}
          {eventSchedule?.EventshowTime?.[0]?.BronzeTicketPrice ? (
            <p className="price">|| ₹{eventSchedule.EventshowTime[0].BronzeTicketPrice} onwards</p>
          ) : (
            <p className="price">🎟 Lowest Price: ₹N/A</p>
          )}
          <button onClick={handleClick} className="book-btn">Book</button>
        </div>

        {/* Artist Section */}
        <div className="artist-section">
          {eventArtist.map((artist, index) => (
            <div className="artist-card" key={index}>
              <img src={artist.image} alt={artist.name} />
              <p><strong>{artist.artist}</strong></p>
              <p>{artist.name}</p>
              <div className="about-section">
                <h2>About</h2>
                <p>{eventAbout}</p>
              </div>
            </div>
          ))}
          {location?.coordinates && (
          <div className="map-container" >
            <iframe
              title="Event location"
              // // width="100%"
              // // height="300"
              style={{ border: 0, borderRadius: "10px", marginTop: "1rem" }}
               loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${location.coordinates[0]}, ${location.coordinates[1]}&z=15&output=embed`}
            />
            {location.address && (
              <p>{location.address}</p>
            )}
          </div>
        )}
        </div>




        {/* Share Event Section */}
        <div className="main-share-event">
          <div className="share-event">
            <h6>Share This Event</h6>
            <a href="https://www.facebook.com">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="https://www.twitter.com">
              <i className="fab fa-twitter" />
            </a>
          </div>
        </div>
      </div>

      {/* Time Popup */}
      {eventtimePopup && (
        <div className="popup-Time-booking">
          <div className="popup-Time-booking-content">
            <span className="popup-Time-close" onClick={closeTimePopup}>
              &times;
            </span>
            <h2>Select Event Time</h2>
            <div style={{ marginTop: "1rem" }}>
              {Time.length > 0 ? (
                Time.map((time, index) => (
                  <button
                    key={index}
                    className="popup-Time-button"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p>No available times</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Eventdetails;
