// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer = () => {
  const [data, setData] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/movieview");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const setID = (_id, movieName, movieGenre, movieLanguage, movieFormat) => {
    localStorage.setItem("id", _id);
    localStorage.setItem("moviename", movieName);
    localStorage.setItem("moviegenre", movieGenre);
    localStorage.setItem("movielanguage", movieLanguage);
    localStorage.setItem("movieformat", movieFormat);
  };

  const toggleLanguage = (lang) => {
    if (lang === "All") {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([lang]);
    }
  };

  const toggleGenre = (genre) => {
    if (genre === "All") {
      setSelectedGenre("All");
    } else {
      setSelectedGenre(genre);
    }
  };

  // Build unique lists
  const uniqueLanguages = [
    ...new Set(
      data.flatMap((movie) =>
        movie.movieLanguage
          .split(/[\/,]/)
          .map((lang) => lang.trim())
          .filter(Boolean)
      )
    ),
  ];

  const uniqueGenres = [
    ...new Set(
      data.flatMap((movie) =>
        movie.movieGenre.split(/[\/,]/).map((g) => g.trim()).filter(Boolean)
      )
    ),
  ];

  const uniqueMovies = data.reduce((acc, movie) => {
    if (!acc.find((m) => m.movieName === movie.movieName)) {
      acc.push(movie);
    }
    return acc;
  }, []);

  return (
    <footer className="bg-[#222] text-white pt-6 pb-8 max-lg:hidden">
      {/* ─── TicketFlix Header ─── */}
      <div className="flex items-center justify-center mb-8 px-4">
        <hr className=" border-gray-700 flex-grow" />
        <h1 className="mx-4 text-2xl font-bold">
          Ticket<span className="text-orange-500">Flix</span>
        </h1>
        <hr className="border-gray-700 flex-grow" />
      </div>

      {/* ─── Container to center & limit width ─── */}
      <div className="max-w-10xl mx-auto px-4 space-y-2">
        {/* ─── Movies by Language ─── */}
        <div>
          <h4 className="text-xl font-semibold mb-2">Movies by Language</h4>
          <ul className="flex flex-wrap text-gray-100 items-center text-xs mb-2.5 pl-1">
            {["All", ...uniqueLanguages].map((lang, idx, arr) => (
              <React.Fragment key={`lang-${lang}`}>
                <li
                  onClick={() => toggleLanguage(lang)}
                  className="m-1 whitespace-nowrap cursor-pointer hover:text-yellow-500"
                >
                  {lang}
                </li>
                {idx < arr.length - 1 && (
                  <span className="mx-1 text-gray-500 pointer-events-none">|</span>
                )}
              </React.Fragment>
            ))}
          </ul>
          <div className="border-t border-gray-700" />
        </div>

        {/* ─── Movies by Genre ─── */}
        <div>
          <h4 className="text-xl font-semibold mb-2">Movies by Genre</h4>
          <ul className="flex flex-wrap items-center text-xs mb-2.5 pl-1">
            {["All", ...uniqueGenres].map((genre, idx, arr) => (
              <React.Fragment key={`genre-${genre}`}>
                <li
                  onClick={() => toggleGenre(genre)}
                  className="m-1 whitespace-nowrap text-gray-100 cursor-pointer hover:text-yellow-500"
                >
                  {genre}
                </li>
                {idx < arr.length - 1 && (
                  <span className="mx-1 text-gray-500 pointer-events-none">|</span>
                )}
              </React.Fragment>
            ))}
          </ul>
          <div className="border-t border-gray-700" />
        </div>

        {/* ─── Movie Now Showing ─── */}
        <div>
          <h4 className="text-xl font-semibold mb-2">Movie Now Showing</h4>
          <ul className="flex flex-wrap items-center text-xs mb-3 pl-1">
            {uniqueMovies.map((movie, idx, arr) => (
              <React.Fragment key={movie._id}>
                <li className="m-1 whitespace-nowrap cursor-pointer">
                  <Link
                    to={`/moviedetails/${movie._id}`}
                    onClick={() =>
                      setID(
                        movie._id,
                        movie.movieName,
                        movie.movieGenre,
                        movie.movieLanguage,
                        movie.movieFormat
                      )
                    }
                    state={{
                      movieName: movie.movieName,
                      userEmail: localStorage.getItem("userEmail"),
                    }}
                    className="text-gray-100 hover:text-yellow-300 no-underline"
                  >
                    {movie.movieName}
                  </Link>
                </li>
                {idx < arr.length - 1 && (
                  <span className="mx-1 text-gray-500 pointer-events-none">|</span>
                )}
              </React.Fragment>
            ))}
          </ul>
          <div className="border-t border-gray-700" />
        </div>
      </div>

      {/* ─── Footer Bottom (Social Icons + Copyright) ─── */}
      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center space-x-5 text-2xl text-gray-200">
            <a
              href="https://www.facebook.com"
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fab fa-facebook-f" />
            </a>
            <a
              href="https://www.twitter.com"
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fab fa-twitter" />
            </a>
            <a
              href="https://www.instagram.com"
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fab fa-instagram" />
            </a>
            <a
              href="https://www.youtube.com/@TicketFlix-d6v"
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fab fa-youtube" />
            </a>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fa-solid fa-circle-user" />
            </button>
            <a
              href="https://www.linkedin.com"
              className="hover:text-yellow-500 transition-colors duration-200 text-gray-200"
            >
              <i className="fab fa-linkedin" />
            </a>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} TICKETFLIX. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500">
            The content and images on this site are protected by copyright and
            remain the property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;