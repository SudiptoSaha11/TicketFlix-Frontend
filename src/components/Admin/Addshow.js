import React, { useEffect, useState } from "react";
import api from "../../Utils/api";
import "./Addshow.css";

/**
 * Aligned with backend per-time pricing
 *
 * Your backend accepts either:
 * 1) time: ["10:00", "14:00"], plus top-level prices per hall (same price for all times)
 * 2) time: [{ at, RoyalTicketPrice, ExecutiveTicketPrice, ExecutiveTicketPrice }, ...] (DIFFERENT price per time)
 *
 * This UI implements #2 so you can set different prices for each showtime.
 */

const Addshow = () => {
  // Movies list and selection (Product1 docs)
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");

  // Array of hall names
  const [hallNames, setHallNames] = useState([]);
  // Input for a new hall name
  const [newHallName, setNewHallName] = useState("");

  // timeRows: { [hallName]: Array<{ at: string, RoyalTicketPrice?: number|string, ExecutiveTicketPrice?: number|string, ExecutiveTicketPrice?: number|string }> }
  const [timeRows, setTimeRows] = useState({});

  // UI state
  const [submitting, setSubmitting] = useState(false);

  // --- Load movies so we can send Movie:ObjectId as backend expects ---
  useEffect(() => {
    const loadMovies = async () => {
      try {
        // Adjust this path if your movie list route differs (e.g., "/movies/all").
        const res = await api.get("/movieview");
        setMovies(res.data || []);
      } catch (e) {
        console.error("Failed to fetch movies", e);
      }
    };
    loadMovies();
  }, []);

  // Handler to add a new hall
  const addHallHandler = () => {
    const trimmedHall = newHallName.trim();
    if (trimmedHall !== "" && !hallNames.includes(trimmedHall)) {
      setHallNames((prev) => [...prev, trimmedHall]);
      setTimeRows((prev) => ({ ...prev, [trimmedHall]: [emptyTimeRow()] }));
      setNewHallName("");
    }
  };

  const emptyTimeRow = () => ({ at: "", RoyalTicketPrice: "", ExecutiveTicketPrice: "", ExecutiveTicketPrice: "" });

  const addTimeRow = (hall) => {
    setTimeRows((prev) => ({ ...prev, [hall]: [...(prev[hall] || []), emptyTimeRow()] }));
  };

  const removeTimeRow = (hall, index) => {
    setTimeRows((prev) => ({
      ...prev,
      [hall]: (prev[hall] || []).filter((_, i) => i !== index),
    }));
  };

  const updateTimeRow = (hall, index, field, value) => {
    setTimeRows((prev) => {
      const copy = { ...prev };
      const rows = [...(copy[hall] || [])];
      rows[index] = { ...rows[index], [field]: value };
      copy[hall] = rows;
      return copy;
    });
  };

  // Build payload aligned to backend normalizeShows() expectations (per-time objects with prices)
  const buildShowsPayload = () => {
    return hallNames.map((hall) => ({
      hallName: hall,
      time: (timeRows[hall] || [])
        .filter((r) => r.at) // ignore empty rows
        .map((r) => ({
          at: r.at,
          RoyalTicketPrice: Number(r.RoyalTicketPrice || 0),
          ExecutiveTicketPrice: Number(r.ExecutiveTicketPrice || 0),
          ExecutiveTicketPrice: Number(r.ExecutiveTicketPrice || 0),
        })),
    }));
  };

  // Handler to submit the form (Create schedule)
  const addRowHandler = async (event) => {
    event.preventDefault();

    if (!selectedMovieId) {
      alert("Please select a movie.");
      return;
    }

    const payload = {
      Movie: selectedMovieId, // ObjectId (string)
      shows: buildShowsPayload(),
    };

    try {
      setSubmitting(true);
      const response = await api.post("/Scheduleschema/add", payload);
      console.log("Response:", response.data);
      alert("Schedule created successfully!");

      // Reset form fields
      setSelectedMovieId("");
      setHallNames([]);
      setNewHallName("");
      setTimeRows({});
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(
        err?.response?.data?.message || "Creating schedule failed. Check console for details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="Show_body">
      <form className="form_class_show" style={{ margin: "5rem" }} onSubmit={addRowHandler}>
        {/* Movie Selector (uses Movie _id) */}
        <div className="mb-6">
          <label className="Label_Show">Select Movie</label>
          <select
            className="form-control_Show"
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Choose a movie --
            </option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.movieName || m.title || m.name}
              </option>
            ))}
          </select>
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

        {/* Per-hall, per-time price rows */}
        {hallNames.length > 0 && (
          <div className="mb-6">
            <label className="Label_Show">Halls, Show Times & Pricing</label>
            {hallNames.map((hall, index) => (
              <div key={index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
                <strong>{hall}</strong>

                {(timeRows[hall] || []).map((row, i) => (
                  <div key={i} style={{ marginTop: "10px", padding: "10px", border: "1px dashed #bbb" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "8px" }}>
                      <div>
                        <label>Show Time</label>
                        <input
                          type="time"
                          className="form-control_Show"
                          value={row.at}
                          onChange={(e) => updateTimeRow(hall, i, "at", e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Gold Price</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control_Show"
                          placeholder="Gold"
                          value={row.RoyalTicketPrice}
                          onChange={(e) => updateTimeRow(hall, i, "RoyalTicketPrice", e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Silver Price</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control_Show"
                          placeholder="Silver"
                          value={row.ExecutiveTicketPrice}
                          onChange={(e) => updateTimeRow(hall, i, "ExecutiveTicketPrice", e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Platinum Price</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control_Show"
                          placeholder="Platinum"
                          value={row.ExecutiveTicketPrice}
                          onChange={(e) => updateTimeRow(hall, i, "ExecutiveTicketPrice", e.target.value)}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "end" }}>
                        <button type="button" onClick={() => removeTimeRow(hall, i)}>
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: "8px" }}>
                  <button type="button" onClick={() => addTimeRow(hall)}>
                    Add Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="submit-2">
          <button className="Button_Show" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addshow;
