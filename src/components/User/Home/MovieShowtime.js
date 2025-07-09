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

Modal.setAppElement("#root");

// Replace these URLs with your own icons
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
  const { state } = useLocation();
  const { movieName: Name, chosenLanguage } = state || {};
  const navigate = useNavigate();

  // Log whatever is in sessionStorage under "bookingDetails"
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
      const res = await axios.get("https://ticketflix-backend.onrender.com/Scheduleschema");
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

  // open seat-count modal
  const handleShowtimeClick = (Venue, timeStr, pricing) => {
    setPendingShow({ Venue, timeStr, pricing });
    setHoveredCount(1);
    setIsCountModalOpen(true);
  };

  // final redirect + sessionStorage bundle
  const handleSelectSeats = () => {
    setIsCountModalOpen(false);

    // STORE the full booking bundle here:
    const bundle = {
      Name,
      Venue: pendingShow.Venue,
      Time: formatTime(pendingShow.timeStr),
      date: selectedDate.format("YYYY-MM-DD"),
      chosenLanguage,
      seats: [], // none selected yet
      totalAmount: 0, // start at zero
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

  // Calculate ticket price range for display in modal
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
    <div>
      <Usernavbar />
      <div className="max-w-screen-lg mx-auto mt-24 px-4 sm:px-6 md:px-20 lg:px-44 font-sans">
        <h1 className="text-center text-3xl font-semibold text-gray-800 mb-4">
          {Name}
          {chosenLanguage && ` — ${chosenLanguage}`}
        </h1>
        <hr />

        {/* Filters */}
        <section className="mb-6">
          <div className="max-lg:px-4 max-lg:w-[370px]"><DatePicker onDateSelect={setSelectedDate} /></div>
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            <div className="flex-1 overflow-x-auto pb-2">
              <Swiper slidesPerView="auto" spaceBetween={8}>
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
            <div className="flex space-x-2 overflow-x-auto">
              {PRICE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPriceFilter(key)}
                  className={`px-3 py-1 rounded-full text-sm border ${
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
        </section>

        {/* Schedule List */}
        {schedules.length ? (
          schedules.map((sch) => (
            <div
              key={sch._id}
              className="border rounded-lg p-4 mb-5 shadow-sm"
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
                    <h2 className="text-lg font-bold mb-2">{hall}</h2>
                    <div className="flex flex-wrap gap-3">
                      {filtered.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleShowtimeClick(hall, t, showObj)
                          }
                          className="group relative px-3 py-2 rounded-lg border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
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
      </div>

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
          {/* Close button */}
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

          {/* Icon changes on hover */}
          <div className="flex justify-center mb-0">
            <div className="rounded-xl p-4 flex items-center justify-center">
              <img
                src={seatIcons[hoveredCount]}
                alt={`${hoveredCount} seats`}
                className="h-[110px] object-contain"
              />
            </div>
          </div>

          {/* Hoverable seat circles */}
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
                    ${
                      hoveredCount === num
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

          {/* Pricing Information */}
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

          {/* Select button */}
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
