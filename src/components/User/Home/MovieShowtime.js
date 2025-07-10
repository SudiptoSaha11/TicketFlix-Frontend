// src/components/User/Home/MovieShowtime.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DatePicker from "./DatePicker";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Modal from "react-modal";
import { FiClock, FiDollarSign, FiX } from "react-icons/fi";

Modal.setAppElement("#root");

// Professional seat icons
const seatIcons = [
  null,
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
  "https://cdn-icons-png.flaticon.com/512/6976/6976101.png",
];

const MovieShowtime = () => {
  const { state } = useLocation();
  const { movieName: Name, chosenLanguage } = state || {};
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [timeFilter, setTimeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [pendingShow, setPendingShow] = useState(null);
  const [hoveredCount, setHoveredCount] = useState(1);

  useEffect(() => {
    if (Name) fetchSchedules();
  }, [Name]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("https://ticketflix-backend.onrender.com/Scheduleschema");
      setSchedules(
        res.data.filter(
          (sch) => sch.MovieName?.toLowerCase() === Name.toLowerCase()
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load showtimes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t) => {
    let [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const getTimePeriod = (timeStr) => {
    const hr = +timeStr.split(":")[0];
    if (hr < 12 && hr >= 5) return "Morning";
    if (hr < 16) return "Afternoon";
    if (hr < 20) return "Evening";
    return "Night";
  };

  const priceMatch = ({
    GoldTicketPrice,
    SilverTicketPrice,
    PlatinumTicketPrice,
  }) => {
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
    setPendingShow({ Venue, timeStr, pricing });
    setHoveredCount(1);
    setIsCountModalOpen(true);
  };

  const handleSelectSeats = () => {
    setIsCountModalOpen(false);

    const bundle = {
      Name,
      Venue: pendingShow.Venue,
      Time: formatTime(pendingShow.timeStr),
      date: selectedDate.format("YYYY-MM-DD"),
      chosenLanguage,
      seats: [],
      totalAmount: 0,
      pricing: pendingShow.pricing,
    };
    sessionStorage.setItem("bookingDetails", JSON.stringify(bundle));

    navigate("/ticketbooking", {
      state: {
        Name,
        chosenLanguage,
        ...pendingShow,
        date: selectedDate.format("YYYY-MM-DD"),
        seatCount: hoveredCount,
      },
    });
  };

  const TIME_OPTIONS = ["All", "Morning", "Afternoon", "Evening", "Night"];
  const PRICE_OPTIONS = [
    { key: "All", label: "All Prices" },
    { key: "Below200", label: "₹0–₹200" },
    { key: "200to400", label: "₹201–₹400" },
    { key: "Above400", label: "₹401+" },
  ];

  const getPriceRange = () => {
    if (!pendingShow) return { min: 0, max: 0, isRange: false };
    const prices = [
      pendingShow.pricing.GoldTicketPrice,
      pendingShow.pricing.SilverTicketPrice,
      pendingShow.pricing.PlatinumTicketPrice,
    ];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, isRange: min !== max };
  };
  const { min, max, isRange } = getPriceRange();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Usernavbar />
      
      <main className="flex-grow max-w-screen-lg mx-auto mt-24 px-4 sm:px-6 md:px-8 font-sans">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-2">
            {Name}
            {chosenLanguage && <span className="text-orange-500"> — {chosenLanguage}</span>}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Select a date and time for your movie experience
          </p>
          <hr className="mb-6" />

          {/* Filters */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="w-full md:w-auto">
                <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiClock className="mr-2" /> Select Date
                </h2>
                <DatePicker onDateSelect={setSelectedDate} />
              </div>
              
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FiDollarSign className="mr-2" /> Filter By
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-gray-100 rounded-lg p-2 flex-1">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Show Time</h3>
                    <Swiper slidesPerView="auto" spaceBetween={8}>
                      {TIME_OPTIONS.map((opt) => (
                        <SwiperSlide key={opt} style={{ width: "auto" }}>
                          <button
                            onClick={() => setTimeFilter(opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              timeFilter === opt
                                ? "bg-orange-500 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {opt}
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-2 flex-1">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Price Range</h3>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_OPTIONS.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPriceFilter(key)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            priceFilter === key
                              ? "bg-orange-500 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={fetchSchedules}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : schedules.length ? (
            <div className="space-y-6">
              {schedules.map((sch) => (
                <div
                  key={sch._id}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  {sch.hallName.map((hall, i) => {
                    const raw = sch.showTime[i];
                    const showObj = Array.isArray(raw) ? raw[0] : raw;
                    if (!showObj?.time || !priceMatch(showObj)) return null;

                    const times = Array.isArray(showObj.time)
                      ? showObj.time
                      : [showObj.time];
                    const filtered =
                      timeFilter === "All"
                        ? times
                        : times.filter((t) => getTimePeriod(t) === timeFilter);
                    if (!filtered.length) return null;

                    return (
                      <div
                        key={i}
                        className="p-5 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start mb-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div className="ml-4">
                            <h2 className="text-xl font-bold text-gray-800">{hall}</h2>
                            <p className="text-gray-600 text-sm">Standard format • Reserved seating</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {filtered.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleShowtimeClick(hall, t, showObj)}
                              className="group relative px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm"
                            >
                              <span className="font-semibold">{formatTime(t)}</span>
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Recliner:</span>
                                  <span>₹{showObj.GoldTicketPrice}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Royal:</span>
                                  <span>₹{showObj.SilverTicketPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Club:</span>
                                  <span>₹{showObj.PlatinumTicketPrice}</span>
                                </div>
                                <div className="mt-2 text-xs text-green-600 font-medium">
                                  All seats available
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-10 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Showtimes Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any showtimes for {Name} on the selected date. 
                Please try another date or check back later.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Enhanced Seat Count Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onRequestClose={() => setIsCountModalOpen(false)}
        contentLabel="Select Seat Count"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up"
      >
        <div className="relative p-6">
          <button
            onClick={() => setIsCountModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <FiX size={24} />
          </button>

          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">How many seats?</h2>
            <p className="text-gray-600 mt-2">
              Select the number of tickets you need
            </p>
          </div>

          {/* Seat visualization */}
          <div className="flex justify-center my-6">
            <div className="bg-gray-100 rounded-2xl p-4 w-64 h-48 flex flex-col items-center justify-center">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {[...Array(hoveredCount)].map((_, idx) => (
                  <div key={idx} className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{idx + 1}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-gray-300 rounded-full mb-4"></div>
              <div className="text-sm text-gray-600">Screen this way</div>
            </div>
          </div>

          {/* Seat counter */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Number of seats:</span>
              <span className="text-xl font-bold text-orange-600">{hoveredCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={hoveredCount}
              onChange={(e) => setHoveredCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Pricing information */}
          {pendingShow && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Ticket Price:</span>
                <span className="font-bold text-gray-900">
                  {isRange ? `₹${min} - ₹${max}` : `₹${min}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="font-bold text-xl text-orange-600">
                  ₹{min * hoveredCount}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsCountModalOpen(false)}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectSeats}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
            >
              Select Seats
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MovieShowtime;