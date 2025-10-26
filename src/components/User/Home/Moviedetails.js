import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import { FaFilm, FaStar } from "react-icons/fa";
import Footer from "./Footer";
import LoadingSpinner from "../../UIElements/LoadingSpinner";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Card from "./Card";
import { FaTheaterMasks } from 'react-icons/fa';
import { Navigation, A11y } from "swiper/modules";
import api from "../../../Utils/api";


// Helper to extract the YouTube ID from any common YouTube URL
function getYouTubeID(url) {
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([^?&]+)/);
  if (watch) return watch[1];
  const embed = url.match(/embed\/([^?&]+)/);
  if (embed) return embed[1];
  return null;
}

function Moviedetails() {
  // Movie detail states
  const [movieImage, setMovieImage] = useState("");
  const [movieName, setMovieName] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieLanguage, setMovieLanguage] = useState("");
  const [movieFormat, setMovieFormat] = useState("");
  const [movieDuration, setMovieDuration] = useState("");
  const [movieCensor, setMovieCensor] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [movieCast, setMovieCast] = useState([]);
  const [movieCrew, setMovieCrew] = useState([]);
  const [trailerLink, setTrailerLink] = useState("");
  const [movieReleaseDate, setMovieReleaseDate] = useState("");
  const [id, setId] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);

  // Recommended movies
  const [recommended, setRecommended] = useState([]);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Carousel state for recommended
  const [recommendedCurrentSlide, setRecommendedCurrentSlide] = useState(0);

  // Popups
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review form fields
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewText, setReviewText] = useState("");

  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const location = useLocation();
  const reviewsSliderRef = useRef(null);
  const [arrowPosition, setArrowPosition] = useState("right");
  const {
    trailerLink: rawTrailerLink,
  } = useLocation().state || {};

  // Compute embedUrl (not used for mobile thumbnail) and thumbnail URL
  const videoId = rawTrailerLink ? getYouTubeID(rawTrailerLink) : null;
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";
  const [embedUrl, setEmbedUrl] = useState("");

  // Handle window resize for mobile/desktop layouts
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Fetch movie details by ID from server.
   * If reviews are empty, fallback to localStorage.
   */
  const fetchData = async (movieId) => {
    const localKey = "moviereviews_" + movieId;
    try {
      const response = await api.get(`/getmovieview/${movieId}`);
      const {
        movieName,
        movieGenre,
        movieLanguage,
        movieFormat,
        movieDuration,
        movieCensor,
        movieDescription,
        imageURL,
        movieCast,
        movieCrew,
        trailerLink,
        reviews: fetchedReviews,
        movieReleasedate,
      } = response.data;

      setMovieImage(imageURL);
      setMovieName(movieName);
      setMovieGenre(movieGenre);
      setMovieLanguage(movieLanguage);
      setMovieFormat(movieFormat);
      setMovieDuration(movieDuration);
      setMovieCensor(movieCensor);
      setMovieDescription(movieDescription);
      setMovieCast(movieCast || []);
      setMovieCrew(movieCrew || []);
      setTrailerLink(trailerLink || "");
      setMovieReleaseDate(movieReleasedate);

      if (fetchedReviews && fetchedReviews.length > 0) {
        setReviews(fetchedReviews);
        localStorage.setItem(localKey, JSON.stringify(fetchedReviews));
      } else {
        const storedReviews = localStorage.getItem(localKey);
        if (storedReviews) setReviews(JSON.parse(storedReviews));
        else setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
      const storedReviews = localStorage.getItem(localKey);
      if (storedReviews) setReviews(JSON.parse(storedReviews));
    }
  };

  // On mount, determine the movie ID and fetch data
  useEffect(() => {
    const movieId = paramId || localStorage.getItem("id");
    if (!movieId) {
      navigate("/");
      return;
    }
    setId(movieId);

    // populate from location state if available
    if (location.state) {
      if (location.state.movieName) setMovieName(location.state.movieName);
      if (location.state.movieGenre) setMovieGenre(location.state.movieGenre);
      if (location.state.movieLanguage) setMovieLanguage(location.state.movieLanguage);
      if (location.state.movieFormat) setMovieFormat(location.state.movieFormat);
      if (location.state.image) setMovieImage(location.state.image);
      if (location.state.trailerLink) setTrailerLink(location.state.trailerLink);
    }

    fetchData(movieId);
  }, [navigate, paramId, location.state]);

  useEffect(() => {
    setIsLoadingRec(true);
    api
      .get("/movieview")
      .then((res) => {
        const others = res.data.filter((m) => m._id !== (paramId || localStorage.getItem("id")));
        setRecommended(others.slice(0, 8));
      })
      .catch((err) => console.error("Error fetching recommended:", err))
      .finally(() => setIsLoadingRec(false));
  }, [paramId]);

  

  // Convert rawTrailerLink into an embed URL for desktop if needed
  useEffect(() => {
    if (!rawTrailerLink) return;
    let url = rawTrailerLink.trim();

    if (url.includes("youtu.be")) {
      url = url.split("?")[0].replace("https://youtu.be/", "https://www.youtube.com/embed/");
    } else if (url.includes("watch?v=")) {
      url = url.split("&")[0].replace("watch?v=", "embed/");
    }

    setEmbedUrl(url);
  }, [rawTrailerLink]);

  // Compute coming-soon logic
  const today = new Date();
  const release = movieReleaseDate ? new Date(movieReleaseDate) : null;
  const diffDays = release ? (release - today) / (1000 * 60 * 60 * 24) : -1;
  const isComingSoon = diffDays > 7;
  const formattedReleaseDate = release
    ? release.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  // Handlers
  const handlePosterClick = () => navigate("/multimedia", { state: { trailerLink, movieName } });
  const handleClick = () => setShowLanguagePopup(true);
  const closeLanguagePopup = () => setShowLanguagePopup(false);
  const handleLanguageSelect = (chosenLanguage) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    navigate("/movieShowtime", {
      state: { 
        movieId: id,               // 👈 add this
        movieName, 
        userEmail: storedEmail, 
        chosenLanguage,
        image: movieImage,         // optional, so you don't refetch poster
        movieCensor,               // optional, if you want certification later
      },
    });
    setShowLanguagePopup(false);
  };
  

  // Split languages
  const splittedLangs = movieLanguage
    ? movieLanguage.split(/[\/,]/).map((lang) => lang.trim())
    : [];

  // Reviews slider logic
  const handleScroll = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = reviewsSliderRef.current;
    if (scrollLeft <= 10) setArrowPosition("right");
    else if (scrollLeft + clientWidth >= scrollWidth - 10) setArrowPosition("left");
    else setArrowPosition("right");
  };
  const handleArrowClick = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollWidth, clientWidth } = reviewsSliderRef.current;
    reviewsSliderRef.current.scrollLeft = arrowPosition === "right" ? scrollWidth : 0;
  };

  // Review modal handlers
  const openReviewModal = () => setShowReviewModal(true);
  const closeReviewModal = () => setShowReviewModal(false);
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      alert("Please select a rating.");
      return;
    }
    try {
      const response = await api.post(
        `/movieview/review/${id}`,
        {
          rating: parseInt(reviewRating, 10),
          review: reviewText,
          user: reviewerName.trim() || "Anonymous",
        }
      );
      const localKey = "moviereviews_" + id;
      localStorage.setItem(localKey, JSON.stringify(response.data.reviews));
      setReviews(response.data.reviews);
      setReviewerName("");
      setReviewRating("");
      setReviewText("");
      closeReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  // Scroll the reviews row by one “card + gap” at a time
function scrollSlider(direction) {
  const slider = reviewsSliderRef.current;
  if (!slider) return;

  const card = slider.querySelector("li");
  const gap  = parseInt(getComputedStyle(slider).columnGap, 10) || 24;
  const step = card.getBoundingClientRect().width + gap;

  slider.scrollBy({ left: direction * step, behavior: "smooth" });
}


  // Carousel handlers for recommended (desktop)
  const cardsPerSlideRec = 4;
  const displayedRec = recommended.slice(0, cardsPerSlideRec * Math.ceil(recommended.length / cardsPerSlideRec));
  const recTotalSlides = Math.ceil(displayedRec.length / cardsPerSlideRec);
  const handlePrevRecSlide = () =>
    setRecommendedCurrentSlide((prev) => (prev > 0 ? prev - 1 : recTotalSlides - 1));
  const handleNextRecSlide = () =>
    setRecommendedCurrentSlide((prev) => (prev < recTotalSlides - 1 ? prev + 1 : 0));

  return (
    <div className="min-h-screen flex flex-col">
      <Usernavbar />

      {/* Movie Details Section */}
      <div
        className="
          flex flex-col justify-center items-center 
          bg-gradient-to-r from-[#f1f2b5] to-[#135058] text-[#17202a]
          p-4 mt-[70px] 
          lg:flex-row lg:items-start lg:justify-between lg:p-8 lg:mt-[70px]
        "
      >
        {/* 🌟 THUMBNAIL ON MOBILE (hidden at lg+) */}
        {thumbnailUrl && (
          <div className="block lg:hidden w-full max-w-md mb-4">
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              {/* Thumbnail Image */}
              <img
                src={thumbnailUrl}
                alt={`${movieName} trailer thumbnail`}
                className="absolute top-0 left-0 w-full h-full rounded-sm object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                }}
              />

              {/* Minimal Play Button */}
              <button
                onClick={() => navigate("/multimedia", { state: { trailerLink, movieName } })}
                className="
          absolute 
          top-[55%] left-1/2 
          transform -translate-x-1/2 -translate-y-1/2
          w-10 h-10 
          bg-white bg-opacity-50
          rounded-full 
          flex items-center justify-center
          hover:bg-opacity-90
          transition
        "
                aria-label="Play Trailer"
              >
                <svg
                  className="w-5 h-5 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 4l10 6-10 6V4z" />
                </svg>
              </button>
            </div>
          </div>
        )}


        {/* 🎬 POSTER ON DESKTOP (hidden below lg) */}
        {movieImage && (
          <div
            className="
              hidden lg:block
              w-3/4 max-w-[240px]
              lg:w-[200px] lg:order-2 lg:mr-[150px]
              xl:w-[200px] xl:order-2 xl:mr-[185px]
              antarikh:w-[200px] antarikh:order-2 antarikh:mr-[215px]
            "
          >
            <img
              src={movieImage}
              alt={movieName}
              className="w-full h-auto rounded-sm mx-auto lg:mx-0"
            />
          </div>
        )}

        <div
          className="
            w-full text-center
            lg:text-left lg:flex-1 lg:pr-8
            xl:text-left xl:flex-1 xl:pr-8
            2xl:mb-4 2xl:w-[70%] 2xl:ml-[10px]
            antarikh:text-left antarikh:flex-1 antarikh:pr-8
          "
        >
          <div
            className="
              flex flex-row justify-start mb-1 ml-[15px]
              lg:flex lg:flex-row lg:justify-start lg:mb-4 lg:ml-[154px]
              xl:mb-4 xl:w-[70%] xl:ml-[186px]
              
              antarikh:mb-4 antarikh:w-[70%] antarikh:ml-[215px]
            "
          >
            <h1
              className="
                max-lg:w-[full] text-start max-lg:text-2xl max-lg:font-bold font-bold  max-lg:mb-2
                lg:text-4xl xl:text-4xl antarikh:text-4xl
              "
            >
              {movieName}
            </h1>
          </div>

          <div className="flex flex-nowrap justify-start">
            <div
              className="
      w-full flex flex-col flex-nowrap gap-1.5 items-start pl-4 sm:justify-start
      lg:flex lg:flex-col lg:gap-1.5 lg:items-start lg:ml-[139px] lg:mb-4
      xl:flex xl:flex-col xl:gap-1.5 xl:items-start xl:ml-[172px]
      antarikh:flex antarikh:flex-col antarikh:gap-1.6 antarikh:items-start antarikh:ml-[200px]
    "
            >
              {/* Language */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="inline-block w-5 h-5 mr-1 align-middle"
                    viewBox="2 1 20 21"
                    fill="none">
                    <path d="M20.58 19.37L17.59 11.01C17.38 10.46 16.91 10.12 16.37 10.12C15.83 10.12 15.37 10.46 15.14 11.03L12.16 19.37C12.02 19.76 12.22 20.19 12.61 20.33C13 20.47 13.43 20.27 13.57 19.88L14.19 18.15H18.54L19.16 19.88C19.27 20.19 19.56 20.38 19.87 20.38C19.95 20.38 20.04 20.37 20.12 20.34C20.51 20.2 20.71 19.77 20.57 19.38L20.58 19.37ZM14.74 16.64L16.38 12.05L18.02 16.64H14.74ZM12.19 7.85C9.92999 11.42 7.89 13.58 5.41 15.02C5.29 15.09 5.16 15.12 5.04 15.12C4.78 15.12 4.53 14.99 4.39 14.75C4.18 14.39 4.3 13.93 4.66 13.73C6.75999 12.51 8.48 10.76 10.41 7.86H4.12C3.71 7.86 3.37 7.52 3.37 7.11C3.37 6.7 3.71 6.36 4.12 6.36H7.87V4.38C7.87 3.97 8.21 3.63 8.62 3.63C9.02999 3.63 9.37 3.97 9.37 4.38V6.36H13.12C13.53 6.36 13.87 6.7 13.87 7.11C13.87 7.52 13.53 7.86 13.12 7.86H12.18L12.19 7.85ZM12.23 15.12C12.1 15.12 11.97 15.09 11.85 15.02C11.2 14.64 10.57 14.22 9.97999 13.78C9.64999 13.53 9.58 13.06 9.83 12.73C10.08 12.4 10.55 12.33 10.88 12.58C11.42 12.99 12.01 13.37 12.61 13.72C12.97 13.93 13.09 14.39 12.88 14.75C12.74 14.99 12.49 15.12 12.23 15.12Z" fill="#000000" />
                  </svg>
                  <span className="text-base font-semibold xl:font-bold text-start">
                    {movieLanguage}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="inline-block w-5 h-5 align-middle "
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Ticket shape */}
                    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    {/* Censor hole */}
                    <circle cx="16" cy="12" r="2" />
                  </svg>
                  <span className="text-base font-semibold xl:font-bold text-start">{movieCensor}</span>
                </div>
              </div>

              {/* Genre */}
              <div className="flex items-center">
                <FaTheaterMasks className="inline-block w-5 h-5 mr-1 align-middle" />
                <span className="text-base font-semibold xl:font-bold text-start">
                  {movieGenre}
                </span>
              </div>

              {/* Format */}
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-5 h-5 mr-1 align-middle"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
                  <path d="M8 8h1v1H8zm0 2h1v1H8zm0 2h1v1H8zm0 2h1v1H8zm2-6h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1zm2-6h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1zm2-6h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1zm0 2h1v1h-1z" />
                </svg>
                <span className="text-base font-semibold xl:font-bold text-start">
                  {movieFormat}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-5 h-5 mr-1 align-middle"
                  viewBox="0 0 24 24"
                  fill="none">
                  <path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z" fill="#0F0F0F" />
                  <path d="M12 5C11.4477 5 11 5.44771 11 6V12.4667C11 12.4667 11 12.7274 11.1267 12.9235C11.2115 13.0898 11.3437 13.2343 11.5174 13.3346L16.1372 16.0019C16.6155 16.278 17.2271 16.1141 17.5032 15.6358C17.7793 15.1575 17.6155 14.5459 17.1372 14.2698L13 11.8812V6C13 5.44772 12.5523 5 12 5Z" fill="#0F0F0F" />
                </svg>
                <span className="text-base font-semibold xl:font-bold text-start">
                  {movieDuration}
                </span>
              </div>
            </div>
          </div>


          <div
            className="
              flex flex-col gap-3 sm:justify-start
              lg:flex lg:flex-col lg:gap-1.5 lg:items-start lg:ml-[139px]
              xl:flex xl:flex-col xl:gap-1.5 xl:items-start xl:ml-[172px]
              2xl:ml-[185px]
              antarikh:flex antarikh:flex-col antarikh:gap-1.6 antarikh:items-start antarikh:ml-[200px]
            "
          >
            <div className="flex flex-nowrap w-full max-md:hidden"><button
              onClick={handlePosterClick}
              className="
                mr-auto bg-[#135058] text-white px-4 py-3 ml-3 rounded-full text-base transition-transform duration-200 hover:scale-105 w-fit
                sm:ml-[11rem]
                lg:ml-0 lg:mr-0
                xl:ml-0 xl:mr-0
                antarikh:ml-3 antarikh:mr-0
              "
            >
              <FaFilm className="inline-block mb-1 mr-1" />
              Watch Trailer
            </button>
            </div>
            {isComingSoon ? (
              <button
                disabled
                className="ml-[11rem] text-black font-bold px-1 py-3 max-lg:hidden lg:inline-block lg:ml-0 cursor-default"
              >
                Releasing on {formattedReleaseDate}
              </button>
            ) : (
              <button
                onClick={handleClick}
                className="ml-[11rem] bg-[#135058] text-white px-4 py-3 rounded-full text-base transition-transform duration-200 hover:scale-105 max-lg:hidden lg:inline-block lg:ml-0 xl:inline-block xl:ml-0
                antarikh:inline-block antarikh:ml-3"
              >
                Book Tickets
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4 gap-[2rem] lg:mt-6 lg:gap-8 lg:hidden mx-4">
        <h3 className="mt-[5px] lg:mt-0 max-lg:text-xl">Review our movie</h3>
        <div><button
          onClick={openReviewModal}
          className="bg-[#fff] text-black border-[2px] border-pink-500 px-[1rem] py-2 rounded-full text-base transition-colors duration-300 lg:px-6 lg:py-3"
        >
          Rate Now
        </button></div>
      </div>

      {/* Movie Description */}
      <div
        className="
          px-4 mt-6 text-[#121920] leading-relaxed border-gray-300 pb-4 mb-8
          lg:px-40 lg:mt-10 lg:mb-12 lg:ml-[154px] lg:mr-[100px]
          xl:px-40 xl:mt-10 xl:mb-12 xl:ml-[188px] xl:mr-[150px]
          2xl:ml-[198px]
          antarikh:px-40 antarikh:mt-10 antarikh:mb-12 antarikh:ml-[220px] antarikh:mr-[200px]
        "
      >
        <h2 className="text-xl font-bold mb-2 lg:text-2xl lg:mb-4">About the movie</h2>
        <p className="text-base lg:text-lg">{movieDescription}</p>
      </div>

      {/* Ad Banner */}
      <div
        className="
          flex justify-center p-[10px] max-lg:mb-[1rem] mt-[-4rem]
          lg:mb-16 lg:mt-[-50px] lg:mx-[164px]
          xl:mb-16 xl:mt-[-50px] xl:mx-[200px]
          2xl:ml-[210px] 2xl:mr-[200px]
          antarikh:mb-16 antarikh:mt-[-50px] antarikh:mx-[235px]
        "
      >
        <a href="https://codehubsodepur.in/" rel="noopener noreferrer">
          <img src={require("./Codehub.png")} alt="ad-banner" />
        </a>
      </div>

      {/* Movie Cast */}
      <div
        className="
          xl:flex xl:flex-col xl:justify-start xl:items-start px-4 mb-8
          lg:px-40 lg:mb-12
          xl:px-40 xl:mb-12 xl:ml-[9rem]
          2xl:ml-[153px]
          antarikh:px-40 antarikh:mb-12 antarikh:ml-[11rem]
        "
      >
        <h2
          className="
            text-lg font-bold mb-4 lg:px-40 lg:mt-[-30px] lg:mb-12 lg:ml-[0px]
            xl:px-40 xl:mt-[-30px] xl:mb-12 xl:ml-[-115px]
          "
        >
          Cast
        </h2>

        {/* MOBILE SWIPER (shown < lg) */}
        {movieCast.length > 0 && (
          <div className="block lg:hidden">
            <Swiper slidesPerView={2.4} spaceBetween={30} freeMode={true}>
              {movieCast.map((actor, idx) => (
                <SwiperSlide key={idx} className="w-auto">
                  <div className="flex flex-col items-center">
                    <img
                      src={actor.image}
                      alt={actor.name}
                      className="w-[80px] h-[80px] rounded-full object-cover mb-2"
                    />
                    <div className="flex flex-wrap justify-center w-20">
                      <span className="block text-center text-sm font-medium">{actor.name}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* DESKTOP LIST (shown ≥ lg) */}
        {movieCast.length > 0 && (
          <ul className="hidden lg:flex flex-wrap justify-center gap-6">
            {movieCast.map((actor, idx) => (
              <li key={idx} className="flex flex-col items-center">
                <img
                  src={actor.image}
                  alt={actor.name}
                  className="w-[120px] h-[120px] rounded-full object-cover mb-2"
                />
                <div className="flex flex-wrap justify-center w-24">
                  <span className="text-center font-medium">{actor.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <hr className="max-lg:hidden my-8 border-gray-300 w-3/4 ml-[2.8rem]" />


        {/* EMPTY STATE */}
        {movieCast.length === 0 && <p className="text-center">No cast information available.</p>}
      </div>

      <div className="xl:flex xl:flex-col xl:justify-start xl:items-start px-4 mb-8
          lg:px-40 lg:mb-12
          xl:px-40 xl:mb-12 xl:ml-[9rem]
          2xl:ml-[153px]
          antarikh:px-40 antarikh:mb-12 antarikh:ml-[11rem]">

        <h2 className="text-lg font-bold mb-4 lg:px-40 lg:mt-[-30px] lg:mb-12 lg:ml-[0px]
            xl:px-40 xl:mt-[-30px] xl:mb-12 xl:ml-[-115px]">Crew</h2>
        {movieCrew.length > 0 ? (
          <ul className="hidden lg:flex flex-wrap justify-center gap-6">
            {movieCrew.map((member, idx) => (
              <li key={idx} className="flex flex-col items-center">
                <img
                  src={member.image}
                  alt={`${member.name} (${member.role})`}
                  className="w-[100px] h-[100px] rounded-full object-cover mb-2"
                />
                <div className="text-center font-medium"><span>{member.name}</span></div>
                <div className="text-center text-sm text-gray-600 pt-[5px]"><span>{member.role}</span></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center 2xl:ml-[33rem]">No crew information available.</p>
        )}


        {/* Mobile Swiper for Crew */}
        {movieCrew.length > 0 && isMobile && (
          <div className="block lg:hidden">
            <Swiper slidesPerView={2.4} spaceBetween={30} freeMode={true}>
              {movieCrew.map((member, idx) => (
                <SwiperSlide key={idx} className="w-auto">
                  <div className="flex flex-col items-center">
                    <img
                      src={member.image}
                      alt={`${member.name} (${member.role})`}
                      className="w-[80px] h-[80px] rounded-full object-cover mb-2"
                    />
                    <div className="flex flex-wrap justify-center w-20">
                      <span className="block text-center text-sm font-medium">{member.name}</span>
                      <span className="block text-center text-xs text-gray-600">{member.role}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        )}
      </div>

      {/* Movie Reviews */}
      {/* ======== Movie Reviews ======== */}
<div className="px-4 lg:mx-[155px] lg:mb-12 xl:mx-[185px] xl:mb-12 antarikh:mx-[220px] 2xl:ml-[195px] antarikh:mb-12">
  <h2 className="text-xl text-[#135058] font-bold mb-4 border-b-2 border-[#135058] pb-2 lg:text-2xl lg:mb-6">
    Reviews
  </h2>

  {reviews.length > 0 ? (
    <Swiper
      // register modules
      modules={[Navigation, A11y]}
      // number of cards visible at once
      slidesPerView={1}
      spaceBetween={24}
      // enable navigation arrows
      navigation
      // loop if you want infinite scroll
      loop={false}
      // responsive breakpoints
      breakpoints={{
        640: { slidesPerView: 1.2, spaceBetween: 24 },
        768: { slidesPerView: 2,   spaceBetween: 32 },
        1024:{ slidesPerView: 3,   spaceBetween: 32 },
        1280:{ slidesPerView: 3.5, spaceBetween: 40 },
      }}
      // accessibility props
      a11y={{ prevSlideMessage: "Previous reviews", nextSlideMessage: "Next reviews" }}
      className="py-4"
    >
      {reviews.map((item, idx) => (
        <SwiperSlide key={idx} className="snap-start">
          <div
            className="
              w-full
              bg-white rounded-2xl shadow-md p-6
              hover:-translate-y-1 hover:shadow-lg
              transition-transform duration-200
            "
          >
            <p className="font-semibold text-[#135058] mb-3 break-words whitespace-normal">
              {item.user || "Anonymous"} rated it{" "}
              <span className="inline-flex items-center text-yellow-500 font-semibold">
                {/* Using react-icon star */}
                <FaStar className="inline-block mr-1" />
                {item.rating}/10
              </span>
            </p>
            <p className="text-gray-700 leading-relaxed break-words whitespace-normal">
              {item.review}
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  ) : (
    <p className="text-center">No reviews available.</p>
  )}
</div>


      {/* Submit Review Button */}
      <div className="px-4 mb-8 lg:px-40 lg:mb-12">
        <button
          onClick={openReviewModal}
          className="w-full bg-[#135058] text-white py-3 rounded-full text-base transition-colors duration-300 hover:bg-[#0d3a40] hidden lg:block lg:w-fit lg:px-[15px] lg:ml-[157px] xl:block xl:w-fit xl:px-[15px] xl:ml-[185px] 2xl:ml-[195px] antarikh:block antarikh:w-fit antarikh:px-[15px] antarikh:ml-[215px]"
        >
          Submit Your Review
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] max-w-[90%] p-5 rounded-lg shadow-lg relative">
            <span onClick={closeReviewModal} className="absolute top-2 right-3 text-2xl cursor-pointer">
              &times;
            </span>
            <h2 className="text-xl font-bold mb-4">Submit Your Review</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label htmlFor="reviewerName" className="block mb-1">
                  Your Name
                </label>
                <input
                  id="reviewerName"
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center my-6">
                <FaStar className="text-pink-400 text-xl mr-2" />
                <div className="relative flex-1 mx-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value)}
                    className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer"
                  />
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 pointer-events-none">
                    SLIDE TO RATE →
                  </span>
                </div>
                <span className="min-w-[40px] text-right text-sm text-gray-700">{reviewRating}/10</span>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block mb-1">
                  Review
                </label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts about the movie"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <button type="submit" className="bg-gradient-to-br from-[#135058] to-[#135058] text-white py-2 px-5 rounded-full">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Language Popup */}
      {showLanguagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-sm w-[90%] text-center shadow relative">
            <span onClick={closeLanguagePopup} className="absolute top-3 right-4 text-xl cursor-pointer">
              &times;
            </span>
            <h2 className="text-xl font-bold mb-4">Select Language</h2>
            <div className="mt-4">
              {splittedLangs.map((lang, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLanguageSelect(lang)}
                  className="inline-block border-2 border-blue-500 rounded-full px-4 py-2 m-1 text-blue-500 transition-colors duration-200 hover:bg-blue-500 hover:text-white"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only fixed Book Tickets */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-2 shadow-lg z-50 lg:hidden">
        {isComingSoon ? (
          <button disabled className="w-full bg-[#135058] text-white py-3 rounded-full text-base transition-transform duration-200 hover:scale-105 opacity-50 cursor-default">
            Releasing on {formattedReleaseDate}
          </button>
        ) : (
          <button onClick={handleClick} className="w-full bg-[#135058] text-white py-3 rounded-full text-base transition-transform duration-200 hover:scale-105">
            Book Tickets
          </button>
        )}
      </div>

      {/* ============================= */}
      {/* Recommended Movies Section   */}
      {/* ============================= */}
      <div className="block p-[5px] text-center ml-[-90px] mb-[4rem]">
        <div className="flex justify-between items-center pr-[40px]">
          <h5
            className="
              flex justify-start ml-[7.5rem] text-[18px] font-500 mb-[-2px]
              sm:ml-[8.5rem] sm:text-[22px] sm:font-500 
              md:ml-[9.5rem] md:text-[22px] md:text-xl md:font-500
              lg:ml-[16rem] lg:text-[26px] lg:font-bold
              xl:ml-[18.7rem] xl:text-[28px] xl:py-[10px] xl:font-bold
              2xl:ml-[19.1rem]
              antarikh:ml-[20.8rem] antarikh:text-[28px] antarikh:py-[10px]
              debojit:ml-[23.3rem] debojit:text-[28px] debojit:py-[10px]
            "
          >
            Movies for you
          </h5>
          <button
            className="text-orange-500 text-[15px] md:mr-[50px] lg:mr-[95px] xl:mr-[135px] 2xl:mr-[165px] antarikh:mr-[195px]"
            onClick={() => navigate("/MoviePage")}
          >
            See All&gt;
          </button>
        </div>

        {isLoadingRec && <LoadingSpinner asOverlay />}

        {isMobile ? (
          <div className="w-[90%] mx-auto">
            <Swiper
              slidesPerView={1.8}
              spaceBetween={-100}
              centeredSlides={false}
              slidesOffsetBefore={80}
              slidesOffsetAfter={-80}
              breakpoints={{
                640: {
                  slidesPerView: 2.65,
                  spaceBetween: -150,
                  slidesOffsetBefore: 80,
                  slidesOffsetAfter: -80,
                },
              }}
            >
              {recommended.map((item) => (
                <SwiperSlide key={item._id}>
                  <Link
                    to={`/moviedetails/${item._id}`}
                    state={item}
                    className="no-underline hover:no-underline"
                    onClick={() => {
                      localStorage.setItem("id", item._id);
                      localStorage.setItem("moviename", item.movieName);
                      localStorage.setItem("moviegenre", item.movieGenre);
                      localStorage.setItem("movielanguage", item.movieLanguage);
                      localStorage.setItem("movieformat", item.movieFormat);
                    }}
                  >
                    <Card image={item.image} movieName={item.movieName} movieGenre={item.movieGenre} />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="relative w-full overflow-visible ">
            <div className="relative w-[90%] overflow-visible grid place-items-center left-[145px] pr-[55px] xl:left-[155px] xl:pr-[55px] 2xl:left-[162px] 2xl:pr-[95px] antarikh:left-[175px] antarikh:pr-[85px] ">
              <div className="w-full max-w-[84%] overflow-hidden ml-8 ">
                <div
                  className="flex transition-transform duration-[1000ms] "
                  style={{ transform: `translateX(-${recommendedCurrentSlide * 100}%)` }}
                >
                  {displayedRec.map(item => (
                    <div key={item._id} className="min-w-[25%] flex justify-center items-center flex-shrink-0 mb-[20px] ">
                      <Link
                        to={`/moviedetails/${item._id}`}
                        state={item}
                        className="no-underline"
                        onClick={() => {
                          localStorage.setItem("id", item._id);
                          localStorage.setItem("moviename", item.movieName);
                          localStorage.setItem("moviegenre", item.movieGenre);
                          localStorage.setItem("movielanguage", item.movieLanguage);
                          localStorage.setItem("movieformat", item.movieFormat);
                        }}
                      >
                        <Card image={item.image} movieName={item.movieName} movieGenre={item.movieGenre} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrevRecSlide}
                className="absolute top-1/2 left-[80px] transform -translate-y-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 focus:outline-none"
              >
                <svg className="w-4 h-4 text-gray-800" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNextRecSlide}
                disabled={recommendedCurrentSlide === recTotalSlides - 1}
                className="absolute top-1/2 right-[130px] transform -translate-y-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-gray-800" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9L5 5L1 1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

        )}
      </div>

      <Footer />
    </div>
  );
}

export default Moviedetails;