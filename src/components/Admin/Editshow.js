import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Utils/api";
import "./Editshow.css";

function Editshow() {
  const [MovieName, setMovieName] = useState("");
  const [halls, setHalls] = useState([]);
  const [newTimeInput, setNewTimeInput] = useState({});
  const [id, setId] = useState("");
  const [movieIdForUpdate, setMovieIdForUpdate] = useState("");
  const navigate = useNavigate();

  // ----- helpers -----
  const emptyPrices = () => ({
    RoyalTicketPrice: "",
    ExecutiveTicketPrice: "",
    ExecutiveTicketPrice: "",
  });

  // Load from the doc saved by Showtime -> localStorage.setItem("schedule", JSON.stringify(doc))
  useEffect(() => {
    const raw = localStorage.getItem("schedule");
    if (raw) {
      try {
        const doc = JSON.parse(raw);
        setId(doc?._id || "");
        const mv = doc?.Movie;
        const mvId =
          typeof mv === "object" && mv?._id ? mv._id :
            typeof mv === "string" ? mv : "";
        if (mvId) setMovieIdForUpdate(mvId);
        setMovieName((typeof mv === "object" && mv?.movieName) ? mv.movieName : (doc?.MovieName || ""));

        const shows = Array.isArray(doc?.shows) ? doc.shows : [];
        const mapped = shows.map(s => {
          const arr = Array.isArray(s.time) ? s.time : [];
          const isPerTime = arr.length > 0 && typeof arr[0] === "object" && !!arr[0]?.at;

          if (isPerTime) {
            // per-time prices coming from backend
            return {
              hallName: s.hallName || "",
              times: arr.map(t => t.at).filter(Boolean),
              perTime: true,
              perTimePrices: arr.map(t => ({
                RoyalTicketPrice: t.RoyalTicketPrice ?? "",
                ExecutiveTicketPrice: t.ExecutiveTicketPrice ?? "",
                ExecutiveTicketPrice: t.ExecutiveTicketPrice ?? "",
              })),
              // hall-level prices not used in this mode
              RoyalTicketPrice: "",
              ExecutiveTicketPrice: "",
              ExecutiveTicketPrice: "",
            };
          } else {
            // hall-level prices with times as strings
            const first = typeof arr[0] === "object" ? arr[0] : {};
            return {
              hallName: s.hallName || "",
              times: arr.map(t => (typeof t === "string" ? t : t?.at)).filter(Boolean),
              perTime: false,
              perTimePrices: [], // not used
              RoyalTicketPrice: first.RoyalTicketPrice ?? s.RoyalTicketPrice ?? "",
              ExecutiveTicketPrice: first.ExecutiveTicketPrice ?? s.ExecutiveTicketPrice ?? "",
              ExecutiveTicketPrice: first.ExecutiveTicketPrice ?? s.ExecutiveTicketPrice ?? "",
            };
          }
        });

        setHalls(mapped);
        const initNew = {};
        mapped.forEach(h => { initNew[h.hallName] = ""; });
        setNewTimeInput(initNew);
      } catch (e) {
        console.error("Failed to parse saved schedule:", e);
      }
    }
  }, []);

  const handleHallField = (index, field, value) => {
    const updated = [...halls];
    updated[index][field] = value;
    setHalls(updated);
  };

  const togglePerTime = (index) => {
    const updated = [...halls];
    const h = updated[index];
    // flipping the mode
    if (!h.perTime) {
      // going to per-time: seed perTimePrices for each time
      h.perTime = true;
      h.perTimePrices = h.times.map(() => ({
        RoyalTicketPrice: h.RoyalTicketPrice || "",
        ExecutiveTicketPrice: h.ExecutiveTicketPrice || "",
        ExecutiveTicketPrice: h.ExecutiveTicketPrice || "",
      }));
      // clear hall-level prices (not used now)
      h.RoyalTicketPrice = "";
      h.ExecutiveTicketPrice = "";
      h.ExecutiveTicketPrice = "";
    } else {
      // going back to hall-level: take first per-time set as hall prices
      const first = h.perTimePrices?.[0] || emptyPrices();
      h.perTime = false;
      h.RoyalTicketPrice = first.RoyalTicketPrice || "";
      h.ExecutiveTicketPrice = first.ExecutiveTicketPrice || "";
      h.ExecutiveTicketPrice = first.ExecutiveTicketPrice || "";
      h.perTimePrices = [];
    }
    setHalls(updated);
  };

  const handlePerTimePrice = (hallIdx, timeIdx, field, value) => {
    const updated = [...halls];
    const prices = updated[hallIdx].perTimePrices || [];
    const row = { ...(prices[timeIdx] || emptyPrices()), [field]: value };
    prices[timeIdx] = row;
    updated[hallIdx].perTimePrices = prices;
    setHalls(updated);
  };

  const handleAddTime = (hallName) => {
    if (!newTimeInput[hallName]) return;
    setHalls(halls.map(h => {
      if (h.hallName !== hallName) return h;
      const added = { ...h, times: [...h.times, newTimeInput[hallName]] };
      if (h.perTime) {
        added.perTimePrices = [...(h.perTimePrices || []), emptyPrices()];
      }
      return added;
    }));
    setNewTimeInput({ ...newTimeInput, [hallName]: "" });
  };

  const handleRemoveTime = (hallName, idxToRemove) => {
    setHalls(halls.map(h => {
      if (h.hallName !== hallName) return h;
      const next = {
        ...h,
        times: h.times.filter((_, i) => i !== idxToRemove),
      };
      if (h.perTime && Array.isArray(h.perTimePrices)) {
        next.perTimePrices = h.perTimePrices.filter((_, i) => i !== idxToRemove);
      }
      return next;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      console.error("No schedule id found for update.");
      return;
    }

    // Build backend-ready payload per hall
    const shows = halls.map(h => {
      if (h.perTime) {
        // per-showtime pricing
        const time = (h.times || []).map((at, i) => ({
          at: String(at),
          RoyalTicketPrice: Number(h.perTimePrices?.[i]?.RoyalTicketPrice || 0),
          ExecutiveTicketPrice: Number(h.perTimePrices?.[i]?.ExecutiveTicketPrice || 0),
          ExecutiveTicketPrice: Number(h.perTimePrices?.[i]?.ExecutiveTicketPrice || 0),
        }));
        return { hallName: (h.hallName || "").trim(), time };
      }
      // hall-level pricing for all times
      return {
        hallName: (h.hallName || "").trim(),
        time: (h.times || []).map(t => String(t)),
        RoyalTicketPrice: Number(h.RoyalTicketPrice || 0),
        ExecutiveTicketPrice: Number(h.ExecutiveTicketPrice || 0),
        ExecutiveTicketPrice: Number(h.ExecutiveTicketPrice || 0),
      };
    });

    const payload = {
      Movie: movieIdForUpdate || undefined,
      shows
    };

    try {
      await api.patch(`/Scheduleschema/update/${id}`, payload);
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
                onChange={e => handleHallField(idx, "hallName", e.target.value)}
                required
              />

              {/* Per-showtime pricing toggle */}
              <div style={{ margin: "6px 0 10px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  id={`perTime-${idx}`}
                  type="checkbox"
                  checked={!!hall.perTime}
                  onChange={() => togglePerTime(idx)}
                />
                <label htmlFor={`perTime-${idx}`}>Per-showtime pricing</label>
              </div>

              {/* Add time input */}
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

              {/* Existing times */}
              <div className="added-times">
                {/* Column labels for per-time mode */}
                {hall.perTime && hall.times.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      margin: "6px 0 8px 0",
                      opacity: 0.85,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <span style={{ minWidth: 64 }}>Time</span>
                    {/* space where the remove (×) button sits */}
                    <span style={{ width: 24 }}></span>
                    <span style={{ width: 90, textAlign: "center" }}>Gold</span>
                    <span style={{ width: 90, textAlign: "center" }}>Silver</span>
                    <span style={{ width: 90, textAlign: "center" }}>Platinum</span>
                  </div>
                )}

                {hall.times.map((t, i) => {
                  const p = hall.perTimePrices?.[i] || {};
                  return (
                    <div
                      key={i}
                      className="time-item"
                      style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
                    >
                      {/* time */}
                      <span style={{ minWidth: 64 }}>{t}</span>

                      {/* remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(hall.hallName, i)}
                        title="Remove this showtime"
                        aria-label={`Remove showtime ${t}`}
                        style={{ width: 24 }}
                      >
                        ×
                      </button>

                      {/* per-time inputs */}
                      {hall.perTime && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="form-control"
                            placeholder="Gold"
                            title="Gold ticket price"
                            aria-label={`Gold price for ${t}`}
                            value={p.RoyalTicketPrice ?? ""}
                            onChange={e => handlePerTimePrice(idx, i, "RoyalTicketPrice", e.target.value)}
                            style={{ width: 90 }}
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="form-control"
                            placeholder="Silver"
                            title="Silver ticket price"
                            aria-label={`Silver price for ${t}`}
                            value={p.ExecutiveTicketPrice ?? ""}
                            onChange={e => handlePerTimePrice(idx, i, "ExecutiveTicketPrice", e.target.value)}
                            style={{ width: 90 }}
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="form-control"
                            placeholder="Platinum"
                            title="Platinum ticket price"
                            aria-label={`Platinum price for ${t}`}
                            value={p.ExecutiveTicketPrice ?? ""}
                            onChange={e => handlePerTimePrice(idx, i, "ExecutiveTicketPrice", e.target.value)}
                            style={{ width: 90 }}
                            required
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Hall-level prices (hidden in per-time mode) */}
              {!hall.perTime && (
                <>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Recliner (Gold)"
                    value={hall.RoyalTicketPrice}
                    onChange={e => handleHallField(idx, "RoyalTicketPrice", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Royal (Silver)"
                    value={hall.ExecutiveTicketPrice}
                    onChange={e => handleHallField(idx, "ExecutiveTicketPrice", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Club (Platinum)"
                    value={hall.ExecutiveTicketPrice}
                    onChange={e => handleHallField(idx, "ExecutiveTicketPrice", e.target.value)}
                    required
                  />
                </>
              )}
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

        {/* Quick read-only recap */}
        <div className="mb-3" style={{ marginTop: 16 }}>
          <h4 style={{ margin: 0 }}>{MovieName}</h4>
          {halls.map((h, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <strong>{h.hallName}</strong>{" "}
              <span style={{ fontSize: 12, opacity: 0.75 }}>
                {h.perTime ? "per-showtime pricing" : "same price for all times"}
              </span>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

export default Editshow;
