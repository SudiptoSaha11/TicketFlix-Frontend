import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import api from "../../Utils/api";
import "./Showtime.css";


const Showtime = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState({}); // which schedule cards are expanded

  const fetchData = async () => {
    try {
      localStorage.removeItem("schedule");
      const res = await api.get(`/scheduleschema`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError("Couldn't load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const setForEdit = (doc) => localStorage.setItem("schedule", JSON.stringify(doc));

  const deleted = async (id) => {
    try {
      await api.delete(`/Scheduleschema/delete/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const formatTime = (t) => {
    const s = typeof t === "string" ? t : t?.at;
    if (!s) return "";
    const [hh = "", mm = "00"] = s.split(":");
    let h = parseInt(hh, 10);
    if (Number.isNaN(h)) return s;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mm} ${ampm}`;
  };

  const PricePill = ({ label, value }) => (
    <div style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", display: "inline-block", marginRight: 6 }}>
      <strong>{label}</strong> ₹{value ?? "—"}
    </div>
  );

  const TimeChip = ({ t }) => (
    <div style={{
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 12,
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontWeight: 600 }}>{formatTime(t)}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <PricePill label="Gold" value={t.RoyalTicketPrice} />
        <PricePill label="Silver" value={t.ExecutiveTicketPrice} />
        <PricePill label="Platinum" value={t.ExecutiveTicketPrice} />
      </div>
    </div>
  );

  const HallCard = ({ hall }) => (
    <div style={{
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      background: "rgba(255,255,255,0.75)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{hall.hallName}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12 }}>
        {(hall.time || []).map((t, i) => (
          <TimeChip key={i} t={typeof t === "string" ? { at: t } : t} />
        ))}
      </div>
    </div>
  );

  const ScheduleCard = ({ doc }) => (
    <div style={{
      borderRadius: 24,
      padding: 16,
      marginBottom: 20,
      background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,247,255,0.85))",
      boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{doc.Movie?.movieName || doc.MovieName || "(Untitled)"}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Shows • {doc.shows?.length || 0} hall(s)</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/editshow">
            <button className="update" onClick={() => setForEdit(doc)}>Update</button>
          </Link>
          <button className="delete" onClick={() => deleted(doc._id)}>Delete</button>
          <button className="toggle" onClick={() => toggle(doc._id)}>
            {open[doc._id] ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      {open[doc._id] && (
        <div style={{ marginTop: 12 }}>
          {(doc.shows || []).map((h, i) => (
            <HallCard hall={h} key={i} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="showtimepage">
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Schedules</h2>
          <Link to="/Addshow">
            <button className="Addbutton">Add Show Time</button>
          </Link>
        </div>

        {loading && <div className="loading">Loading…</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && data.length === 0 && (
          <div className="empty">No schedules found.</div>
        )}

        {!loading && !error && data.map((doc) => <ScheduleCard key={doc._id} doc={doc} />)}
      </div>
    </div>
  );
};

export default Showtime;
