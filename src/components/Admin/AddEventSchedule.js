import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Movie.css"; // reuse or swap in an EventSchedule.css

const AddEventSchedule = () => {
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [eventVenue, setEventVenue] = useState([""]);
  const [eventShowTime, setEventShowTime] = useState([
    {
      VIPPrice: "",
      MIPTicketPrice: "",
      PlatinumTicketPrice: "",
      DiamondTicketPrice: "",
      GoldTicketPrice: "",
      SilverTicketPrice: "",
      BronzeTicketPrice: "",
    },
  ]);

  const handleVenueChange = (idx, val) => {
    const v = [...eventVenue];
    v[idx] = val;
    setEventVenue(v);
  };
  const addVenue = () => {
    setEventVenue([...eventVenue, ""]);
  };

  const handleShowTimeChange = (idx, field, val) => {
    const s = [...eventShowTime];
    s[idx][field] = val;
    setEventShowTime(s);
  };
  const addShowTime = () => {
    setEventShowTime([
      ...eventShowTime,
      {
        VIPPrice: "",
        MIPTicketPrice: "",
        PlatinumTicketPrice: "",
        DiamondTicketPrice: "",
        GoldTicketPrice: "",
        SilverTicketPrice: "",
        BronzeTicketPrice: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/eventschedule/add", {
        eventName,
        eventVenue,
        EventshowTime: eventShowTime,
      });
      navigate("/eventscheduleview");
    } catch (err) {
      console.error("Error creating schedule:", err.response?.data || err);
    }
  };

  return (
    <div className="Movie_body">
      <form
        className="form_class_movie"
        style={{ margin: "5rem" }}
        onSubmit={handleSubmit}
      >
        {/* Event Name */}
        <div className="mb-4">
          <label className="Label_movie">Event Name</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        {/* Venues Array */}
        <div className="mb-4">
          <label className="Label_movie">Venue(s)</label>
          {eventVenue.map((venue, idx) => (
            <div key={idx} style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                className="form-control_movie"
                placeholder="Enter Venue Name"
                value={venue}
                onChange={(e) => handleVenueChange(idx, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addVenue}>
            Add Another Venue
          </button>
        </div>

        {/* ShowTime Price Blocks */}
        <div className="mb-4">
          <label className="Label_movie">ShowTime Price Blocks</label>
          {eventShowTime.map((block, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div className="mb-2">
                <label>VIP Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.VIPPrice}
                  onChange={(e) =>
                    handleShowTimeChange(idx, "VIPPrice", e.target.value)
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>MI/P Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.MIPTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(idx, "MIPTicketPrice", e.target.value)
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>Platinum Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.PlatinumTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(
                      idx,
                      "PlatinumTicketPrice",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>Diamond Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.DiamondTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(
                      idx,
                      "DiamondTicketPrice",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>Gold Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.GoldTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(idx, "GoldTicketPrice", e.target.value)
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>Silver Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.SilverTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(
                      idx,
                      "SilverTicketPrice",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <label>Bronze Ticket Price</label>
                <input
                  type="number"
                  className="form-control_movie"
                  value={block.BronzeTicketPrice}
                  onChange={(e) =>
                    handleShowTimeChange(
                      idx,
                      "BronzeTicketPrice",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addShowTime}>
            Add Another Price Block
          </button>
        </div>

        <div className="Submit">
          <button className="Movie_Button" type="submit">
            Submit Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventSchedule;
