// src/Admin/Editmovie.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Editmovie.css";

function Editmovie() {
  const [movieName, setMovieName] = useState("");
  const [image, setImage] = useState("");               // Poster URL
  const [movieGenre, setMovieGenre] = useState("");
  const [movieLanguage, setMovieLanguage] = useState("");
  const [movieDuration, setMovieDuration] = useState("");
  const [movieCensor, setMovieCensor] = useState("");     // Censor rating
  const [castMembers, setCastMembers] = useState([{ name: "", image: "" }]);
  const [crewMembers, setCrewMembers] = useState([{ name: "", role: "", image: "" }]);
  const [movieDescription, setMovieDescription] = useState("");
  const [movieReleasedate, setMovieReleasedate] = useState("");
  const [trailerLink, setTrailerLink] = useState("");
  const [movieFormat, setMovieFormat] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Load from localStorage
    setMovieName(localStorage.getItem("moviename") || "");
    setImage(localStorage.getItem("movieimage") || "");
    setMovieGenre(localStorage.getItem("moviegenre") || "");
    setMovieLanguage(localStorage.getItem("movielanguage") || "");
    setMovieDuration(localStorage.getItem("movieduration") || "");
    setMovieCensor(localStorage.getItem("moviecensor") || "");  // load censor
    setMovieDescription(localStorage.getItem("moviedescription") || "");
    setMovieReleasedate(localStorage.getItem("moviereleasedate") || "");
    setTrailerLink(localStorage.getItem("movietrailer") || "");
    setMovieFormat(localStorage.getItem("movieformat") || "");
    setId(localStorage.getItem("id") || "");

    // Cast
    const storedCast = localStorage.getItem("moviecast") || "[]";
    try {
      const arr = JSON.parse(storedCast);
      setCastMembers(Array.isArray(arr) && arr.length ? arr : [{ name: "", image: "" }]);
    } catch {
      setCastMembers([{ name: "", image: "" }]);
    }

    // Crew
    const storedCrew = localStorage.getItem("moviecrew") || "[]";
    try {
      const arr = JSON.parse(storedCrew);
      setCrewMembers(
        Array.isArray(arr) && arr.length
          ? arr
          : [{ name: "", role: "", image: "" }]
      );
    } catch {
      setCrewMembers([{ name: "", role: "", image: "" }]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/movieview/update/${id}`, {
        movieName,
        image,
        movieGenre,
        movieLanguage,
        movieDuration,
        movieCensor,            // include censor
        movieCast: castMembers,
        movieCrew: crewMembers,
        movieDescription,
        movieReleasedate,
        trailerLink,
        movieFormat,
      });
      navigate("/movieview");
    } catch (err) {
      console.error("Error updating movie:", err);
    }
  };

  return (
    <div className="edit-body-movie-div">
      <form className="edit-form" onSubmit={handleSubmit}>
        {/* Movie Name */}
        <div className="mb-3">
          <label>Movie Name</label>
          <input
            type="text"
            className="form-control"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            required
          />
        </div>

        {/* Poster URL */}
        <div className="mb-3">
          <label>Poster URL</label>
          <input
            type="text"
            className="form-control"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
          {image && <img src={image} alt="Poster" width="100" />}
        </div>

        {/* Genre */}
        <div className="mb-3">
          <label>Genre</label>
          <input
            type="text"
            className="form-control"
            value={movieGenre}
            onChange={(e) => setMovieGenre(e.target.value)}
            required
          />
        </div>

        {/* Language */}
        <div className="mb-3">
          <label>Language</label>
          <input
            type="text"
            className="form-control"
            value={movieLanguage}
            onChange={(e) => setMovieLanguage(e.target.value)}
            required
          />
        </div>

        {/* Duration */}
        <div className="mb-3">
          <label>Duration</label>
          <input
            type="text"
            className="form-control"
            value={movieDuration}
            onChange={(e) => setMovieDuration(e.target.value)}
            required
          />
        </div>

        {/* Censor Rating */}
        <div className="mb-3">
          <label>Censor Rating</label>
          <input
            type="text"
            className="form-control"
            value={movieCensor}
            onChange={(e) => setMovieCensor(e.target.value)}
            required
          />
        </div>

        {/* Cast Members */}
        <div className="mb-3">
          <label>Cast Members</label>
          {castMembers.map((c, i) => (
            <div key={i} className="cast-edit-row">
              <input
                type="text"
                placeholder="Name"
                value={c.name}
                onChange={(e) => {
                  const arr = [...castMembers];
                  arr[i].name = e.target.value;
                  setCastMembers(arr);
                }}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={c.image}
                onChange={(e) => {
                  const arr = [...castMembers];
                  arr[i].image = e.target.value;
                  setCastMembers(arr);
                }}
              />
              {c.image && <img src={c.image} alt="Cast" width="80" />}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setCastMembers([...castMembers, { name: "", image: "" }])
            }
          >
            Add Cast Member
          </button>
        </div>

        {/* Crew Members */}
        <div className="mb-3">
          <label>Crew Members</label>
          {crewMembers.map((c, i) => (
            <div key={i} className="cast-edit-row">
              <input
                type="text"
                placeholder="Name"
                value={c.name}
                onChange={(e) => {
                  const arr = [...crewMembers];
                  arr[i].name = e.target.value;
                  setCrewMembers(arr);
                }}
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={c.role}
                onChange={(e) => {
                  const arr = [...crewMembers];
                  arr[i].role = e.target.value;
                  setCrewMembers(arr);
                }}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={c.image}
                onChange={(e) => {
                  const arr = [...crewMembers];
                  arr[i].image = e.target.value;
                  setCrewMembers(arr);
                }}
              />
              {c.image && <img src={c.image} alt="Crew" width="80" />}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setCrewMembers([
                ...crewMembers,
                { name: "", role: "", image: "" }
              ])
            }
          >
            Add Crew Member
          </button>
        </div>

        {/* Description */}
        <div className="mb-3">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={movieDescription}
            onChange={(e) => setMovieDescription(e.target.value)}
            required
          />
        </div>

        {/* Release Date */}
        <div className="mb-3">
          <label>Release Date</label>
          <input
            type="date"
            className="form-control"
            value={movieReleasedate}
            onChange={(e) => setMovieReleasedate(e.target.value)}
            required
          />
        </div>

        {/* Trailer Link */}
        <div className="mb-3">
          <label>Trailer Link (YouTube URL)</label>
          <input
            type="text"
            className="form-control"
            value={trailerLink}
            onChange={(e) => setTrailerLink(e.target.value)}
            required
          />
          {trailerLink && (
            <div style={{ marginTop: "0.5rem" }}>
              <a href={trailerLink} target="_blank" rel="noopener noreferrer">
                Preview Trailer
              </a>
            </div>
          )}
        </div>

        {/* Format */}
        <div className="mb-3">
          <label>Format</label>
          <input
            type="text"
            className="form-control"
            value={movieFormat}
            onChange={(e) => setMovieFormat(e.target.value)}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="Update_container">
          <button className="Updatebutton1" type="submit">
            Update
          </button>
        </div>
        <Link to="/movieview">
          <div className="Update_container">
            <button className="Homebutton1" type="button">
              Home
            </button>
          </div>
        </Link>
      </form>
    </div>
  );
}

export default Editmovie;