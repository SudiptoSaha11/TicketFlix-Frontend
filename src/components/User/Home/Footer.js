import React, {useState, useEffect} from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../Home/Footer.css'; 
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {

  const [data, setData] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://ticketflix-backend.onrender.com/movieview');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const uniqueLanguages = [...new Set(data.flatMap(movie =>movie.movieLanguage.split(/[\/,]/).map(lang => lang.trim())))];

  const uniqueGenres = [...new Set(data.flatMap(movie =>movie.movieGenre.split(/[\/,]/).map(genre => genre.trim())))];

  const uniqueMovies = data.reduce((acc, movie) => {
    if (!acc.find(m => m.movieName === movie.movieName)) {
      acc.push(movie);
    }
    return acc;
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://ticketflix-backend.onrender.com/movieview');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleGenre = (genre) => {
    if (genre === "All") {
      setSelectedGenre("All");
    } else {
      setSelectedGenre(genre);
    }
  };


  return (
    
    <footer className="footer big-footer">
        <div className="footer-top">
          {/* Movies by Language */}
          <div className="footer-section">
            <h4>Movies by Language</h4>
            <ul>
              {["All", ...uniqueLanguages].map((lang, index, arr) => (
                <React.Fragment key={lang}>
                  <li
                    onClick={() => toggleLanguage(lang)}
                    style={{ cursor: 'pointer' }}
                  >
                    {lang}
                  </li>
                  {/* Only show the separator if it's NOT the last item */}
                  {index < arr.length - 1 && (
                    <span
                      style={{
                        margin: "0 4px",
                        pointerEvents: "none" // ensures "|" is not clickable
                      }}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* Movies by Genre */}
          <div className="footer-section">
            <h4>Movies by Genre</h4>
            <ul>
              {["All", ...uniqueGenres].map((genre, index, arr) => (
                <React.Fragment key={genre}>
                  <li
                    onClick={() => toggleGenre(genre)}
                    style={{ cursor: 'pointer' }}
                  >
                    {genre}
                  </li>
                  {index < arr.length - 1 && (
                    <span style={{ margin: "0 4px", pointerEvents: "none" }}>
                      |
                    </span>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* Movies Now Showing */}
          <div className="footer-section">
            <h4>Movie Now Showing</h4>
            <ul>
              {uniqueMovies.map((movie, index, arr) => (
                <React.Fragment key={movie._id}>
                  <li>
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
                        userEmail: localStorage.getItem("userEmail")
                      }}
                    >
                      {movie.movieName}
                    </Link>
                  </li>
                  {index < arr.length - 1 && (
                    <span
                      style={{
                        margin: "0 4px",
                        pointerEvents: "none"
                      }}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-icons">
            <a href="https://www.facebook.com">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="https://www.twitter.com">
              <i className="fab fa-twitter" />
            </a>
            <a href="https://www.instagram.com">
              <i className="fab fa-instagram" />
            </a>
            <a href="https://www.youtube.com/@TicketFlix-d6v">
              <i className="fab fa-youtube" />
            </a>
            <a
              href="/Admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login'); 
              }}
            >
              <i className="fa-solid fa-circle-user" />
            </a>
            <a href="https://www.linkedin.com">
              <i className="fab fa-linkedin" />
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} TICKETFLIX. All Rights Reserved.</p>
          <p>
            The content and images on this site are protected by copyright 
            and remain the property of their respective owners.
          </p>
        </div>
      </footer>
  );
};

export default Footer;
