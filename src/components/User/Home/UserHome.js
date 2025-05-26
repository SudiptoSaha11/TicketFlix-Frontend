// UserHome.js
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Usernavbar from './Usernavbar';
import axios from 'axios';
import Card from './Card';
import Chatbot from './Chatbot';
import Footer from './Footer';
import '../Home/UserHome.css';
import EventCard from './EventCard';
import '@fortawesome/fontawesome-free/css/all.min.css';

const sliderImages = [
  'https://assets-in-gm.bmscdn.com/promotions/cms/creatives/1742293928527_generalsale1240x300.jpeg',
  'https://assets-in-gm.bmscdn.com/promotions/cms/creatives/1744804585447_summercampaignwebbanneramusementpark.jpg',
  'https://assetscdn1.paytm.com/images/catalog/view_item/3028876/9236524588145129.jpg?format=webp&imwidth=1750',
  'https://assetscdn1.paytm.com/images/catalog/view_item/3006085/13825457253829748.jpg?format=webp&imwidth=1750'
];

const UserHome = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [movieCurrentSlide, setMovieCurrentSlide] = useState(0);
  const [eventCurrentSlide, setEventCurrentSlide] = useState(0);
  const [data2, setData2] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/movieview')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching movies:', err));

    axios.get('http://localhost:5000/event')
      .then(res => setData2(res.data))
      .catch(err => console.error('Error fetching events:', err));
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

  const handlePrevSlideMovie = () => {
    setMovieCurrentSlide(prev => (prev > 0 ? prev - 1 : movieTotalSlides - 1));
  };
  const handleNextSlideMovie = () => {
    setMovieCurrentSlide(prev => (prev < movieTotalSlides - 1 ? prev + 1 : 0));
  };

  const handlePrevSlideEvent = () => {
    setEventCurrentSlide(prev => (prev > 0 ? prev - 1 : eventTotalSlides - 1));
  };
  const handleNextSlideEvent = () => {
    setEventCurrentSlide(prev => (prev < eventTotalSlides - 1 ? prev + 1 : 0));
  };

  const cardsPerSlideMovie = 4;
  const movieTotalSlides = Math.ceil(filteredData.length / cardsPerSlideMovie);

  const cardsPerSlideEvent = 4;
  const eventTotalSlides = Math.ceil(data2.length / cardsPerSlideEvent);

  return (
    <div className="userhome-container">
      <div className="userhome-content">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="continuous-slider">
          <div className="slider-track">
            {[...sliderImages, ...sliderImages].map((image, index) => (
              <img key={index} src={image} alt={`slide-${index}`} className="slider-image" />
            ))}
          </div>
        </div>

        {/* Movie Slider Section */}
        <div className="arrow-slider-container">
          <button className="arrow-button left" onClick={handlePrevSlideMovie}>&lt;</button>
          <div className="slider-wrapper">
            <div className="slider-track-poster" style={{ transform: `translateX(-${movieCurrentSlide * 100}%)` }}>
              {filteredData.map(item => (
                <div key={item._id} className="slider-card-poster">
                  <Link to={`/moviedetails/${item._id}`} state={item} onClick={() => setID(item._id, item.movieName, item.movieGenre, item.movieLanguage, item.movieFormat)}>
                    <Card
                      image={item.image}
                      movieName={item.movieName}
                      movieGenre={item.movieGenre}
                      movieLanguage={item.movieLanguage}
                      movieFormat={item.movieFormat}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <button className="arrow-button right" onClick={handleNextSlideMovie}>&gt;</button>
        </div>

        <div className="ad-banner">
          <div className="ad-content">
            <h1 className="ad-title">TICKETFLIX STREAM</h1>
            <p className="ad-text">Endless Entertainment Anytime. Anywhere!</p>
          </div>
        </div>

        {/* Event Slider Section */}
        <div className="arrow-slider-container-event">
          <button className="arrow-button-event left" onClick={handlePrevSlideEvent}>&lt;</button>
          <div className="slider-wrapper-event">
            <div className="slider-track-poster-event" style={{ transform: `translateX(-${eventCurrentSlide * 100}%)` }}>
              {data2.map(item => (
                <div key={item._id} className="slider-card-poster-event">
                  <Link to={`/eventdetails/${item._id}`} onClick={() => setID2(item._id, item.eventName, item.eventLanguage, item.eventVenue, item.eventDate, item.eventTime, item.eventType)}>
                    <EventCard
                      image={item.image}
                      eventName={item.eventName}
                      eventVenue={item.eventVenue}
                      eventType={item.eventType}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <button className="arrow-button-event right" onClick={handleNextSlideEvent}>&gt;</button>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default UserHome;
