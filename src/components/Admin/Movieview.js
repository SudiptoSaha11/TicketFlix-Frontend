import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "../Admin/Movieview.css";
import { Link } from "react-router-dom";

const Movieview = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      localStorage.setItem("id", "");
      localStorage.setItem("Movie Name", "");
      localStorage.setItem("movie Genre", "");
      localStorage.setItem("movie Language", "");
      localStorage.setItem("movie Duration", "");
      localStorage.setItem("movie Cast", "");
      localStorage.setItem("movie Description", "");
      localStorage.setItem("movie Releasedate", "");
      localStorage.setItem("movie Trailer", "");
      localStorage.setItem("movie Format", "");
      localStorage.setItem("moviereviews", "");

      const response = await axios.get("http://localhost:5000/movieview");
      setData(response.data);
      console.log("Fetched movies:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function setID(
    _id,
    movieName,
    movieGenre,
    movieLanguage,
    movieDuration,
    movieCast,
    movieDescription,
    movieReleasedate,
    trailerLink,
    movieFormat,
    reviews
  ) {
    console.log("Selected movie ID:", _id);
    localStorage.setItem("id", _id);
    localStorage.setItem("moviename", movieName);
    localStorage.setItem("moviegenre", movieGenre);
    localStorage.setItem("movielanguage", movieLanguage);
    localStorage.setItem("movieduration", movieDuration);
    localStorage.setItem("moviecast", JSON.stringify(movieCast));
    localStorage.setItem("moviedescription", movieDescription);
    localStorage.setItem("moviereleasedate", movieReleasedate);
    localStorage.setItem("movietrailer", trailerLink);
    localStorage.setItem("movieformat", movieFormat);
    localStorage.setItem("moviereviews", JSON.stringify(reviews));
  }

  async function deleted(id) {
    try {
      const response = await axios.delete(`http://localhost:5000/movieview/delete/${id}`);
      console.log("Delete response:", response);
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
    fetchData();
  }

  return (
    <div className="movieview">
      <Navbar />
      <div className="movieview-table-container">
        <table className="movieview-table1_">
          <thead>
            <tr>
              <th>Movie Poster</th>
              <th>Movie Name</th>
              <th>Movie Genre</th>
              <th>Movie Language</th>
              <th>Movie Duration</th>
              <th>Movie Cast</th>
              <th>Movie Description</th>
              <th>Movie Releasedate</th>
              <th>Movie Trailer</th>
              <th>Movie Format</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    className="movieview-poster"
                    src={item.image}
                    alt={item.movieName}
                  />
                </td>
                <td>{item.movieName}</td>
                <td>{item.movieGenre}</td>
                <td>{item.movieLanguage}</td>
                <td>{item.movieDuration}</td>
                <td>
                  {item.movieCast &&
                    item.movieCast.map((cast, index) => (
                      <div key={index} className="movieview-cast-container-admin">
                        <img
                          className="movieview-cast-image-admin"
                          src={cast.image}
                          alt={cast.name}
                        />
                        <div>{cast.name}</div>
                      </div>
                    ))}
                </td>
                <td>{item.movieDescription}</td>
                <td>{item.movieReleasedate}</td>
                <td>{item.trailerLink}</td>
                <td>{item.movieFormat}</td>
                <td>
                  <Link to="/editmovie" style={{ textDecoration: "none" }}>
                    <button
                      className="movieview-update"
                      onClick={() =>
                        setID(
                          item._id,
                          item.movieName,
                          item.movieGenre,
                          item.movieLanguage,
                          item.movieDuration,
                          item.movieCast,
                          item.movieDescription,
                          item.movieReleasedate,
                          item.trailerLink,
                          item.movieFormat,
                          item.reviews
                        )
                      }
                    >
                      Update
                    </button>
                  </Link>
                </td>
                <td>
                  <button className="movieview-delete" onClick={() => deleted(item._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="movieview-Add-button-container">
        <Link to="/movie" style={{ textDecoration: "none" }}>
          <button className="movieview-Addbutton">Add Movie</button>
        </Link>
      </div>
    </div>
  );
};

export default Movieview;
