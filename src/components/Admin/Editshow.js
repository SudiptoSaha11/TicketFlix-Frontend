import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Editshow.css";

function Editshow() {
  const [MovieName, setMovieName] = useState("");
  // Use an array of objects for halls: { hallName: string, showTimes: string }
  const [halls, setHalls] = useState([]);
  const [GoldTicketPrice, setGoldTicketPrice] = useState("");
  const [SilverTicketPrice, setSilverTicketPrice] = useState("");
  const [PlatinumTicketPrice, setPlatinumTicketPrice] = useState("");
  const [id, setId] = useState("");

  const navigate = useNavigate();

  // On mount, load data from localStorage
  useEffect(() => {
    setMovieName(localStorage.getItem("MovieName") || "");
    setGoldTicketPrice(localStorage.getItem("GoldTicketPrice") || "");
    setSilverTicketPrice(localStorage.getItem("SilverTicketPrice") || "");
    setPlatinumTicketPrice(localStorage.getItem("PlatinumTicketPrice") || "");
    setId(localStorage.getItem("id") || "");

    const storedHallName = localStorage.getItem("hallName");
    const storedShowTime = localStorage.getItem("showTime");
    if (storedHallName && storedShowTime) {
      try {
        const parsedHallNames = JSON.parse(storedHallName); // e.g., ["Hall 1", "Hall 2"]
        const parsedShowTimes = JSON.parse(storedShowTime); // e.g., [ ["14:30", "18:00"], ["15:00", "19:00"] ]
        const combined = parsedHallNames.map((hall, index) => ({
          hallName: hall,
          // Join show times with a comma so user can edit them as a single string.
          showTimes: Array.isArray(parsedShowTimes[index])
            ? parsedShowTimes[index].join(", ")
            : ""
        }));
        setHalls(combined);
      } catch (e) {
        console.error("Error parsing stored hallName or showTime", e);
      }
    }
  }, []);

  // Update hall object when a field changes
  const handleHallChange = (index, field, value) => {
    const updatedHalls = [...halls];
    updatedHalls[index][field] = value;
    setHalls(updatedHalls);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Convert halls into arrays for the payload.
    const hallNameArray = halls.map((hall) => hall.hallName.trim());
    const showTimeArray = halls.map((hall) =>
      hall.showTimes
        .split(",")
        .map((time) => time.trim())
        .filter((time) => time !== "")
    );

    try {
      await axios.patch(`http://localhost:5000/Scheduleschema/update/${id}`, {
        MovieName,
        hallName: hallNameArray,
        showTime: showTimeArray,
        GoldTicketPrice,
        SilverTicketPrice,
        PlatinumTicketPrice,
      });
    } catch (err) {
      console.log("Error updating schedule:", err);
      console.log("Data:", err.response.data.message);
      console.log("Status:", err.response.status);
    }
    navigate("/showtime");
  };

  return (
    <div className="editshow-body-show">
      <form style={{ margin: "5rem" }} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Enter Movie Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Movie Name"
            value={MovieName}
            onChange={(e) => setMovieName(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-3">
          <label>Halls and Show Times</label>
          {halls.map((hall, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Hall Name"
                value={hall.hallName}
                onChange={(e) =>
                  handleHallChange(index, "hallName", e.target.value)
                }
                required
              />
              <br />
              <input
                type="text"
                className="form-control"
                placeholder="Enter Show Times (comma separated)"
                value={hall.showTimes}
                onChange={(e) =>
                  handleHallChange(index, "showTimes", e.target.value)
                }
                required
              />
              <br />
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>Gold Ticket Price</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Gold Ticket Price"
            value={GoldTicketPrice}
            onChange={(e) => setGoldTicketPrice(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-3">
          <label>Silver Ticket Price</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Silver Ticket Price"
            value={SilverTicketPrice}
            onChange={(e) => setSilverTicketPrice(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-3">
          <label>Platinum Ticket Price</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Platinum Ticket Price"
            value={PlatinumTicketPrice}
            onChange={(e) => setPlatinumTicketPrice(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="Update_container2">
          <button className="Updatebutton2" type="submit">
            Update
          </button>
        </div>
        <br />
        <Link style={{ textDecoration: "none" }} to="/movieview">
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
