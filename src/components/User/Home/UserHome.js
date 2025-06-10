// UserHome.js
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Usernavbar from './Usernavbar';
import axios from 'axios';
import Card from './Card';
import EventCard from './EventCard';
import Chatbot from './Chatbot';
import Footer from './Footer';
import LoadingSpinner from '../../UIElements/LoadingSpinner';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const sliderImages = [
  'https://assets-in-gm.bmscdn.com/promotions/cms/creatives/1742293928527_generalsale1240x300.jpeg',
  'https://assets-in-gm.bmscdn.com/promotions/cms/creatives/1744804585447_summercampaignwebbanneramusementpark.jpg',
  'https://assetscdn1.paytm.com/images/catalog/view_item/3028876/9236524588145129.jpg?format=webp&imwidth=1750',
  'https://assetscdn1.paytm.com/images/catalog/view_item/3006085/13825457253829748.jpg?format=webp&imwidth=1750'
];

const UserHome = () => {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [movieCurrentSlide, setMovieCurrentSlide] = useState(0);
  const [eventCurrentSlide, setEventCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    setIsLoadingMovies(true);
    axios.get('https://ticketflix-backend.onrender.com/movieview')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching movies:', err))
      .finally(() => setIsLoadingMovies(false));

    setIsLoadingEvents(true);
    axios.get('https://ticketflix-backend.onrender.com/event')
      .then(res => setData2(res.data))
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setIsLoadingEvents(false));


    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setID = (_id, movieName, movieGenre, movieLanguage, movieFormat) => {
    localStorage.setItem("id", _id);
    localStorage.setItem("moviename", movieName);
    localStorage.setItem("moviegenre", movieGenre);
    localStorage.setItem("movielanguage", movieLanguage);
    localStorage.setItem("movieformat", movieFormat);
  };

  const setID2 = (_id, eventName, eventLanguage, eventVenue, eventDate, eventTime, eventType) => {
    localStorage.setItem("id", _id);
    localStorage.setItem("eventName", eventName);
    localStorage.setItem("eventLanguage", eventLanguage);
    localStorage.setItem("eventVenue", eventVenue);
    localStorage.setItem("eventDate", eventDate);
    localStorage.setItem("eventTime", eventTime);
    localStorage.setItem("eventType", eventType);
  };

  const filteredData = data.filter(item =>
    item.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieGenre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieLanguage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardsPerSlideMovie = 4;
  const movieTotalSlides = Math.ceil(filteredData.length / cardsPerSlideMovie);

  const cardsPerSlideEvent = 4;
  const eventTotalSlides = Math.ceil(data2.length / cardsPerSlideEvent);

  const handlePrevSlideMovie = () => {
    setMovieCurrentSlide(prev =>
      prev > 0 ? prev - 1 : movieTotalSlides - 1
    );
  };
  const handleNextSlideMovie = () => {
    setMovieCurrentSlide(prev =>
      prev < movieTotalSlides - 1 ? prev + 1 : 0
    );
  };

  const handlePrevSlideEvent = () => {
    setEventCurrentSlide(prev =>
      prev > 0 ? prev - 1 : eventTotalSlides - 1
    );
  };
  const handleNextSlideEvent = () => {
    setEventCurrentSlide(prev =>
      prev < eventTotalSlides - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="relative overflow-hidden w-full mx-auto whitespace-nowrap mb-[10px]">
          <div className="flex w-[200%] animate-scroll-fast 
                      md:animate-scroll-md gap-[6px] items-center
                      xl:animate-scroll-medium
                      2xl:animate-scroll-medium">
            {[...sliderImages, ...sliderImages].map((image, index) => (
              <img
                key={index}
                src={image}  //slider images
                alt={`slide-${index}`}
                className="mt-[90px] w-[412px] h-[150px] flex-shrink-0 object-cover rounded-[8px] shadow-[0_4px_6px_rgba(0,0,0,0.15)]
                       sm:w-[768px] sm:h-[250px]
                       md:w-[1024px] md:h-[280px]
                       lg:w-[1280px] lg:h-[300px]"


              />
            ))}
          </div>
        </div>
        {/* Movies Section */}
        <div className="block p-[5px] text-center ml-[-90px]">
          <h5 className='flex justify-start ml-[7rem] text-[20px] font-500
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500
                        md:ml-[9.5rem] md:text-[22px] text-xl md:font-500'>Recommended Movies</h5>
          {isLoadingMovies && <LoadingSpinner asOverlay />}
          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper
                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
              >
                {filteredData.map(item => (
                  <SwiperSlide key={item._id}>
                    <Link
                      to={`/moviedetails/${item._id}`}
                      state={item}
                      onClick={() =>
                        setID(
                          item._id,
                          item.movieName,
                          item.movieGenre,
                          item.movieLanguage,
                          item.movieFormat
                        )
                      }
                    >
                      <Card
                        image={item.image}
                        movieName={item.movieName}
                        movieGenre={item.movieGenre}
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="relative w-[90%] mx-auto overflow-hidden flex items-center justify-center">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-20 z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none"
                onClick={handlePrevSlideMovie}
              >
                <svg
                  className="w-4 h-4 text-white dark:text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 1 1 5l4 4"
                  />
                </svg>
                <span className="sr-only">Previous</span>
              </button>

              {/* Desktop Carousel */}
              <div className="w-full max-w-[84%] overflow-hidden">
                <div
                  className="flex transition-transform duration-[1000ms]"
                  style={{
                    transform: `translateX(-${movieCurrentSlide * 100}%)`
                  }}
                >
                  {filteredData.map(item => (
                    <div key={item._id} className="min-w-[25%] box-border flex justify-center items-center flex-shrink-0 no-underline">
                      <Link
                        to={`/moviedetails/${item._id}`}
                        state={item}
                        onClick={() =>
                          setID(
                            item._id,
                            item.movieName,
                            item.movieGenre,
                            item.movieLanguage,
                            item.movieFormat
                          )
                        }
                        className="text-[#222] font-bold no-underline hover:no-underline"
                      >
                        <Card
                          image={item.image}
                          movieName={item.movieName}
                          movieGenre={item.movieGenre}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                type="button"
                className="absolute top-1/2 right-20 z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none"
                onClick={handleNextSlideMovie}
              >
                <svg
                  className="w-4 h-4 text-white dark:text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="sr-only">Next</span>
              </button>
            </div>
          )}
        </div>

        {/* Ad Banner */}
        <div className="bg-gradient-to-r from-[#1e1e1e] to-[#2a2a2a] text-white p-[20px] flex items-center justify-center mx-auto my-[20px] rounded-[10px] w-[80%] max-w-[1400px]">
          <div className="text-center">
            <h1 className="text-[24px] font-bold mb-[10px]">TICKETFLIX STREAM</h1>
            <p className="text-[18px]">Endless Entertainment Anytime. Anywhere!</p>
          </div>
        </div>

        {/* Events Section */}
        <div className="block p-[5px] text-center ml-[-90px]">
          <h5 className='flex justify-start ml-[7.5rem] text-[20px] font-500 mb-[-2px]
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500
                        md:ml-[9.5rem] md:text-[22px] text-xl md:font-500'>Recommended Events</h5>
          {isLoadingEvents && <LoadingSpinner asOverlay />}
          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper
                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
              >
                {data2.map(item => (
                  <SwiperSlide key={item._id}>
                    <Link
                      to={`/eventdetails/${item._id}`}
                      onClick={() =>
                        setID2(
                          item._id,
                          item.eventName,
                          item.eventLanguage,
                          item.eventVenue,
                          item.eventDate,
                          item.eventTime,
                          item.eventType
                        )
                      }
                    >
                      <EventCard
                        image={item.image}
                        eventName={item.eventName}
                        eventVenue={item.eventVenue}
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="relative w-[90%] mx-auto overflow-hidden flex items-center justify-center">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-20 z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none"
                onClick={handlePrevSlideEvent}
              >
                <svg
                  className="w-4 h-4 text-white dark:text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 1 1 5l4 4"
                  />
                </svg>
                <span className="sr-only">Previous</span>
              </button>

              {/* Desktop Carousel */}
              <div className="w-full max-w-[84%] overflow-hidden">
                <div
                  className="flex transition-transform duration-[1000ms]"
                  style={{
                    transform: `translateX(-${eventCurrentSlide * 100}%)`
                  }}
                >
                  {data2.map(item => (
                    <div key={item._id} className="min-w-[25%] box-border flex justify-center items-center flex-shrink-0 no-underline">
                      <Link
                        to={`/eventdetails/${item._id}`}
                        onClick={() =>
                          setID2(
                            item._id,
                            item.eventName,
                            item.eventLanguage,
                            item.eventVenue,
                            item.eventDate,
                            item.eventTime,
                            item.eventType
                          )
                        }
                        className="text-[#222] font-bold no-underline hover:no-underline"
                      >
                        <EventCard
                          image={item.image}
                          eventName={item.eventName}
                          eventVenue={item.eventVenue}
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                type="button"
                className="absolute top-1/2 right-20 z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none"
                onClick={handleNextSlideEvent}
              >
                <svg
                  className="w-4 h-4 text-white dark:text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="sr-only">Next</span>
              </button>
            </div>
          )}
        </div>

      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default UserHome;