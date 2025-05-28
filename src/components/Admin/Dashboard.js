import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "../Admin/Dashboard.css";

const Dashboard = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalMovies: 0,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load admin email & show popup once
  useEffect(() => {
    const email = localStorage.getItem("adminEmail") || "Admin";
    setAdminEmail(email);

    if (!localStorage.getItem("dashboardPopupShown")) {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        localStorage.setItem("dashboardPopupShown", "true");
      }, 3000);
    }
  }, []);

  // 2️⃣ Fetch users, stats & movies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes, moviesRes] = await Promise.all([
          axios.get("https://ticketflix-backend.onrender.com/users"),
          axios.get("https://ticketflix-backend.onrender.com/dashboard/stats"),
          axios.get("https://ticketflix-backend.onrender.com/movieview"),
        ]);

        // Ensure `users` is always an array
        const usersPayload = usersRes.data;
        setUsers(
          Array.isArray(usersPayload)
            ? usersPayload
            : usersPayload.users ?? []
        );

        setStats(statsRes.data);
        setMovies(moviesRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />

      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2>Welcome back, {adminEmail}!</h2>
            <button
              className="close-popup-btn"
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Movies</h3>
          <p>{stats.totalMovies}</p>
        </div>
      </div>

      {/* Users table */}
      <div className="table-container-1">
        <h2>All Users</h2>
        <div className="table-scroll-wrapper-1">
          <table className="dashboard-table-1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Joined On</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.usertype}</td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movies table */}
      <div className="table-container-2">
        <h2>Movies</h2>
        <div className="table-scroll-wrapper">
          <table className="dashboard-table-2">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Name</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id}>
                  <td>
                    <img
                      src={
                        m.image.startsWith("http")
                          ? m.image
                          : `https://ticketflix-backend.onrender.com/uploads/${m.image}`
                      }
                      alt={m.movieName}
                      style={{ width: 60, height: 60 }}
                    />
                  </td>
                  <td>{m.movieName}</td>
                  <td>{m.movieGenre}</td>
                  <td>{m.movieLanguage}</td>
                  <td>{m.movieDuration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;