// UserHome.js
import React, { useState, useEffect } from 'react';
import { Link, useHref, useNavigate } from "react-router-dom";
import Usernavbar from './Usernavbar';
import axios from 'axios';
import Card from './Card';
import EventCard from './EventCard';
import Chatbot from './Chatbot';
import Footer from './Footer';
import BottomNav from './BottomNav';
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
  const [comingSoonCurrentSlide, setComingSoonCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoadingMovies(true);
    axios.get('https://ticketflix-backend.onrender.com/movieview')
      .then(res => {

        const sorted = res.data.slice().sort((a, b) =>
          b._id.localeCompare(a._id)
        );
        setData(sorted);
      })
      .catch(err => console.error('Error fetching movies:', err))
      .finally(() => setIsLoadingMovies(false));

    setIsLoadingEvents(true);
    axios.get('https://ticketflix-backend.onrender.com/event')
      .then(res => {

        const sortedE = res.data.slice().sort((a, b) =>
          b._id.localeCompare(a._id)
        );
        setData2(sortedE);
      })
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


  const recommendedMovies = data.filter(item => {
    const today = new Date();
    const release = new Date(item.movieReleasedate);
    const diffDays = (release - today) / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  });

  const filteredData = recommendedMovies.filter(item =>
    item.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieGenre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieLanguage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const comingSoonMovies = data.filter(item => {
    const today = new Date();
    const release = new Date(item.movieReleasedate);
    const diffDays = (release - today) / (1000 * 60 * 60 * 24);
    return diffDays > 2;
  });

  const filteredComingSoon = comingSoonMovies.filter(item =>
    item.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieGenre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.movieLanguage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MAX_CARDS = 8;
  const displayedMovies = filteredData.slice(0, MAX_CARDS);
  const displayedEvents = data2.slice(0, MAX_CARDS);
  const displayedComingSoon = filteredComingSoon.slice(0, MAX_CARDS);

  const cardsPerSlideMovie = 4;
  const movieTotalSlides = Math.ceil(displayedMovies.length / cardsPerSlideMovie);
  const comingsoonSlides = Math.ceil(displayedComingSoon.length / cardsPerSlideMovie);


  const cardsPerSlideEvent = 4;
  const eventTotalSlides = Math.ceil(displayedEvents.length / cardsPerSlideEvent);

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

  const handlePrevComingSoonSlideMovie = () => {
    setComingSoonCurrentSlide(prev =>
      prev > 0 ? prev - 1 : comingsoonSlides - 1
    );
  };
  const handleNextComingSoonSlideMovie = () => {
    setComingSoonCurrentSlide(prev =>
      prev < comingsoonSlides - 1 ? prev + 1 : 0
    );
  };


  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <div className="flex-1">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="relative overflow-hidden w-full mx-auto whitespace-nowrap ">
          <div className="flex w-[200%] animate-scroll-fast gap-1
                      md:animate-scroll-md md:gap-[6px] md:items-center
                      xl:animate-scroll-medium
                      2xl:animate-scroll-medium">
            {[...sliderImages, ...sliderImages].map((image, index) => (
              <img
                key={index}
                src={image}  //slider images
                alt={`slide-${index}`}
                className="mt-[75px] w-[550px] h-[150px] flex-shrink-0 object-cover rounded-[8px] shadow-[0_4px_6px_rgba(0,0,0,0.15)] 
                       sm:w-[768px] sm:h-[250px]
                       md:w-[1024px] md:h-[280px]
                       lg:w-[1280px] lg:h-[300px]"


              />
            ))}
          </div>
        </div>
        <div className='flex justify-center p-[10px] mb-[15px]  2xl:py-[10px] 2xl:w-[1100px]  2xl:mx-auto antarikh:py-[10px] antarikh:w-[1200px] debojit:py-[10px] debojit:w-[1300px]'>
          <a href="https://codehubsodepur.in/" rel="noopener noreferrer">
            <img
              src={require('./Codehub.png')}
              alt='ad-banner'
            />
          </a>
        </div>

        {/* Movies Section */}
        <div className="block p-[5px] text-center ml-[-90px]">

          <div className='flex justify-between items-center pr-[40px]'>
            <h5 className='flex justify-start ml-[7.5rem] text-[18px] font-500 mb-[-2px]
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500 
                        md:ml-[9.5rem] md:text-[22px] md:text-xl md:font-500
                        lg:ml-[16rem] lg:text-[26px] lg:font-bold
                        xl:ml-[18.7rem] xl:text-[28px] xl:py-[10px] xl:font-bold
                        antarikh:ml-[20.3rem] antarikh:text-[28px] antarikh:py-[10px]
                        debojit:ml-[23.3rem] debojit:text-[28px] debojit:py-[10px]'>Recommended Movies</h5>
            <button className=' text-orange-500 text-[15px] md:mr-[50px] lg:mr-[95px] xl:mr-[135px] 2xl:mr-[165px] antarikh:mr-[195px]'
              onClick={() => { navigate("/MoviePage") }}>See All&gt;</button>
          </div>
          {isLoadingMovies && <LoadingSpinner asOverlay />}

          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper

                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
                touchStartPreventDefault={false}
                touchMoveStopPropagation={false}
                touchAngle={5}



                breakpoints={{
                  640: {
                    slidesPerView: 2.65,
                    spaceBetween: -150,
                    slidesOffsetBefore: 80,
                    slidesOffsetAfter: -80,
                  },


                }}
              >

                {displayedMovies.map(item => (
                  <SwiperSlide key={item._id}>
                    <Link
                      to={`/moviedetails/${item._id}`}
                      state={item}
                      className="no-underline hover:no-underline"
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
            <div className="relative  w-[90%] overflow-hidden grid place-items-center left-[145px] pr-[55px] 
                            xl: left-[155px] xl:pr-[55px]
                            2xl: left-[162px] 2xl:pr-[95px]
                            antarikh: left-[175px] antarikh:pr-[85px]">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-[45px] z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full
                 bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white
                 dark:focus:ring-gray-800/70 focus:outline-none
                 antarikh:left-[60px]
                 debojit:left-[100px]"
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
                  {displayedMovies.map(item => (
                    <div key={item._id} className="min-w-[25%] box-border flex justify-center items-center flex-shrink-0 no-underline mb-[20px]">
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
                disabled={movieCurrentSlide === movieTotalSlides - 1}
                className="absolute top-1/2 right-[100px] z-30 -translate-y-1/2 flex items-center justify-center w-10 
                h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 
                focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                2xl:right-[120px]
                antarikh:right-[140px]
                debojit:right-[170px]"
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
        <div className='flex justify-center p-[10px] mb-[10px] max-lg:mt-[-35px] 2xl:py-[10px] 2xl:w-[1100px] 2xl:mt-[-45px] 2xl:mx-auto antarikh:py-[10px] antarikh:w-[1200px] debojit:py-[10px] debojit:w-[1300px]'>
          <a href="https://www.netflix.com/in/title/81040344" rel="noopener noreferrer">
            <img
              src={require('./Netflix SG.png')}
              alt='ad-banner'
            />
          </a>
        </div>


        {/* coming soon Section */}
        <div className="block p-[5px] text-center ml-[-90px]">

          <div className='flex justify-between items-center pr-[40px]'>
            <h5 className='flex justify-start ml-[7.5rem] text-[18px] font-500 mb-[-2px]
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500 
                        md:ml-[9.5rem] md:text-[22px] md:text-xl md:font-500
                        lg:ml-[16rem] lg:text-[26px] lg:font-bold
                        xl:ml-[18.7rem] xl:text-[28px] xl:py-[10px] xl:font-bold
                        antarikh:ml-[20.3rem] antarikh:text-[28px] antarikh:py-[10px]
                        debojit:ml-[23.3rem] debojit:text-[28px] debojit:py-[10px]'>Coming Soon</h5>
            <button className=' text-orange-500 text-[15px] md:mr-[50px] lg:mr-[95px] xl:mr-[135px] 2xl:mr-[165px] antarikh:mr-[195px]'
              onClick={() => { navigate("/ComingSoon") }}>See All&gt;</button>
          </div>
          {isLoadingMovies && <LoadingSpinner asOverlay />}

          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper

                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
                touchStartPreventDefault={false}
                touchMoveStopPropagation={false}
                touchAngle={5}

                breakpoints={{
                  640: {
                    slidesPerView: 2.65,
                    spaceBetween: -150,
                    slidesOffsetBefore: 80,
                    slidesOffsetAfter: -80,
                  },


                }}
              >

                {displayedComingSoon.map(item => (
                  <SwiperSlide key={item._id}>
                    <Link
                      to={`/moviedetails/${item._id}`}
                      state={item}
                      className="no-underline hover:no-underline"
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
            <div className="relative  w-[90%] overflow-hidden grid place-items-center left-[145px] pr-[55px] 
                            xl: left-[155px] xl:pr-[55px]
                            2xl: left-[162px] 2xl:pr-[95px]
                            antarikh: left-[175px] antarikh:pr-[85px]">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-[45px] z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full
                 bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white
                 dark:focus:ring-gray-800/70 focus:outline-none
                 antarikh:left-[60px]
                 debojit:left-[100px]"
                onClick={handlePrevComingSoonSlideMovie}
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
                    transform: `translateX(-${comingSoonCurrentSlide * 100}%)`
                  }}
                >
                  {displayedComingSoon.map(item => (
                    <div key={item._id} className="min-w-[25%] box-border flex justify-center items-center flex-shrink-0 no-underline mb-[20px]">
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
                disabled={comingSoonCurrentSlide === comingsoonSlides - 1}
                className="absolute top-1/2 right-[100px] z-30 -translate-y-1/2 flex items-center justify-center w-10 
                h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 
                focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                2xl:right-[120px]
                antarikh:right-[140px]
                debojit:right-[170px]"
                onClick={handleNextComingSoonSlideMovie}
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
        <div className="max-lg:hidden bg-gradient-to-r from-[#1e1e1e] to-[#2a2a2a] text-white p-[20px] flex items-center 
                        justify-center mx-auto my-[10px] rounded-[10px] w-[80%] max-w-[1400px]
                        max-md:p-[10px] max-md:py-[5px] ">
          <div className="text-center">
            <h1 className="text-[24px] font-bold mb-[10px] max-md:mb-[5px]">TICKETFLIX STREAM</h1>
            <p className="text-[18px] ">Endless Entertainment Anytime. Anywhere!</p>
          </div>
        </div>
        <div className='lg:hidden flex justify-center p-[10px] mb-[10px] max-lg:mt-[-35px] 2xl:py-[10px] 2xl:w-[1100px] 2xl:mt-[-45px] 2xl:mx-auto 2xl:mb-[15px antarikh:py-[10px] antarikh:w-[1200px] debojit:py-[10px] debojit:w-[1300px]'>
          <img src='https://assets-in-gm.bmscdn.com/promotions/cms/creatives/1751544005377_4thjulypepsif1sluggifapp.gif'
            alt='f1' />
        </div>

        <div className="relative overflow-hidden w-full mx-auto whitespace-nowrap mb-[10px]">
        </div>

        {/* Action Section */}
        <div className="block p-[5px] text-center ml-[-90px]">

          <div className='flex justify-between items-center pr-[40px]'>
            <h5 className='flex justify-start ml-[7.5rem] text-[18px] font-500 mb-[-2px]
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500 
                        md:ml-[9.5rem] md:text-[22px] md:text-xl md:font-500
                        lg:ml-[16rem] lg:text-[26px] lg:font-bold
                        xl:ml-[18.7rem] xl:text-[28px] xl:py-[10px] xl:font-bold
                        antarikh:ml-[20.3rem] antarikh:text-[28px] antarikh:py-[10px]
                        debojit:ml-[23.3rem] debojit:text-[28px] debojit:py-[10px]'>Action Movies</h5>
            <button className=' text-orange-500 text-[15px] md:mr-[50px] lg:mr-[95px] xl:mr-[135px] 2xl:mr-[165px] antarikh:mr-[195px]'
              onClick={() => { navigate("/MoviePage") }}>See All&gt;</button>
          </div>


          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper
                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
                touchStartPreventDefault={false}
                touchMoveStopPropagation={false}
                touchAngle={5}

                breakpoints={{
                  640: {
                    slidesPerView: 2.65,
                    spaceBetween: -150,
                    slidesOffsetBefore: 80,
                    slidesOffsetAfter: -80,
                  },
                }}
              >
                {displayedMovies
                  .filter(item =>
                    item.movieGenre
                      ?.toLowerCase()
                      .split(',')
                      .map(g => g.trim())
                      .includes('action')
                  )
                  .map(item => (
                    <SwiperSlide key={item._id}>
                      <Link
                        to={`/moviedetails/${item._id}`}
                        state={item}
                        className="no-underline hover:no-underline"
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
            <div className="relative  w-[90%] overflow-hidden grid place-items-center left-[145px] pr-[55px] 
                            xl: left-[155px] xl:pr-[55px]
                            2xl: left-[162px] 2xl:pr-[95px]
                            antarikh: left-[175px] antarikh:pr-[85px]">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-[45px] z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full
                 bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white
                 dark:focus:ring-gray-800/70 focus:outline-none
                 antarikh:left-[60px]
                 debojit:left-[100px]"
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
                  {displayedMovies.map(item => (
                    <div key={item._id} className="min-w-[25%] box-border flex justify-center items-center flex-shrink-0 no-underline mb-[20px]">
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
                disabled={movieCurrentSlide === movieTotalSlides - 1}
                className="absolute top-1/2 right-[100px] z-30 -translate-y-1/2 flex items-center justify-center w-10 
                h-10 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 
                focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                2xl:right-[120px]
                antarikh:right-[140px]
                debojit:right-[170px]"
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

        <div className='flex justify-center p-[10px] mb-[10px] max-lg:mt-[-25px] 2xl:py-[10px] 2xl:w-[1100px] 2xl:mt-[-45px] 2xl:mx-auto 2xl:mb-[15px antarikh:py-[10px] antarikh:w-[1200px] debojit:py-[10px] debojit:w-[1300px]'>
          <img src={require('./FoodExpress1290.png')}
            alt='ad-banner' />
        </div>
        {/* Events Section */}

        <div className="block p-[5px] text-center ml-[-90px]">
          <div className='flex justify-between items-center pr-[40px]'>
            <h5 className='flex justify-start ml-[7.5rem] text-[18px] font-500 mb-[-2px]
                        sm:ml-[8.5rem] sm:text-[22px] sm:font-500 
                        md:ml-[9.5rem] md:text-[22px] md:text-xl md:font-500
                        lg:ml-[16rem] lg:text-[26px] lg:font-bold
                        xl:ml-[18.7rem] xl:text-[28px] xl:py-[10px] xl:font-bold
                        antarikh:ml-[20.3rem] antarikh:text-[28px] antarikh:py-[10px]
                        debojit:ml-[23.3rem] debojit:text-[28px] debojit:py-[10px]'>Recommended Events</h5>
            <button className=' text-orange-500 text-[15px] md:mr-[50px] lg:mr-[95px] xl:mr-[135px] 2xl:mr-[165px] antarikh:mr-[195px]'
              onClick={() => { navigate("/event") }}>See All&gt;</button>
          </div>
          {isLoadingEvents && <LoadingSpinner asOverlay />}
          {isMobile ? (
            <div className="w-[90%] mx-auto">
              <Swiper
                slidesPerView={1.8}
                spaceBetween={-100}
                centeredSlides={false}
                slidesOffsetBefore={80}
                slidesOffsetAfter={-80}
                touchStartPreventDefault={false}
                touchMoveStopPropagation={false}
                touchAngle={5}

                breakpoints={{
                  640: {
                    slidesPerView: 2.68,
                    spaceBetween: -150,
                    slidesOffsetBefore: 75,
                    slidesOffsetAfter: -80,
                  },

                }}
              >
                {displayedEvents.map(item => (
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
                      className="no-underline hover:no-underline"
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
            <div className="relative  w-[90%]  overflow-hidden grid place-items-center left-[145px] pr-[55px]
                            xl: left-[155px] xl:pr-[55px]
                            2xl: left-[162px] 2xl:pr-[95px]
                            antarikh: left-[175px] antarikh:pr-[85px]">
              {/* Left Arrow */}
              <button
                type="button"
                className="absolute top-1/2 left-[45px] z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full
                 bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white
                 dark:focus:ring-gray-800/70 focus:outline-none
                 antarikh:left-[60px]
                 debojit:left-[100px]"
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
                  {displayedEvents.map(item => (
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
                disabled={eventCurrentSlide === eventTotalSlides - 1}
                className="absolute top-1/2 right-[100px] z-30 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/30
                 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/60 focus:ring-4 focus:ring-white dark:focus:ring-gray-800/70 
                 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                 2xl:right-[120px]
                 antarikh:right-[140px]
                 debojit:right-[170px]"
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
      <br />
      <BottomNav />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default UserHome;