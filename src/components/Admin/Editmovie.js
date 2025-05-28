import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../Admin/Editmovie.css';

function Editmovie() {
  // State variables for movie details, including movieFormat
  const [movieName, SetmovieName] = useState('');
  const [movieGenre, SetmovieGenre] = useState('');
  const [movieLanguage, SetmovieLanguage] = useState('');
  const [movieDuration, SetmovieDuration] = useState('');
  const [movieCast, SetmovieCast] = useState(''); // Will hold a JSON string initially
  const [movieDescription, SetmovieDescription] = useState('');
  const [movieReleasedate, SetmovieReleasedate] = useState('');
  const [movieFormat, SetmovieFormat] = useState(''); // New state for movie format
  const [id, setid] = useState('');

  const navigate = useNavigate();

  const handelSubmit = async (event) => {
    event.preventDefault();

    // Ensure movieCast is sent as an array (parse it if it's a JSON string)
    let parsedMovieCast = movieCast;
    if (typeof movieCast === "string") {
      try {
        parsedMovieCast = JSON.parse(movieCast);
      } catch (e) {
        console.error("Failed to parse movieCast:", e);
        // Optionally, you can set a default or show an error message here.
      }
    }

    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/movieview/update/${id}`, {
        movieName,
        movieGenre,
        movieLanguage,
        movieDuration,
        movieCast: parsedMovieCast, // Send as an array of objects
        movieDescription,
        movieReleasedate,
        movieFormat, // Include movieFormat in the update payload
      });
      navigate("/movieview");
    } catch (err) {
      console.log("Error during update:");
      if (err.response && err.response.data) {
        console.log("Data:", err.response.data.message);
        console.log("Status:", err.response.data.status);
      } else {
        console.log("Error:", err.message);
      }
    }
  };

  // Load stored values (including movieFormat) from localStorage on component mount
  useEffect(() => {
    SetmovieName(localStorage.getItem("moviename") || '');
    SetmovieGenre(localStorage.getItem("moviegenre") || '');
    SetmovieLanguage(localStorage.getItem("movielanguage") || '');
    SetmovieDuration(localStorage.getItem("movieduration") || '');
    // Get the movieCast stored as a JSON string; if missing, use an empty array string
    const storedMovieCast = localStorage.getItem("moviecast") || '[]';
    SetmovieCast(storedMovieCast);
    SetmovieDescription(localStorage.getItem("moviedescription") || '');
    SetmovieReleasedate(localStorage.getItem("moviereleasedate") || '');
    SetmovieFormat(localStorage.getItem("movieformat") || '');
    setid(localStorage.getItem("id") || '');
  }, []);

  return (
    <body className="edit-body-movie-div">
      <div>
        <form style={{ margin: "5rem" }} onSubmit={handelSubmit}>
          <div className="mb-3">
            <label>Enter Movie Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Movie Name"
              value={movieName}
              onChange={(e) => SetmovieName(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="mb-3">
            <label>Enter Movie Genre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Movie Genre"
              value={movieGenre}
              onChange={(e) => SetmovieGenre(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="mb-3">
            <label>Enter Language</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Language"
              value={movieLanguage}
              onChange={(e) => SetmovieLanguage(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="mb-3">
            <label>Enter Duration</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Duration"
              value={movieDuration}
              onChange={(e) => SetmovieDuration(e.target.value)}
              required
            />
            <br />
          </div>

          {/* For simplicity, the cast is shown as a JSON string.  
              In a production app, consider a more user-friendly cast editor. */}
          <div className="mb-3">
            <label>Enter Cast (JSON Format)</label>
            <input
              type="text"
              className="form-control"
              placeholder='e.g. [{"name":"John Doe", "image":"poster.jpg"}]'
              value={movieCast}
              onChange={(e) => SetmovieCast(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="mb-3">
            <label>Enter Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Description"
              value={movieDescription}
              onChange={(e) => SetmovieDescription(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="mb-3">
            <label>Enter Releasedate</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Releasedate"
              value={movieReleasedate}
              onChange={(e) => SetmovieReleasedate(e.target.value)}
              required
            />
            <br />
          </div>

          {/* New input field for movie format */}
          <div className="mb-3">
            <label>Enter Movie Format</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Movie Format"
              value={movieFormat}
              onChange={(e) => SetmovieFormat(e.target.value)}
              required
            />
            <br />
          </div>

          <div className="Update_container">
            <button className="Updatebutton1" type="submit">
              Update
            </button>
          </div>
          <br />
          <Link style={{ textDecoration: "none" }} to="/movieview">
            <div className="Update_container">
              <button className="Homebutton1" type="button">
                Home
              </button>
            </div>
          </Link>
        </form>
      </div>
    </body>
  );
}

export default Editmovie;
