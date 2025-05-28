import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./MoviePage.css";
import Usernavbar from "../Home/Usernavbar";

const MoviePage = () => {
  const [movies, setMovies] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("https://ticketflix-backend.onrender.com/movieview")
      .then(res => setMovies(res.data))
      .catch(err => console.error("Error fetching movies:", err));
  }, []);

  const toggleLanguage = (lang) => {
    if (lang === "All") {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([lang]);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const languages = movie.movieLanguage
      .split(/[\/,]/)
      .map(l => l.trim().toLowerCase());

    const matchesLanguage =
      selectedLanguages.length === 0 ||
      selectedLanguages.some(sel => languages.includes(sel.toLowerCase()));

    const matchesSearch =
      movie.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.movieGenre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLanguage && matchesSearch;
  });

  return (
    <>
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="movie-page">
        <div className="main-movie-name"><h2>Movies</h2></div>

        <div className="language-buttons">
          <button className={`language-button ${selectedLanguages.length === 0 ? 'active' : ''}`} onClick={() => toggleLanguage("All")}>All</button>
          {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map(lang => (
            <button key={lang} className={`language-button ${selectedLanguages.includes(lang) ? 'active' : ''}`} onClick={() => toggleLanguage(lang)}>{lang}</button>
          ))}
        </div>

        <div className="movie-cards-container">
          {filteredMovies.map(movie => (
            <Link
              to={`/moviedetails/${movie._id}`}
              key={movie._id}
              state={movie}
              className="movie-card-link"
              onClick={() => localStorage.setItem("id", movie._id)}
            >
              <div className="movie-card">
                <img src={movie.image} alt={movie.movieName} className="movie-poster" />
                <h3 className="movie-title">{movie.movieName}</h3>
                <p className="movie-language">{movie.movieLanguage}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MoviePage;
