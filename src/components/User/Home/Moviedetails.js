import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import { FaFilm, FaStar } from "react-icons/fa";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function Moviedetails() {
  // Movie detail states
  const [movieImage, setMovieImage] = useState("");
  const [movieName, setMovieName] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieLanguage, setMovieLanguage] = useState("");
  const [movieFormat, setMovieFormat] = useState("");
  const [movieDuration, setMovieDuration] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [movieCast, setMovieCast] = useState([]);
  const [trailerLink, setTrailerLink] = useState("");
  const [id, setId] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);

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
      const response = await axios.get(`https://ticketflix-backend.onrender.com/getmovieview/${movieId}`);
      const {
        movieName,
        movieGenre,
        movieLanguage,
        movieFormat,
        movieDuration,
        movieDescription,
        imageURL,
        movieCast,
        trailerLink,
        reviews: fetchedReviews,
      } = response.data;

      setMovieImage(imageURL);
      setMovieName(movieName);
      setMovieGenre(movieGenre);
      setMovieLanguage(movieLanguage);
      setMovieFormat(movieFormat);
      setMovieDuration(movieDuration);
      setMovieDescription(movieDescription);
      setMovieCast(movieCast || []);
      setTrailerLink(trailerLink || "");

      if (fetchedReviews && fetchedReviews.length > 0) {
        setReviews(fetchedReviews);
        localStorage.setItem(localKey, JSON.stringify(fetchedReviews));
      } else {
        const storedReviews = localStorage.getItem(localKey);
        if (storedReviews) {
          setReviews(JSON.parse(storedReviews));
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
      const storedReviews = localStorage.getItem(localKey);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    }
  };

  // On mount, determine the movie ID from URL params, location state, or localStorage
  useEffect(() => {
    const movieId = paramId || localStorage.getItem("id");
    if (!movieId) {
      navigate("/");
      return;
    }
    setId(movieId);

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

  // Navigate to the trailer page when poster is clicked
  const handlePosterClick = () => {
    navigate("/multimedia", { state: { trailerLink, movieName } });
  };

  // Show language popup
  const handleClick = () => {
    setShowLanguagePopup(true);
  };

  // Handle language selection and navigate to showtime page
  const handleLanguageSelect = (chosenLanguage) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    navigate("/movieShowtime", {
      state: {
        movieName,
        userEmail: storedEmail,
        chosenLanguage,
      },
    });
    setShowLanguagePopup(false);
  };

  // Close language popup
  const closeLanguagePopup = () => {
    setShowLanguagePopup(false);
  };

  // Split movieLanguage into an array
  const splittedLangs = movieLanguage
    ? movieLanguage.split(/[\/,]/).map((lang) => lang.trim())
    : [];

  // Single Arrow Slider Logic for Reviews
  const handleScroll = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = reviewsSliderRef.current;
    if (scrollLeft <= 10) {
      setArrowPosition("right");
    } else if (scrollLeft + clientWidth >= scrollWidth - 10) {
      setArrowPosition("left");
    } else {
      setArrowPosition("right");
    }
  };

  const handleArrowClick = () => {
    if (!reviewsSliderRef.current) return;
    const { scrollWidth, clientWidth } = reviewsSliderRef.current;
    if (arrowPosition === "right") {
      reviewsSliderRef.current.scrollLeft = scrollWidth;
    } else {
      reviewsSliderRef.current.scrollLeft = 0;
    }
  };

  // Review Modal Handlers
  const openReviewModal = () => {
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  // Handle review submission from the modal
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      alert("Please select a rating.");
      return;
    }
    try {
      const response = await axios.post(
        `https://ticketflix-backend.onrender.com/movieview/review/${id}`,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Usernavbar />

      {/* Movie Details Section (Mobile‑First) */}
      <div
        className="
          flex flex-col justify-center items-center
          bg-gradient-to-r from-[#f1f2b5] to-[#135058] text-[#17202a]
          p-4 mt-[70px]
          lg:flex-row lg:items-start lg:justify-between lg:p-8 lg:mt-[70px] 
          xl:flex-row xl:items-start xl:justify-between xl:p-8 xl:mt-[70px] 
          antarikh:flex-row antarikh:items-start antarikh:justify-between antarikh:p-8 antarikh:mt-[70px] 
        "
      >
        {movieImage && (
          <div
            className="
              w-3/4 max-w-[240px] max-lg:mb-4
              lg:w-[200px] lg:max-w-none  lg:order-2 lg:mr-[150px] 
              xl:w-[200px] xl:max-w-none  xl:order-2 xl:mr-[185px]
              antarikh:w-[200px] antarikh:max-w-none antarikh:order-2 antarikh:mr-[215px]
            "
          >
            <img
              src={movieImage}
              alt={movieName}
              className="
                w-full h-auto rounded-sm mx-auto
                lg:mx-0
                xl:mx-0
                antarikh:mx-0
              "
            />
          </div>
        )}

        <div
          className="
            w-full text-center
            lg:text-left lg:flex-1 lg:pr-8
            xl:text-left xl:flex-1 xl:pr-8
            antarikh:text-left antarikh:flex-1 antarikh:pr-8
          "
        >
          <div className="flex flex-row justify-start mb-1 ml-[15px]
                          lg:flex lg:flex-row lg:justify-start lg:mb-4 lg:ml-[154px]
                          xl:mb-4  xl:w-[70%] xl:ml-[186px]
                          antarikh:mb-4  antarikh:w-[70%] antarikh:ml-[215px]">
            <h1
              className="
                max-lg:w-[full] text-center text-2xl font-extrabold mb-2
                lg:text-4xl 
                xl:text-4xl 
                antarikh:text-4xl
              "
            >
              {movieName}
            </h1>
          </div>

          <div
            className="
              w-full flex flex-wrap justify-start gap-2 mb-4 pl-4 sm:justify-center
              lg:flex lg:flex-col lg:gap-1.6 lg:items-start lg:ml-[139px]
              xl:flex xl:flex-col xl:gap-1.6 xl:items-start xl:ml-[172px]
              antarikh:flex antarikh:flex-col antarikh:gap-1.6 antarikh:items-start antarikh:ml-[200px]
            "
          >
            <span className="text-base font-extrabold">{movieLanguage}</span>
            <span className="text-base font-extrabold">{movieGenre}</span>
            <span className="text-base font-extrabold">{movieFormat}</span>
            <span className="text-base font-extrabold">{movieDuration}</span>
          </div>

          <div
            className="
              flex flex-col gap-3
              lg:flex-col lg:items-start lg:gap-4 lg:w-[400px] lg:ml-[150px]
              xl:flex-col xl:items-start xl:gap-4 xl:w-[400px] xl:ml-[185px]
              antarikh:flex-col antarikh:items-start antarikh:gap-4 antarikh:w-[400px] antarikh:ml-[215px]
            "
          >
            <button
              onClick={handlePosterClick}
              className="
                mr-[11rem] bg-[#135058] text-white px-4 py-3 rounded-full text-base transition-transform duration-200 hover:scale-105
                sm:ml-[11rem]
                lg:ml-0 lg:mr-0
                xl:ml-0 xl:mr-0
                antarikh:ml-0 antarikh:mr-0
              "
            >
              <FaFilm className="inline-block mb-1 mr-1" />
              Watch Trailer
            </button>
            <button
              onClick={handleClick}
              className="
                ml-[11rem] bg-[#135058] text-white px-4 py-3 rounded-full text-base transition-transform duration-200 hover:scale-105 max-lg:hidden
                lg:inline-block lg:ml-0
                xl:inline-block xl:ml-0
                antarikh:inline-block antarikh:ml-0
              "
            >
              Book Tickets
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 gap-[2.6rem]
                      lg:mt-6 lg:gap-8 lg:hidden"
      >
        <h3 className="mt-[5px] lg:mt-0">Review our movie</h3>
        <button
          onClick={openReviewModal}
          className="
            bg-[#fff] text-black border-[2px] border-pink-500 px-[2.5rem] py-2 rounded-full text-base transition-colors duration-300
            lg:px-6 lg:py-3
          "
        >
          Rate Now
        </button>
      </div>

      {/* Movie Description */}
      <div
        className="
          px-4 mt-6 text-[#121920] leading-relaxed border-gray-300 pb-4 mb-8
          lg:px-40 lg:mt-10 lg:mb-12 lg:ml-[154px] lg:mr-[100px]
          xl:px-40 xl:mt-10 xl:mb-12 xl:ml-[188px] xl:mr-[150px]
          antarikh:px-40 antarikh:mt-10 antarikh:mb-12 antarikh:ml-[215px] antarikh:mr-[200px]
        "
      >
        <h2 className="text-xl font-bold mb-2 lg:text-2xl lg:mb-4">
          About the movie
        </h2>
        <p className="text-base lg:text-lg">{movieDescription}</p>
      </div>

      {/* Ad Banner */}
      <div
        className="flex justify-center p-[10px] mb-[2rem] mt-[-3rem]
                  lg:mb-16 lg:mt-[-50px] lg:mx-[164px] 
                  xl:mb-16 xl:mt-[-50px] xl:mx-[200px]
                  antarikh:mb-16 antarikh:mt-[-50px] antarikh:mx-[230px]"
      >
        <a href="https://codehubsodepur.in/" rel="noopener noreferrer">
          <img src={require('./Codehub.png')} alt="ad-banner" />
        </a>
      </div>

      {/* Movie Cast */}
      <div className="xl:flex xl:flex-col xl:justify-start xl:items-start px-4 mb-8 
                      lg:px-40 lg:mb-12
                      xl:px-40 xl:mb-12 xl:ml-[9rem]
                      antarikh:px-40 antarikh:mb-12 antarikh:ml-[10.5rem]">
        <h2 className="text-lg font-bold mb-4 lg:px-40 lg:mt-[-30px] lg:mb-12 lg:ml-[0px]
        xl:px-40 xl:mt-[-30px] xl:mb-12 xl:ml-[-115px]">Cast</h2>

        {/* MOBILE SWIPER (shown < lg) */}
        {movieCast.length > 0 && (
          <div className="block lg:hidden">
            <Swiper slidesPerView={2.2} spaceBetween={40} freeMode={true}>
              {movieCast.map((actor, idx) => (
                <SwiperSlide key={idx} className="w-auto">
                  <div className="flex flex-col items-center">
                    <img
                      src={actor.image}
                      alt={actor.name}
                      className="w-[120px] h-[120px] rounded-full object-cover mb-2"
                    />
                    <span className="block text-center text-sm font-medium">
                      {actor.name}
                    </span>
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
                  className="w-[100px] h-[100px] rounded-full object-cover mb-2"
                />
                <p className="text-center font-medium">{actor.name}</p>
              </li>
            ))}
          </ul>
        )}

        {/* EMPTY STATE */}
        {movieCast.length === 0 && (
          <p className="text-center">No cast information available.</p>
        )}
      </div>

      {/* Movie Reviews */}
      <div className="px-4 mb-8 
                      lg:mx-[155px] lg:mb-12
                      xl:mx-[185px] xl:mb-12
                      antarikh:mx-[215px] antarikh:mb-12">
        <h2 className="text-xl text-[#135058] font-bold mb-4 border-b-2 border-[#135058] pb-2 lg:text-2xl lg:mb-6">
          Reviews
        </h2>
        {reviews.length > 0 ? (
          <div className="relative ">
            <button
              onClick={handleArrowClick}
              className={`
                max-lg:hidden absolute top-1/2 transform -translate-y-1/2
                bg-gray-200 rounded-full w-8 h-8 text-lg opacity-80 hover:opacity-100
                ${arrowPosition === 'right' ? 'right-2' : 'left-2'}
                lg:w-10 lg:h-10 lg:text-xl
                xl:w-10 xl:h-10 xl:text-xl
                antarikh:w-10 antarikh:h-10 antarikh:text-xl
              `}
            >
              {arrowPosition === 'right' ? '>' : '<'}
            </button>
            <div
              ref={reviewsSliderRef}
              onScroll={handleScroll}
              className="
                overflow-x-auto whitespace-nowrap scroll-snap-x-mandatory scroll-smooth no-scrollbar py-2
                lg:py-4 lg:overflow-x-hidden
              "
            >
              <ul className="inline-flex gap-4 p-0 m-0">
                {reviews.map((item, idx) => (
                  <li
                    key={idx}
                    className="
                      flex-none w-[280px] bg-white rounded-lg shadow p-4 scroll-snap-start hover:-translate-y-1 hover:shadow-lg transition
                      lg:w-[320px] lg:p-6
                      xl:w-[320px] xl:p-6
                      antarikh:w-[320px] antarikh:p-6
                    "
                  >
                    <p className="font-semibold text-[#135058] mb-2">
                      {item.user || 'Anonymous'} rated it ⭐ {item.rating}/10
                    </p>
                    {item.review && <p>{item.review}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-center">No reviews available.</p>
        )}
      </div>

      {/* Submit Review Button */}
      <div className="px-4 mb-8 lg:px-40 lg:mb-12 ">
        <button
          onClick={openReviewModal}
          className="w-full bg-[#135058] text-white py-3 rounded-full text-base transition-colors duration-300 hover:bg-[#0d3a40] hidden 
          lg:block lg:w-fit lg:px-[15px] lg:ml-[157px]
          xl:block xl:w-fit xl:px-[15px] xl:ml-[185px]
          antarikh:block antarikh:w-fit antarikh:px-[15px] antarikh:ml-[215px]
          "
        >
          Submit Your Review
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] max-w-[90%] p-5 rounded-lg shadow-lg relative">
            <span
              onClick={closeReviewModal}
              className="absolute top-2 right-3 text-2xl cursor-pointer"
            >
              &times;
            </span>
            <h2 className="text-xl font-bold mb-4">Submit Your Review</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label htmlFor="reviewerName" className="block mb-1">Your Name</label>
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
                <span className="min-w-[40px] text-right text-sm text-gray-700">
                  {reviewRating}/10
                </span>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block mb-1">Review</label>
                <textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your thoughts about the movie"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-br from-[#135058] to-[#135058] text-white py-2 px-5 rounded-full"
              >
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
            <span
              onClick={closeLanguagePopup}
              className="absolute top-3 right-4 text-xl cursor-pointer"
            >
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
        <button
          onClick={handleClick}
          className="w-full bg-[#135058] text-white py-3 rounded-full text-base transition-transform duration-200 hover:scale-105"
        >
          Book Tickets
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Moviedetails;
