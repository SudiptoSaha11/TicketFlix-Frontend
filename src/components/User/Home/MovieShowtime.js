// MovieShowtime.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DatePicker from "./DatePicker";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import "./MovieShowtime.css";
import Footer from "./Footer";

const MovieShowtime = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get movieName and chosenLanguage passed via React Router location.state
  const {
    movieName: Name,
    chosenLanguage 
  } = location.state || {};

  // State
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [timeFilter, setTimeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // Fetch schedules on mount or when movieName changes
  useEffect(() => {
    if (Name) {
      fetchSchedules();
    } else {
      console.error("No movieName provided in location.state");
    }
  }, [Name]);

  // Get all schedules from server, filter for the correct movie
  const fetchSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/Scheduleschema");
      const filtered = response.data.filter(
        (schedule) =>
          schedule.MovieName &&
          schedule.MovieName.toLowerCase() === Name.toLowerCase()
      );
      setSchedules(filtered);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  // Format "HH:mm" to "hh:mm AM/PM"
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // Determine time period (Morning, Afternoon, Evening, Night) based on hour
  const getTimePeriod = (timeStr) => {
    const [hourStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 16) return "Afternoon";
    if (hour >= 16 && hour < 20) return "Evening";
    return "Night";
  };

  // Check if any of the ticket prices meet the selected price filter
  const priceMatchesFilter = (pricing) => {
    const { GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice } = pricing;
    const prices = [GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice];

    switch (priceFilter) {
      case "All":
        return true;
      case "Below200":
        return prices.some((p) => p < 200);
      case "200to400":
        return prices.some((p) => p >= 200 && p <= 400);
      case "Above400":
        return prices.some((p) => p > 400);
      default:
        return true;
    }
  };

  // Navigate to ticketbooking page with selected hall, time, and pricing
  const handleShowtimeClick = (Venue, timeStr, pricing) => {
    navigate("/ticketbooking", {
      state: {
        Name,
        chosenLanguage,
        Venue,
        Time: timeStr,
        pricing,
        date: selectedDate.format("YYYY-MM-DD"),
      },
    });
  };

  return (
    <div>
      <Usernavbar />
      <div className="movie-showtime-container">
        {/* Movie Details & Date Picker */}
        <section className="movie-showtime-header">
          <h1>{Name} - {chosenLanguage && `${chosenLanguage}`}</h1>
          <hr />
          <div className="showtime-filters">
            <DatePicker onDateSelect={(date) => setSelectedDate(date)} />

            {/* Dropdown Filters */}
            <div className="filters">
              <div className="dropdown-filter">
                <label htmlFor="timeFilter">Showtime: </label>
                <select
                  id="timeFilter"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div className="dropdown-filter">
                <label htmlFor="priceFilter">Price Range: </label>
                <select
                  id="priceFilter"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Below200">Below ₹200</option>
                  <option value="200to400">₹200-₹400</option>
                  <option value="Above400">Above ₹400</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Showtimes Listing */}
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div key={schedule._id} className="schedule-card">
              {schedule.hallName?.map((hall, hallIndex) => {
                const hallShowData = schedule.showTime?.[hallIndex];
                let showObj = Array.isArray(hallShowData) && hallShowData.length > 0
                  ? hallShowData[0]
                  : hallShowData || null;

                // Skip rendering if no valid showtimes
                if (!showObj?.time) {
                  return (
                    <div key={hallIndex} className="hall-schedule">
                      <h2>{hall}</h2>
                      <div className="showtime-list">
                        <span>No showtimes available</span>
                      </div>
                    </div>
                  );
                }


                // Filter prices based on user selection
                if (
                  !priceMatchesFilter({
                    GoldTicketPrice: showObj.GoldTicketPrice,
                    SilverTicketPrice: showObj.SilverTicketPrice,
                    PlatinumTicketPrice: showObj.PlatinumTicketPrice,
                  })
                ) {
                  return null;
                }

                // Convert showtimes into an array
                const timesArray = Array.isArray(showObj.time) ? showObj.time : [showObj.time];

                // Filter times based on morning/afternoon/evening/night
                const filteredTimes =
                  timeFilter === "All"
                    ? timesArray
                    : timesArray.filter((timeStr) => getTimePeriod(timeStr) === timeFilter);

                // Skip if no times match filter
                if (filteredTimes.length === 0) {
                  return null;
                }

                return (
                  <div key={hallIndex} className="hall-schedule">
                    {/* Flex container to keep Hall name & showtimes in one row */}
                    <div className="hall-header">
                      <h2 className="hall-name">{hall}</h2>
                      <div className="showtime-list">
                        {filteredTimes.map((timeStr, timeIndex) => (
                          <button
                            key={timeIndex}
                            className="showtime-button"
                            onClick={() =>
                              handleShowtimeClick(hall, timeStr, {
                                GoldTicketPrice: showObj.GoldTicketPrice,
                                SilverTicketPrice: showObj.SilverTicketPrice,
                                PlatinumTicketPrice: showObj.PlatinumTicketPrice,
                              })
                            }
                          >
                            {formatTime(timeStr)}
                            {/* Tooltip */}
                            <span className="tooltip">
                              <div><strong>Recliner:</strong> ₹{showObj.GoldTicketPrice}<div><strong className="available">Available</strong></div></div>
                              <div><strong>Royal:</strong> ₹{showObj.SilverTicketPrice}<div><strong className="available">Available</strong></div></div>
                              <div><strong>Club:</strong> ₹{showObj.PlatinumTicketPrice}<div><strong className="available">Available</strong></div></div>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cancellation info */}
                    <div className="cancellation-info">
                      <span className="bullet"></span>
                      Cancellation Available
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p>No showtimes available for this movie.</p>
        )}
      </div>
      <Footer />
    </div>

  );
};

export default MovieShowtime;
