import React, { useState } from "react";
import axios from "axios";
import "./Addshow.css";

const Addshow = () => {
  // Movie name input
  const [MovieName, setMovieName] = useState("");
  // Array of hall names
  const [hallNames, setHallNames] = useState([]);
  // Input for a new hall name
  const [newHallName, setNewHallName] = useState("");

  // showTimes: object mapping each hall name to an array of time strings
  const [showTimes, setShowTimes] = useState({});
  // newTimeInput: object mapping each hall name to the current new time (a string)
  const [newTimeInput, setNewTimeInput] = useState({});

  // hallPricing: object mapping each hall name to its pricing object
  // Pricing object: { GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice }
  const [hallPricing, setHallPricing] = useState({});

  // Handler to add a new hall
  const addHallHandler = () => {
    const trimmedHall = newHallName.trim();
    if (trimmedHall !== "" && !hallNames.includes(trimmedHall)) {
      setHallNames([...hallNames, trimmedHall]);
      // Initialize an empty array for showtimes for this hall
      setShowTimes({ ...showTimes, [trimmedHall]: [] });
      // Initialize new time input for this hall
      setNewTimeInput({ ...newTimeInput, [trimmedHall]: "" });
      // Initialize pricing for this hall (pricing applies to all showtimes in this hall)
      setHallPricing({
        ...hallPricing,
        [trimmedHall]: { GoldTicketPrice: "", SilverTicketPrice: "", PlatinumTicketPrice: "" },
      });
      setNewHallName("");
    }
  };

  // Handler to add a new showtime (time only) for a given hall
  const addTimeHandler = (hall) => {
    const time = newTimeInput[hall];
    if (time && time.trim() !== "") {
      setShowTimes({
        ...showTimes,
        [hall]: [...(showTimes[hall] || []), time.trim()],
      });
      setNewTimeInput({
        ...newTimeInput,
        [hall]: "",
      });
    }
  };

  // Handler to remove a showtime from a hall
  const removeTimeHandler = (hall, index) => {
    const updatedTimes = showTimes[hall].filter((_, i) => i !== index);
    setShowTimes({ ...showTimes, [hall]: updatedTimes });
  };

  // Handler to update pricing for a hall
  const updatePricing = (hall, field, value) => {
    setHallPricing({
      ...hallPricing,
      [hall]: {
        ...hallPricing[hall],
        [field]: value,
      },
    });
  };

  // Handler to submit the form
  const addRowHandler = async (event) => {
    event.preventDefault();

    // Build the showTime array so that its order matches hallNames.
    // Each element corresponds to one hall and has:
    // { time: [array of time strings], GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice }
    const payloadShowTime = hallNames.map((hall) => {
      return {
        time: showTimes[hall] || [],
        GoldTicketPrice: Number(hallPricing[hall]?.GoldTicketPrice),
        SilverTicketPrice: Number(hallPricing[hall]?.SilverTicketPrice),
        PlatinumTicketPrice: Number(hallPricing[hall]?.PlatinumTicketPrice),
      };
    });

    const newShow = {
      MovieName,
      hallName: hallNames,
      showTime: payloadShowTime,
    };

    console.log("Submitting New Show:", newShow);
    try {
      const response = await axios.post("https://ticketflix-backend.onrender.com/Scheduleschema/add", newShow);
      console.log("Response:", response.data);
      alert("Show added successfully!");
    } catch (err) {
      console.error("Error creating schedule:", err);
    }

    // Reset form fields
    setMovieName("");
    setHallNames([]);
    setNewHallName("");
    setShowTimes({});
    setNewTimeInput({});
    setHallPricing({});
  };

  return (
    <div className="Show_body">
      <form className="form_class_show" style={{ margin: "5rem" }} onSubmit={addRowHandler}>
        {/* Movie Name */}
        <div className="mb-6">
          <label className="Label_Show">Enter Movie Name</label>
          <input
            type="text"
            className="form-control_Show"
            placeholder="Enter Movie Name"
            value={MovieName}
            onChange={(e) => setMovieName(e.target.value)}
            required
          />
        </div>

        {/* Hall Name Input */}
        <div className="mb-6">
          <label className="Label_Show">Enter Hall Name</label>
          <input
            type="text"
            className="form-control_Show"
            placeholder="Enter Hall Name"
            value={newHallName}
            onChange={(e) => setNewHallName(e.target.value)}
          />
          <button type="button" onClick={addHallHandler}>
            Add Hall
          </button>
        </div>

        {/* For each hall, allow adding multiple showtimes and enter pricing */}
        {hallNames.length > 0 && (
          <div className="mb-6">
            <label className="Label_Show">Halls, Show Times & Pricing</label>
            {hallNames.map((hall, index) => (
              <div key={index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
                <strong>{hall}</strong>
                {/* Show Time Input */}
                <div style={{ marginTop: "5px" }}>
                  <label>Show Time:</label>
                  <input
                    type="time"
                    className="form-control_Show"
                    value={newTimeInput[hall] || ""}
                    onChange={(e) =>
                      setNewTimeInput({
                        ...newTimeInput,
                        [hall]: e.target.value,
                      })
                    }
                  />
                  <button type="button" onClick={() => addTimeHandler(hall)}>
                    Add Time
                  </button>
                </div>
                {/* Display Added Show Times */}
                <div style={{ marginTop: "5px" }}>
                  {showTimes[hall] && showTimes[hall].length > 0 && (
                    <span>
                      <strong>Added Times:</strong>
                      {showTimes[hall].map((time, i) => (
                        <div key={i}>
                          {time}{" "}
                          <button type="button" onClick={() => removeTimeHandler(hall, i)}>
                            ❌
                          </button>
                        </div>
                      ))}
                    </span>
                  )}
                </div>
                {/* Pricing Inputs for this hall */}
                <div style={{ marginTop: "5px" }}>
                  <label>Recliner Ticket Price:</label>
                  <input
                    type="number"
                    className="form-control_Show"
                    placeholder="Enter Recliner Ticket Price"
                    value={hallPricing[hall]?.GoldTicketPrice || ""}
                    onChange={(e) => updatePricing(hall, "GoldTicketPrice", e.target.value)}
                  />
                </div>
                <div>
                  <label>Royal Ticket Price:</label>
                  <input
                    type="number"
                    className="form-control_Show"
                    placeholder="Enter Royal Ticket Price"
                    value={hallPricing[hall]?.SilverTicketPrice || ""}
                    onChange={(e) => updatePricing(hall, "SilverTicketPrice", e.target.value)}
                  />
                </div>
                <div>
                  <label>Club Ticket Price:</label>
                  <input
                    type="number"
                    className="form-control_Show"
                    placeholder="Enter Club Ticket Price"
                    value={hallPricing[hall]?.PlatinumTicketPrice || ""}
                    onChange={(e) => updatePricing(hall, "PlatinumTicketPrice", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="submit-2">
          <button className="Button_Show" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addshow;
