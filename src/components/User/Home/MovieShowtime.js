// src/components/User/Home/MovieShowtime.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DatePicker from "./DatePicker";
import DatePickerMobile from "./DatePickerMobile";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Modal from "react-modal";
import { FiClock, FiDollarSign, FiFilter, FiX } from "react-icons/fi";

Modal.setAppElement("#root");

// Icons for seat preview
const seatIcons = [
  null,
  "https://t3.ftcdn.net/jpg/01/17/76/26/360_F_117762685_qn25zluBo4fI4hnMYSvMAlxrzqbQIDrz.jpg",
  "https://png.pngtree.com/png-vector/20230107/ourmid/pngtree-flat-scooter-png-image_6554348.png",
  "https://st3.depositphotos.com/1782409/18327/v/450/depositphotos_183273454-stock-illustration-flat-vector-exotic-cartoon-three.jpg",
  "https://t4.ftcdn.net/jpg/02/13/75/05/360_F_213750591_6bVeg9sH1cD7wEvYhb2OUyHOesJzPtAL.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
];

const MovieShowtime = () => {
  // Get movie info passed via Link state
  const { state } = useLocation();
  const { movieName: Name, chosenLanguage, image: PosterFromState } = state || {};
  const navigate = useNavigate();

  // Poster URL state: first from state, fallback by fetching movie list and matching by ID in localStorage
  const [posterURL, setPosterURL] = useState(PosterFromState || "");

  useEffect(() => {
    if (!posterURL) {
      const movieId = localStorage.getItem("id");
      if (movieId) {
        axios
          .get("https://ticketflix-backend.onrender.com/movieview")
          .then((res) => {
            const mv = res.data.find((m) => m._id === movieId);
            if (mv?.image) setPosterURL(mv.image);
          })
          .catch((e) => console.error("Error fetching poster:", e));
      }
    }
  }, [posterURL]);

  // Schedule state
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));
  const [timeFilter, setTimeFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // Modal & seat count
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [pendingShow, setPendingShow] = useState(null);
  const [hoveredCount, setHoveredCount] = useState(1);

  // Fetch schedules for this movie
  useEffect(() => {
    if (Name) {
      axios
        .get("https://ticketflix-backend.onrender.com/Scheduleschema")
        .then((res) => {
          setSchedules(
            res.data.filter(
              (sch) => sch.MovieName?.toLowerCase() === Name.toLowerCase()
            )
          );
        })
        .catch((err) => console.error(err));
    }
  }, [Name]);

  // Helpers
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

  // Showtime click
  const handleShowtimeClick = (Venue, timeStr, pricing) => {
    setPendingShow({ Venue, timeStr, pricing });
    setHoveredCount(1);
    setIsCountModalOpen(true);
  };

  // Confirm seat count & navigate
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
  console.log(sessionStorage.getItem("bookingDetails"));

  // Filters
  const TIME_OPTIONS = ["All", "Morning", "Afternoon", "Evening", "Night"];
  const PRICE_OPTIONS = [
    { key: "All", label: "All" },
    { key: "Below200", label: "₹0–₹100" },
    { key: "200to400", label: "₹101–₹200" },
    { key: "Above400", label: "₹201–₹400" },
  ];

  // Price range in modal
  const { min, max, isRange } = (() => {
    if (!pendingShow) return { min: 0, max: 0, isRange: false };
    const vals = [
      pendingShow.pricing.GoldTicketPrice,
      pendingShow.pricing.SilverTicketPrice,
      pendingShow.pricing.PlatinumTicketPrice,
    ];
    const mn = Math.min(...vals),
      mx = Math.max(...vals);
    return { min: mn, max: mx, isRange: mn !== mx };
  })();

  return (
    <div className="min-h-screen">
      <Usernavbar />

      {/* Mobile View - Fixed container */}
      <div className="lg:hidden w-full max-w-screen-lg mx-auto mt-24 px-4 sm:px-6 md:px-4 font-sans overflow-x-hidden">

        {/* Title */}
        <h1 className="text-start text-2xl font-semibold text-gray-800 mb-4">
          {Name}
          <div className="mt-1">
            <span className="text-orange-500 text-sm">{chosenLanguage}</span>
            <span className="text-sm text-orange-500 ml-2">2D</span>
          </div>
        </h1>

        {/* Select Date */}
        <div className="mb-4 bg-white rounded-xl">
          <div className="flex items-start mb-1">
            <FiClock className="mr-2 text-gray-600 mt-[3px]" />
            <h2 className="text-sm font-semibold text-gray-700">Select Date</h2>
          </div>
          <DatePickerMobile onDateSelect={setSelectedDate} />
        </div>

        {/* Filter By */}
        <div className="rounded-xl mb-6">
          <div className="flex items-start mb-3">
            <FiFilter className="mr-2 text-gray-600 mt-[3px]" />
            <h2 className="text-sm font-semibold text-gray-700">Filter By</h2>
          </div>

          {/* Show Time - Fixed Swiper */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FiClock className="mr-2 text-gray-600 mb-[5px]" />
              <h3 className="text-sm font-medium text-gray-700">Show Time</h3>
            </div>
            <div className="w-full overflow-hidden">
              <Swiper 
                slidesPerView="auto" 
                spaceBetween={8} 
                className="!px-0 !mx-0"
                style={{ 
                  paddingLeft: 0, 
                  paddingRight: 0,
                  marginLeft: 0,
                  marginRight: 0 
                }}
              >
                {TIME_OPTIONS.map((opt) => (
                  <SwiperSlide key={opt} style={{ width: "auto" }}>
                    <button
                      onClick={() => setTimeFilter(opt)}
                      className={`px-3 py-1 rounded-full text-sm border ${timeFilter === opt
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
          </div>

          {/* Price Range - Fixed Swiper */}
          <div>
            <div className="flex items-center mb-2">
              <FiDollarSign className="mr-2 text-gray-600 mb-[6px]" />
              <h3 className="text-sm font-medium text-gray-700">Price Range</h3>
            </div>

            <div className="w-full overflow-hidden">
              <Swiper
                spaceBetween={8}
                slidesPerView="auto"
                freeMode={true}
                className="!px-0 !mx-0 pb-1"
                style={{ 
                  paddingLeft: 0, 
                  paddingRight: 0,
                  marginLeft: 0,
                  marginRight: 0 
                }}
              >
                {PRICE_OPTIONS.map(({ key, label }) => (
                  <SwiperSlide
                    key={key}
                    style={{ width: 'auto' }}
                    className="!inline-flex"
                  >
                    <button
                      onClick={() => setPriceFilter(key)}
                      className={`
                        px-3 py-1 rounded-full text-sm border whitespace-nowrap
                        ${priceFilter === key
                          ? 'bg-orange-400 text-white border-orange-400'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }
                      `}
                    >
                      {label}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>

        {/* Schedule List - Fixed container */}
        <div className="w-full">
          {schedules.length ? (
            schedules.map((sch) => (
              <div
                key={sch._id}
                className="border rounded-lg px-4 mb-3 shadow-sm bg-white w-full"
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
                      className="py-4 border-b last:border-b-0 w-full"
                    >
                      <h2 className="text-lg font-semibold mb-2">{hall}</h2>
                      <div className="flex flex-wrap gap-3 w-full">
                        {filtered.map((timeSlot, idx) => {
                          const uniqueKey = `${sch._id}-${hall}-${timeSlot}-${idx}`;
                          return (
                            <button
                              key={uniqueKey}
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                // Debug logging
                                console.log('Button clicked:', {
                                  hall,
                                  time: timeSlot,
                                  showObj,
                                  index: idx
                                });

                                // Call with explicit values
                                handleShowtimeClick(hall, timeSlot, showObj);
                              }}
                              className="group relative px-2 py-1.5 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition text-xs touch-manipulation"
                            >
                              {formatTime(timeSlot)}
                              <div
                                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-52 bg-white border rounded-lg shadow-lg p-2 text-xs text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                style={{ zIndex: 10 }}
                              >
                                <div>
                                  <strong>Recliner:</strong> ₹{showObj.GoldTicketPrice}{" "}
                                  <span className="text-green-500">Available</span>
                                </div>
                                <div>
                                  <strong>Royal:</strong> ₹{showObj.SilverTicketPrice}{" "}
                                  <span className="text-green-500">Available</span>
                                </div>
                                <div>
                                  <strong>Club:</strong> ₹{showObj.PlatinumTicketPrice}{" "}
                                  <span className="text-green-500">Available</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm w-full">
              No showtimes available.
            </p>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block max-w-screen-xl mx-44 w-full px-4 py-6 sm:px-6 lg:px-8 mt-16">
        {/* name and language div */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {Name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-1">
            {chosenLanguage && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                {chosenLanguage}
              </span>
            )}
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              2D
            </span>
          </div>
        </div>
        {/* image div */}
        <div className="flex flex-col lg:flex-row gap-1 ml-[-40px] mt-[15px]">
          {posterURL && (
            <div className="lg:w-[20rem] h-[22.3rem] flex justify-center">
              <img
                src={posterURL}
                alt={`${Name} Poster`}
                className="rounded-xl object-fit"
              />
            </div>
          )}

          <div className="lg:w-2/3 mt-[4px]">


            {/* Date & Filter Panel */}
            <div className="space-y-4">
              <div>
                <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-1">
                  <FiClock className="mr-2 text-xl text-gray-600" />
                  Select Date
                </h2>
                <div className="bg-white rounded-xl px-1">
                  <DatePicker onDateSelect={setSelectedDate} />
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl px-6 py-1 pshadow-sm">
                <div className="flex items-center ">
                  <FiFilter className="text-xl text-gray-600 mr-2 mb-[5px]" />
                  <h3 className="text-xl font-semibold text-gray-800">Filter By</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="flex items-center text-base font-medium text-gray-700 mb-2">
                      <FiClock className="mr-2 text-gray-600 mt-[2px]" />
                      Show Time
                    </h4>
                    <Swiper
                      slidesPerView="auto"
                      spaceBetween={12}
                      className="px-1"
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <SwiperSlide key={opt} style={{ width: 'auto' }}>
                          <button
                            onClick={() => setTimeFilter(opt)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${timeFilter === opt
                              ? "bg-orange-500 text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {opt}
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  <div>
                    <h4 className="flex items-center text-base font-medium text-gray-700 mb-2">
                      <FiDollarSign className="mr-2 text-gray-600 mt-[3px]" />
                      Price Range
                    </h4>
                    <div className="flex flex-wrap gap-3 pb-1.5">
                      {PRICE_OPTIONS.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPriceFilter(key)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${priceFilter === key
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
          </div>
        </div>

        {/* Schedule List */}
        <section className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Showtimes</h2>

          {schedules.length ? (
            schedules.map((sch) => (
              <div
                key={sch._id}
                className="bg-white rounded-xl shadow-md overflow-hidden mb-3 mr-[6.2rem] "
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
                    <div key={i} className="p-3 border-b last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 mb-[5px]"></div>
                        <h3 className="text-xl font-bold text-gray-900">{hall}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 ml-[1.3rem]">
                        {filtered.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleShowtimeClick(hall, t, showObj)}
                            className="group relative px-2.5 py-1 rounded-lg border-2 z-1000 border-green-400 text-green-400 hover:bg-green-400 transition-all duration-300 hover:text-white"
                          >
                            <span className="font-semibold text-sm  ">{formatTime(t)}</span>
                            {/* <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-left text-sm text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Recliner:</span>
                                <span>₹{showObj.GoldTicketPrice}</span>
                                <span className="text-green-500 font-medium">Available</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Royal:</span>
                                <span>₹{showObj.SilverTicketPrice}</span>
                                <span className="text-green-500 font-medium">Available</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Club:</span>
                                <span>₹{showObj.PlatinumTicketPrice}</span>
                                <span className="text-green-500 font-medium">Available</span>
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                            </div> */}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-xl text-gray-600">No showtimes available for this movie.</p>
              <p className="text-gray-500 mt-2">Please check back later or try another date.</p>
            </div>
          )}
        </section>
      </div>

      <Footer />

      {/* Seat-Count Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onRequestClose={() => setIsCountModalOpen(false)}
        contentLabel="How Many Seats?"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex max-lg:px-2 max-lg:mb-[-12px] max-lg:items-end lg:items-center justify-center lg:p-4 mt-20 z-50"
        className="max-lg:h-[23rem] max-lg:w-full max-lg:mx-1  bg-white rounded-2xl shadow-2xl lg:w-[30rem] mx-auto outline-none"
      >
        <div className="lg:p-6 max-lg:px-4 max-lg:py-2">
          <div className="flex justify-between items-center lg:mb-4 max-lg:mb-1">
            <h2 className="lg:text-2xl max-lg:text-xl font-bold text-gray-900 max-lg:font-semibold">How Many Seats?</h2>
            <button
              onClick={() => setIsCountModalOpen(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>

          <p className="text-gray-600 text-center lg:mb-2 max-lg:mb-[5px]">
            Book the best seats at no extra cost!
          </p>

          <div className="flex justify-center lg:mb-3 max-lg:mb-3">
            <div className="bg-white rounded-xl lg:p-4 lg:w-40 lg:h-40 max-lg:w-24 max-lg:h-24 max-lg:p-0 flex items-center justify-center">
              <img
                src={seatIcons[hoveredCount]}
                alt={`${hoveredCount} seats`}
                className="h-24 object-contain"
              />
            </div>
          </div>

          <div className="flex flex-nowrap justify-center gap-2 mb-7 ">
            {[...Array(10)].map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onMouseEnter={() => setHoveredCount(num)}
                  onClick={() => setHoveredCount(num)}
                  className={`
                    lg:w-9 lg:h-9 max-lg:w-7 max-lg:h-7 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all ${hoveredCount === num
                      ? "bg-orange-500 text-white scale-110"
                      : "bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {pendingShow && (
            <div className="bg-orange-50 rounded-xl lg:p-3 max-lg:p-2 lg:mb-6 max-lg:mb-4 border border-orange-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Ticket Price:</span>
                <span className="font-bold text-gray-900">
                  {isRange ? `₹${min}–₹${max}` : `₹${min}`}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSelectSeats}
            className="w-full bg-orange-500 text-white lg:py-3 max-lg:py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md"
          >
            Select Seats
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MovieShowtime;