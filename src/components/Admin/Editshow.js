import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Editshow.css";

function Editshow() {
  const [MovieName, setMovieName] = useState("");
  const [halls, setHalls] = useState([]);
  const [newTimeInput, setNewTimeInput] = useState({});
  const [id, setId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMovieName(localStorage.getItem("MovieName") || "");
    setId(localStorage.getItem("id") || "");

    const storedHallNames = localStorage.getItem("hallName");
    const storedShowTimes = localStorage.getItem("showTime");
    if (storedHallNames && storedShowTimes) {
      try {
        const hallNamesArr = JSON.parse(storedHallNames);
        const showTimeArr = JSON.parse(storedShowTimes);
        const combined = hallNamesArr.map((name, idx) => {
          const s = showTimeArr[idx] || {};
          return {
            hallName: name,
            times: Array.isArray(s.time) ? s.time : [],
            GoldTicketPrice: s.GoldTicketPrice ?? "",
            SilverTicketPrice: s.SilverTicketPrice ?? "",
            PlatinumTicketPrice: s.PlatinumTicketPrice ?? "",
          };
        });
        setHalls(combined);
        // initialize newTimeInput
        const initialNew = {};
        hallNamesArr.forEach(name => { initialNew[name] = ""; });
        setNewTimeInput(initialNew);
      } catch (e) {
        console.error("Parsing showtime storage failed", e);
      }
    }
  }, []);

  const handleHallChange = (index, field, value) => {
    const updated = [...halls];
    updated[index][field] = value;
    setHalls(updated);
  };

  const handleAddTime = (hallName) => {
    if (!newTimeInput[hallName]) return;
    setHalls(halls.map(h => h.hallName === hallName ? {
      ...h,
      times: [...h.times, newTimeInput[hallName]]
    } : h));
    setNewTimeInput({ ...newTimeInput, [hallName]: "" });
  };

  const handleRemoveTime = (hallName, idxToRemove) => {
    setHalls(halls.map(h => h.hallName === hallName ? {
      ...h,
      times: h.times.filter((_, i) => i !== idxToRemove)
    } : h));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hallName = halls.map(h => h.hallName.trim());
    const showTime = halls.map(h => ({
      time: h.times,
      GoldTicketPrice: Number(h.GoldTicketPrice),
      SilverTicketPrice: Number(h.SilverTicketPrice),
      PlatinumTicketPrice: Number(h.PlatinumTicketPrice),
    }));

    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/Scheduleschema/update/${id}`, {
        MovieName,
        hallName,
        showTime,
      });
      navigate("/showtime");
    } catch (err) {
      console.error("Error updating schedule:", err);
    }
  };

  return (
    <div className="editshow-body-show">
      <form className="editshow-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Enter Movie Name</label>
          <input
            type="text"
            className="form-control"
            value={MovieName}
            onChange={e => setMovieName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Halls & Show Times & Pricing</label>
          {halls.map((hall, idx) => (
            <div key={idx} className="hall-edit-block">
              <input
                type="text"
                className="form-control"
                placeholder="Hall Name"
                value={hall.hallName}
                onChange={e => handleHallChange(idx, "hallName", e.target.value)}
                required
              />

              <div className="time-input-group">
                <input
                  type="time"
                  className="form-control-time"
                  value={newTimeInput[hall.hallName] || ""}
                  onChange={e => setNewTimeInput({
                    ...newTimeInput,
                    [hall.hallName]: e.target.value
                  })}
                />
                <button type="button" onClick={() => handleAddTime(hall.hallName)}>
                  Add Time
                </button>
              </div>

              <div className="added-times">
                {hall.times.map((t, i) => (
                  <div key={i} className="time-item">
                    {t} <button type="button" onClick={() => handleRemoveTime(hall.hallName, i)}>×</button>
                  </div>
                ))}
              </div>

              <input
                type="number"
                className="form-control"
                placeholder="Recliner Ticket Price"
                value={hall.GoldTicketPrice}
                onChange={e => handleHallChange(idx, "GoldTicketPrice", e.target.value)}
                required
              />
              <input
                type="number"
                className="form-control"
                placeholder="Royal Ticket Price"
                value={hall.SilverTicketPrice}
                onChange={e => handleHallChange(idx, "SilverTicketPrice", e.target.value)}
                required
              />
              <input
                type="number"
                className="form-control"
                placeholder="Club Ticket Price"
                value={hall.PlatinumTicketPrice}
                onChange={e => handleHallChange(idx, "PlatinumTicketPrice", e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="Update_container2">
          <button className="Updatebutton2" type="submit">
            Update
          </button>
        </div>

        <Link to="/showtime">
          <div className="Update_container2">
            <button className="Homebutton2" type="button">
              Home
            </button>
          </div>
        </Link>
      </form>
    </div>
  );
}

export default Editshow;