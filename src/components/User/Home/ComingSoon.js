import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link,useNavigate } from "react-router-dom";
import Usernavbar from "../Home/Usernavbar";
import BottomNav from "./BottomNav";

const ComingSoon = () => {
  const [movies, setMovies] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://ticketflix-backend.onrender.com/movieview")
      .then((res) => setMovies(res.data))
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  const toggleLanguage = (lang) => {
    if (lang === "All") {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([lang]);
    }
  };

  const filteredMovies = movies
    .filter((movie) => {
      // Only include movies releasing more than 20 days from today
      const today = new Date();
      const releaseDate = new Date(movie.movieReleasedate);
      const diffDays = (releaseDate - today) / (1000 * 60 * 60 * 24);
      return diffDays > 2;
    })
    .filter((movie) => {
      const languages = movie.movieLanguage
        .split(/[\/,]/)
        .map((l) => l.trim().toLowerCase());

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.some((sel) => languages.includes(sel.toLowerCase()));

      const matchesSearch =
        movie.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.movieGenre.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesLanguage && matchesSearch;
    });

  return (
    <>
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="pt-[90px] px-[10px] flex flex-col items-center mb-[100px] 
        2xl:pt-[90px] 2xl:px-[20px] 2xl:flex 2xl:flex-col 2xl:items-center 2xl:mb-[30px]">
       <div className="font-sans text-[#444441] mb-[10px]
          2xl:font-sans 2xl:text-[#444441] 2xl:mb-[20px]"><h2>Coming Soon</h2></div>


        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            className={`px-[10px] py-1 text-sm rounded-xl 2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.length === 0 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => toggleLanguage("All")}
          >
            All
          </button>
          {["Hindi", "English", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali"].map((lang) => (
            <button
              key={lang}
              className={`px-2 py-1 text-sm rounded-xl 2xl:px-3 2xl:py-2 2xl:rounded-full ${selectedLanguages.includes(lang) ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => toggleLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
         <div className="mb-[16px] lg:mb-6 text-center py-2.5 bg-orange-600 text-white px-[2.8rem] lg:py-3 rounded-lg shadow-md">
          <button className="text-[15px]" onClick={()=>navigate('/moviepage')}>Now Showing In Cinemas Near You &gt;</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[35px] 2xl:gap-[70px]">
          {filteredMovies.map((movie) => (
            <Link
              to={`/moviedetails/${movie._id}`}
              key={movie._id}
              state={movie}
              className="w-[150px] h-[280px] rounded-[8px] mb-[-30px] overflow-hidden cursor-pointer text-center flex flex-col justify-start transition-transform duration-300 ease 2xl:w-[220px] 2xl:h-[425px] text-black no-underline"
              onClick={() => localStorage.setItem("id", movie._id)}
            >
              <img
                src={movie.image}
                alt={movie.movieName}
                className="w-full h-[200px] object-cover 2xl:h-[320px]"
              />
              <h3 className="mt-[5px] mb-[10px] text-[1rem] font-bold text-left px-2">
                {movie.movieName}
              </h3>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default ComingSoon;