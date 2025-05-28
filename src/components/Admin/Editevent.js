import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../Admin/Editmovie.css';

function Editevent() {
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState('');
  const [eventLanguage, setEventLanguage] = useState('');
  const [eventDuration, setEventDuration] = useState('');
  const [eventArtist, setEventArtist] = useState(''); // JSON string
  const [eventVenue, setEventVenue] = useState('');
  const [eventAbout, setEventAbout] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');     // JSON string or simple text
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState({
    coordinates: ["", ""], // [lon, lat]
    address: ""
  });
  const [id, setId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Pull everything out of localStorage
    setId(localStorage.getItem("id") || '');
    setEventName(localStorage.getItem("eventname") || '');
    setImage(localStorage.getItem("image") || '');
    setEventLanguage(localStorage.getItem("eventlanguage") || '');
    setEventDuration(localStorage.getItem("eventduration") || '');

    // eventArtist (JSON)
    const storedArtists = localStorage.getItem("eventartist") || "[]";
    setEventArtist(storedArtists);

    setEventVenue(localStorage.getItem("eventvenue") || '');
    setEventAbout(localStorage.getItem("eventabout") || '');
    setEventDate(localStorage.getItem("eventdate") || '');

    // eventTime: might be JSON or plain
    const storedTime = localStorage.getItem("eventtime") || "";
    setEventTime(storedTime);

    setEventType(localStorage.getItem("eventtype") || '');

    // location (JSON)
    const storedLoc = localStorage.getItem("location") || "";
    if (storedLoc) {
      try {
        const parsedLoc = JSON.parse(storedLoc);
        setLocation({
          coordinates: [
            parsedLoc.coordinates?.[0]?.toString() || "",
            parsedLoc.coordinates?.[1]?.toString() || ""
          ],
          address: parsedLoc.address || ""
        });
      } catch (e) {
        console.warn("Could not parse stored location:", e);
      }
    }
  }, []);

  const handelSubmit = async (e) => {
    e.preventDefault();

    // Parse JSON fields
    let parsedEventArtist = [];
    try {
      parsedEventArtist = JSON.parse(eventArtist);
    } catch (e) {
      console.error("Invalid eventArtist JSON:", e);
    }

    // For simplicity we'll send eventTime as-is; if you stored JSON, parse similarly.

    // Build the location object as GeoJSON
    const parsedLocation = {
      type: "Point",
      coordinates: [
        parseFloat(location.coordinates[0]),
        parseFloat(location.coordinates[1])
      ],
      address: location.address
    };

    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/event/update/${id}`, {
        eventName,
        image,
        eventLanguage,
        eventDuration,
        eventArtist: parsedEventArtist,
        eventVenue,
        eventAbout,
        eventDate,
        eventTime,
        eventType,
        location: parsedLocation
      });
      navigate("/eventview");
    } catch (err) {
      console.error("Error during update:", err.response?.data || err.message);
    }
  };

  return (
    <div className="edit-body-movie-div">
      <form style={{ margin: "5rem" }} onSubmit={handelSubmit}>
        <div className="mb-3">
          <label>Enter Event Name</label>
          <input
            type="text"
            className="form-control"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Image URL</label>
          <input
            type="text"
            className="form-control"
            value={image}
            onChange={e => setImage(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Language</label>
          <input
            type="text"
            className="form-control"
            value={eventLanguage}
            onChange={e => setEventLanguage(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Duration</label>
          <input
            type="text"
            className="form-control"
            value={eventDuration}
            onChange={e => setEventDuration(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Artist (JSON Format)</label>
          <input
            type="text"
            className="form-control"
            value={eventArtist}
            onChange={e => setEventArtist(e.target.value)}
            placeholder='e.g. [{"artist":"Lead","name":"Jane","image":"url"}]'
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Venue</label>
          <input
            type="text"
            className="form-control"
            value={eventVenue}
            onChange={e => setEventVenue(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event About</label>
          <input
            type="text"
            className="form-control"
            value={eventAbout}
            onChange={e => setEventAbout(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Date</label>
          <input
            type="date"
            className="form-control"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Time</label>
          <input
            type="text"
            className="form-control"
            value={eventTime}
            onChange={e => setEventTime(e.target.value)}
            placeholder='e.g. ["10:00", "14:00"] or "10:00"'
            required
          />
        </div>

        <div className="mb-3">
          <label>Enter Event Type</label>
          <input
            type="text"
            className="form-control"
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            required
          />
        </div>

        {/* --- New Location Fields --- */}
        <div className="mb-3">
          <label>Location Coordinates (Longitude, Latitude)</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Longitude"
              value={location.coordinates[0]}
              onChange={e => setLocation({
                ...location,
                coordinates: [e.target.value, location.coordinates[1]]
              })}
              required
            />
            <input
              type="text"
              className="form-control"
              placeholder="Latitude"
              value={location.coordinates[1]}
              onChange={e => setLocation({
                ...location,
                coordinates: [location.coordinates[0], e.target.value]
              })}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Location Address</label>
          <input
            type="text"
            className="form-control"
            value={location.address}
            onChange={e => setLocation({
              ...location,
              address: e.target.value
            })}
            required
          />
        </div>

        <div className="Update_container">
          <button className="Updatebutton1" type="submit">
            Update
          </button>
        </div>

        <Link to="/eventview" style={{ textDecoration: "none" }}>
          <div className="Update_container" style={{ marginTop: "1rem" }}>
            <button className="Homebutton1" type="button">
              Home
            </button>
          </div>
        </Link>
      </form>
    </div>
  );
}

export default Editevent;
