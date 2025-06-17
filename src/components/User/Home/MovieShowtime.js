// MovieShowtime.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DatePicker from "./DatePicker";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";


const MovieShowtime = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Movie name & language from router state
  const { movieName: Name, chosenLanguage } = location.state || {};

  // Component state
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [timeFilter, setTimeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // Fetch schedules when movie name changes
  useEffect(() => {
    if (Name) fetchSchedules();
    else console.error("No movieName provided in location.state");
  }, [Name]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get("https://ticketflix-backend.onrender.com/Scheduleschema");
      const filtered = response.data.filter(
        (sch) => sch.MovieName?.toLowerCase() === Name.toLowerCase()
      );
      setSchedules(filtered);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(":");
    h = parseInt(h, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const getTimePeriod = (timeStr) => {
    const hour = parseInt(timeStr.split(":")[0], 10);
    if (hour < 12 && hour >= 5) return "Morning";
    if (hour < 16) return "Afternoon";
    if (hour < 20) return "Evening";
    return "Night";
  };

 const TIME_OPTIONS = ["All", "Morning", "Afternoon", "Evening", "Night"];
const PRICE_OPTIONS = [
  { key: "All", label: "All" },
  { key: "Below200", label: "₹0–₹100" },
  { key: "200to400", label: "₹101–₹200" },
  { key: "Above400", label: "₹201–₹400" },
];

  const priceMatch = ({ GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice }) => {
    const arr = [GoldTicketPrice, SilverTicketPrice, PlatinumTicketPrice];
    switch (priceFilter) {
      case "Below200":
        return arr.some((p) => p < 200);
      case "200to400":
        return arr.some((p) => p >= 200 && p <= 400);
      case "Above400":
        return arr.some((p) => p > 400);
      default:
        return true;
    }
  };

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
      <div className="max-w-screen-lg mx-auto mt-24 px-4 sm:px-6 md:px-20 lg:px-44 font-sans">
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          {Name} {chosenLanguage && `- ${chosenLanguage}`}
        </h1>

        {/* Filters */}
        <section className="flex flex-col gap-4 sm:gap-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DatePicker onDateSelect={setSelectedDate} />
            {/* TIME FILTER (Swiper) */}
<div className="mb-3">
  <Swiper
    slidesPerView="auto"
    spaceBetween={8}
    className="!px-0 pb-2"
  >
    {TIME_OPTIONS.map((opt) => (
      <SwiperSlide key={opt} style={{ width: "auto" }}>
        <button
          onClick={() => setTimeFilter(opt)}
          className={`px-3 py-1 rounded-full text-sm border ${
            timeFilter === opt
              ? "bg-orange-400 text-white border-orange-400"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {opt}
        </button>
      </SwiperSlide>
    ))}
  </Swiper>
</div>


          {/* Price Chips */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {PRICE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPriceFilter(key)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-sm border ${
                    priceFilter === key
                      ? "bg-orange-400 text-white border-orange-400"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* Schedule Cards */}
        {schedules.length ? (
          schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="border border-gray-200 rounded-lg p-4 mb-5 shadow-sm"
            >
              {schedule.hallName?.map((hall, i) => {
                const raw = schedule.showTime?.[i];
                const showObj = Array.isArray(raw) ? raw[0] : raw;

                if (!showObj?.time) {
                  return (
                    <div key={i} className="py-4 border-b last:border-b-0">
                      <h2 className="text-lg font-bold text-gray-800 mb-2">
                        {hall}
                      </h2>
                      <p className="text-gray-600">
                        No showtimes available
                      </p>
                    </div>
                  );
                }

                if (!priceMatch(showObj)) return null;

                const times = Array.isArray(showObj.time)
                  ? showObj.time
                  : [showObj.time];
                const filtered =
                  timeFilter === "All"
                    ? times
                    : times.filter((t) => getTimePeriod(t) === timeFilter);
                if (!filtered.length) return null;

                return (
                  <div key={i} className="py-4 border-b last:border-b-0">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">
                      {hall}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {filtered.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleShowtimeClick(hall, t, showObj)}
                          className="group relative px-3 py-2 rounded-lg border border-green-500 text-green-500 whitespace-nowrap hover:bg-green-500 hover:text-white transition"
                        >
                          {formatTime(t)}
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                            <div>
                              <strong>Recliner:</strong> ₹
                              {showObj.GoldTicketPrice}{" "}
                              <span className="text-green-500">
                                Available
                              </span>
                            </div>
                            <div>
                              <strong>Royal:</strong> ₹
                              {showObj.SilverTicketPrice}{" "}
                              <span className="text-green-500">
                                Available
                              </span>
                            </div>
                            <div>
                              <strong>Club:</strong> ₹
                              {showObj.PlatinumTicketPrice}{" "}
                              <span className="text-green-500">
                                Available
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                      Cancellation Available
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No showtimes available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MovieShowtime;