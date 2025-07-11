// src/components/User/Home/MovieShowtime.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DatePicker from "./DatePicker";
import DatePickerMobile from "./DatePickerMobile";  // ← new import
import axios from "axios";
import Usernavbar from "./Usernavbar";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Modal from "react-modal";
import { FiClock, FiDollarSign, FiFilter } from "react-icons/fi";

Modal.setAppElement("#root");

// Replace these URLs with your own icons
const seatIcons = [ /* … */];

const MovieShowtime = () => {
  const { state } = useLocation();
  const { movieName: Name, chosenLanguage } = state || {};
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      "Retrieved bookingDetails:",
      sessionStorage.getItem("bookingDetails")
    );
  }, []);

  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [timeFilter, setTimeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // seat-count modal state
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [pendingShow, setPendingShow] = useState(null);
  const [hoveredCount, setHoveredCount] = useState(1);

  useEffect(() => {
    if (Name) fetchSchedules();
  }, [Name]);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        "https://ticketflix-backend.onrender.com/Scheduleschema"
      );
      setSchedules(
        res.data.filter(
          (sch) => sch.MovieName?.toLowerCase() === Name.toLowerCase()
        )
      );
    } catch (err) {
      console.error(err);
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
    console.log(
      "Just set bookingDetails:",
      sessionStorage.getItem("bookingDetails")
    );

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
    { key: "All", label: "All" },
    { key: "Below200", label: "₹0–₹100" },
    { key: "200to400", label: "₹101–₹200" },
    { key: "Above400", label: "₹201–₹400" },
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
    <div className="max-h-full">
      <Usernavbar />
      <div className="max-w-screen-lg mx-auto mt-[5rem] pl-[1rem] sm:px-6 md:px-20 lg:px-44 font-sans lg:mt-24 ">
        <div>
          <h1 className="text-left text-2xl font-semibold text-gray-800 mb-4 lg:text-left lg:text-3xl">
            {Name}
            <span className="text-orange-500 max-lg:hidden">
              {chosenLanguage && ` — ${chosenLanguage}`}
            </span>
            <div className="lg:hidden mt-[-10px] ml-[1px]">
              <span className="text-orange-500 text-sm">
                {chosenLanguage}
              </span>
              <span className="text-sm text-orange-500"> 2D</span>
            </div>
          </h1>
        </div>

        {/* Filters */}
        <section className="mb-6">
          {/* ─── SELECT DATE ─────────────────────────────────────────────────────────── */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiClock className="mr-1 mt-[3px]" /> Select Date
            </h2>

            <div className="max-lg:w-[380px]">
              {/* Mobile slider */}
              <div className="lg:hidden ml-[-10px]">
                <DatePickerMobile onDateSelect={setSelectedDate} />
              </div>
              {/* Desktop arrows */}
              <div className="hidden lg:block">
                <DatePicker onDateSelect={setSelectedDate} />
              </div>
            </div>
          </div>

          {/* ─── FILTER PANEL ────────────────────────────────────────────────────────── */}
          <div className="lg:bg-gray-100 rounded-lg lg:p-4 ">
            {/* Panel header */}
            <div className="flex items-center mb-3">
              <FiFilter className="text-xl text-gray-600 mr-2 mb-[5px]" />
              <h3 className="text-lg font-semibold text-gray-700">Filter By</h3>
            </div>

            <div className="space-y-6">
              {/* Show Time */}
              <div className="max-w-[350px]">
                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="mr-1 mt-[2px]" /> Show Time
                </h4>
                <Swiper
                  slidesPerView="auto"
                  spaceBetween={8}
                  className="px-1 py-1"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <SwiperSlide key={opt} style={{ width: 'auto' }}>
                      <button
                        onClick={() => setTimeFilter(opt)}
                        className={`px-3 py-1 rounded-full text-sm border ${timeFilter === opt
                          ? 'bg-orange-400 text-white border-orange-400'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {opt}
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiDollarSign className="mr-1 mt-[2px]" /> Price Range
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PRICE_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setPriceFilter(key)}
                      className={`px-3 py-1 rounded-full text-sm border ${priceFilter === key
                        ? 'bg-orange-400 text-white border-orange-400'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>



      </div>
      {/* Schedule List */}
      <section className="mx-auto px-3 ">
        {schedules.length ? (
          schedules.map((sch) => (
            <div
              key={sch._id}
              className="border rounded-lg px-4 mb-5 shadow-sm lg:mx-[25rem]"
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
                    className="py-4 border-b last:border-b-0"
                  >
                    <h2 className="text-lg font-semibold lg:font-bold mb-2">{hall}</h2>
                    <div className="flex flex-wrap gap-3">
                      {filtered.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleShowtimeClick(hall, t, showObj)
                          }
                          className="group relative max-lg:px-2 max-lg:py-1 xl:px-3 xl:py-2 rounded-lg border max-lg:text-xs lg:text-md border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
                        >
                          {formatTime(t)}
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-52 bg-white border rounded-lg shadow-lg p-2 text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No showtimes available.
          </p>
        )}
      </section>

      <Footer />

      {/* Enhanced Seat-Count Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onRequestClose={() => setIsCountModalOpen(false)}
        contentLabel="How Many Seats?"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        className="
          fixed bottom-0 left-0 w-full bg-white p-4 
          sm:relative sm:bottom-auto sm:left-auto sm:w-auto sm:max-w-md sm:rounded-xl sm:mx-auto sm:p-6
          z-50 animate-fade-in-up xl:my-28
        "
      >
        <div className="relative">
          <button
            onClick={() => setIsCountModalOpen(false)}
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-800 text-2xl"
          >
            ×
          </button>

          <h2 className="text-center text-xl font-bold mb-4">
            How Many Seats?
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Book the Bestseller Seats at no extra cost!
          </p>

          <div className="flex justify-center mb-0">
            <div className="rounded-xl p-4 flex items-center justify-center">
              <img
                src={seatIcons[hoveredCount]}
                alt={`${hoveredCount} seats`}
                className="h-[110px] object-contain"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
            {[...Array(10)].map((_, idx) => {
              const num = idx + 1;
              return (
                <div
                  key={num}
                  onMouseEnter={() => setHoveredCount(num)}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    border-2 cursor-pointer transition-all duration-200
                    ${hoveredCount === num
                      ? "bg-orange-400 border-orange-500 text-white scale-110"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {num}
                </div>
              );
            })}
          </div>

          {pendingShow && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">
                  Ticket Price:
                </span>
                <span className="font-bold text-gray-900">
                  {isRange ? `₹${min} - ₹${max}` : `₹${min}`}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSelectSeats}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-orange-500 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            Select Seats
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MovieShowtime;
