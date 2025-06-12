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
      <div className="pt-[90px] px-[10px] flex flex-col items-center mb-[10px] 
      2xl:pt-[90px] 2xl:px-[20px] 2xl:flex 2xl:flex-col 2xl:items-center 2xl:mb-[30px]">
        <div className="font-sans text-[#444441] mb-[10px]
        2xl:font-sans 2xl:text-[#444441] 2xl:mb-[20px]"><h2>Movies</h2></div>

        <div className="flex flex-wrap justify-center gap-2 mb-6
        2xl:flex 2xl:flex-wrap 2xl:justify-center 2xl:gap-2 2xl:mb-6">
          <button className={`px-3 py-2 rounded-full      2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.length === 0 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => toggleLanguage("All")}>All</button>
          {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map(lang => (
            <button key={lang} className={`px-3 py-2 rounded-full    2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.includes(lang) ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => toggleLanguage(lang)}>{lang}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[35px] 2xl:gap-[70px]">
          {filteredMovies.map(movie => (
            <Link
              to={`/moviedetails/${movie._id}`}
              key={movie._id}
              state={movie}
              className="text-current no-underline"
              onClick={() => localStorage.setItem("id", movie._id)}
            >
              <div className="w-[150px] h-[280px] rounded-[8px] mb-[-30px] overflow-hidden cursor-pointer text-center flex flex-col justify-start transition-transform transition-shadow duration-300 ease hover:-translate-y-[5px] 
              2xl:w-[220px] 2xl:h-[425px] ">
                <img src={movie.image} alt={movie.movieName} className="w-full h-[200px] object-cover
                                                                        2xl:w-full 2xl:h-[320px]" />
                <h3 className="mt-[5px] mb-[10px] text-[1rem] font-bold text-left hover:text-black-900 ">{movie.movieName}</h3>
                
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MoviePage;
