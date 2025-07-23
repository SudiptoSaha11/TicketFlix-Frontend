import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "../Admin/Movieview.css";
import { Link, useNavigate } from "react-router-dom";

// Keys for localStorage transfer when editing
const DETAIL_KEYS = [
  "id",
  "moviename",
  "moviegenre",
  "movielanguage",
  "movieduration",
  "moviecensor",       // new key
  "moviecast",
  "moviecrew",
  "moviedescription",
  "moviereleasedate",
  "movietrailer",
  "movieformat",
  "movieimage",
  "moviereviews",
];

const Movieview = () => {
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get("https://ticketflix-backend.onrender.com/movieview");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  useEffect(() => {
    fetchData();

    if (!localStorage.getItem("isPopupShown")) {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        localStorage.setItem("isPopupShown", "true");
      }, 3000);
    }
  }, []);

  const handleEditPrep = (m) => {
    DETAIL_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("id", m._id);
    localStorage.setItem("moviename", m.movieName);
    localStorage.setItem("moviegenre", m.movieGenre);
    localStorage.setItem("movielanguage", m.movieLanguage);
    localStorage.setItem("movieduration", m.movieDuration);
    localStorage.setItem("moviecensor", m.movieCensor);           // new
    localStorage.setItem("moviecast", JSON.stringify(m.movieCast));
    localStorage.setItem("moviecrew", JSON.stringify(m.movieCrew));
    localStorage.setItem("moviedescription", m.movieDescription);
    localStorage.setItem("moviereleasedate", m.movieReleasedate);
    localStorage.setItem("movietrailer", m.trailerLink);
    localStorage.setItem("movieformat", m.movieFormat);
    localStorage.setItem("movieimage", m.image);
    localStorage.setItem("moviereviews", JSON.stringify(m.reviews || []));
    navigate("/editmovie");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ticketflix-backend.onrender.com/movieview/delete/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  return (
    <div className="movieview">
      <Navbar />

      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2>Welcome back, Admin!</h2>
            <button
              onClick={() => setShowPopup(false)}
              className="close-popup-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table1">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Name</th>
              <th>Genre</th>
              <th>Language</th>
              <th>Duration</th>
              <th>Censor</th>
              <th>Cast</th>
              <th>Crew</th>
              <th>Description</th>
              <th>Release Date</th>
              <th>Trailer</th>
              <th>Format</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m._id}>
                <td>
                  <img
                    className="table-imagesize"
                    src={m.image}
                    alt={m.movieName}
                  />
                </td>
                <td>{m.movieName}</td>
                <td>{m.movieGenre}</td>
                <td>{m.movieLanguage}</td>
                <td>{m.movieDuration}</td>
                <td>{m.movieCensor}</td>
                <td>
                  {m.movieCast?.map((c, i) => (
                    <div key={i} className="cast-container-admin">
                      <img
                        className="cast-image-admin"
                        src={c.image}
                        alt={c.name}
                      />
                      <div>{c.name}</div>
                    </div>
                  ))}
                </td>
                <td>
                  {m.movieCrew?.map((c, i) => (
                    <div key={i} className="cast-container-admin">
                      <img
                        className="cast-image-admin"
                        src={c.image}
                        alt={`${c.name} (${c.role})`}
                      />
                      <div>
                        <strong>{c.name}</strong>
                        <div className="crew-role">{c.role}</div>
                      </div>
                    </div>
                  ))}
                </td>
                <td>{m.movieDescription}</td>
                <td>{new Date(m.movieReleasedate).toLocaleDateString()}</td>
                <td>
                  <a
                    href={m.trailerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trailer
                  </a>
                </td>
                <td>{m.movieFormat}</td>
                <td>
                  <button
                    className="update"
                    onClick={() => handleEditPrep(m)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={() => handleDelete(m._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="Add_button_container">
        <Link to="/movie">
          <button className="Addbutton">Add Movie</button>
        </Link>
      </div>
    </div>
  );
};

export default Movieview;