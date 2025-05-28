import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Addevent.css";

const AddEvent = () => {
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState('');
  const [eventLanguage, setEventLanguage] = useState('');
  const [eventDuration, setEventDuration] = useState('');
  const [eventArtist, setEventArtist] = useState([{ artist: "", name: "", image: "" }]);
  const [eventVenue, setEventVenue] = useState('');
  const [eventAbout, setEventAbout] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState(['']);
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState({
    coordinates: ["", ""],
    address: ""
  });

  const handleArtistChange = (index, field, value) => {
    const updatedArtists = [...eventArtist];
    updatedArtists[index][field] = value;
    setEventArtist(updatedArtists);
  };

  const addArtist = () => {
    setEventArtist([...eventArtist, { artist: "", name: "", image: "" }]);
  };

  const handleEventTimeChange = (index, value) => {
    const updatedTimes = [...eventTime];
    updatedTimes[index] = value;
    setEventTime(updatedTimes);
  };

  const addEventTime = () => {
    setEventTime([...eventTime, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventData = {
      eventName,
      image,
      eventLanguage,
      eventDuration,
      eventArtist,
      eventVenue,
      eventAbout,
      eventDate,
      eventTime,
      eventType,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(location.coordinates[0]),
          parseFloat(location.coordinates[1])
        ],
        address: location.address
      }
    };

    try {
      const response = await axios.post("https://ticketflix-backend.onrender.com/event/add", eventData);
      console.log(response.data);
      navigate("/eventview");
    } catch (error) {
      console.error("Error submitting event:", error.response?.data || error.message);
    }
  };

  return (
    <div className="Movie_body">
      <form className="form_class_movie" style={{ margin: "5rem" }} onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="Label_movie">Event Name</label>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Event Poster URL</label>
          <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required />
          {image && <img src={image} alt="Event Poster" width="100" />}
        </div>

        <div className="mb-4">
          <label className="Label_movie">Language</label>
          <input type="text" value={eventLanguage} onChange={(e) => setEventLanguage(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Duration</label>
          <input type="text" value={eventDuration} onChange={(e) => setEventDuration(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Venue</label>
          <input type="text" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Description</label>
          <input type="text" value={eventAbout} onChange={(e) => setEventAbout(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Event Date</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Event Time(s)</label>
          {eventTime.map((time, index) => (
            <input key={index} type="text" value={time} onChange={(e) => handleEventTimeChange(index, e.target.value)} />
          ))}
          <button type="button" onClick={addEventTime}>Add Time</button>
        </div>

        <div className="mb-4">
          <label className="Label_movie">Event Type</label>
          <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Artists</label>
          {eventArtist.map((member, index) => (
            <div key={index}>
              <input type="text" placeholder="Artist Role" value={member.artist} onChange={(e) => handleArtistChange(index, 'artist', e.target.value)} required />
              <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleArtistChange(index, 'name', e.target.value)} required />
              <input type="text" placeholder="Image URL" value={member.image} onChange={(e) => handleArtistChange(index, 'image', e.target.value)} />
              {member.image && <img src={member.image} alt="Artist" width="80" />}
            </div>
          ))}
          <button type="button" onClick={addArtist}>Add Artist</button>
        </div>

        <div className="mb-4">
          <label className="Label_movie">Location Coordinates (Longitude, Latitude)</label>
          <input type="text" placeholder="Longitude" value={location.coordinates[0]} onChange={(e) => setLocation({ ...location, coordinates: [e.target.value, location.coordinates[1]] })} />
          <input type="text" placeholder="Latitude" value={location.coordinates[1]} onChange={(e) => setLocation({ ...location, coordinates: [location.coordinates[0], e.target.value] })} />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Location Address</label>
          <input type="text" value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} required />
        </div>

        <div className="Submit">
          <button className="Movie_Button" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;
