import React, { useState, useEffect } from "react";
import axios from "axios";
import Usernavbar from "./Usernavbar";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const MyBooking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const userEmail = localStorage.getItem("userEmail") || "";

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: allBookings }, res1, res2] = await Promise.all([
        axios.get("https://ticketflix-backend.onrender.com/booking"),
        axios.get("https://ticketflix-backend.onrender.com/movieview"),
        axios.get("https://ticketflix-backend.onrender.com/event"),
      ]);
      setBookings(allBookings);
      setMovies([...(res1.data || []), ...(res2.data || [])]);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    if (localStorage.getItem("newBooking")) {
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        localStorage.removeItem("newBooking");
      }, 5000);
    }
  }, []);

  const handleCardClick = async (id) => {
    try {
      const response = await axios.get(`https://ticketflix-backend.onrender.com/booking/${id}`);
      setBookingDetails(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
    }
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setBookingDetails(null);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async (booking) => {
    try {
      await axios.delete(`https://ticketflix-backend.onrender.com/booking/${booking._id}`);
      // Refresh bookings after cancellation
      await load();
      setShowModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const filtered = bookings.filter(
    (b) => b.userEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="max-w-3xl mx-2.5 py-6 ">
        <h1 className="text-2xl font-bold mb-6 text-center">My Bookings</h1>

        {showThankYou && (
          <div className="bg-green-100 border border-green-300 p-4 mb-4 rounded">
            ✅ Thank you! Your booking is confirmed.
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center py-48">
            <div><img className="" alt="No bookings" src={require("./no bookings.jpeg")}/></div>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            >
              Browse Movies & Events
            </button>
          </div>
        ) : (
          filtered.map((booking) => {
            const name = booking.movieName || booking.eventName || booking.Name;
            const match = movies.find(
              (m) => m.movieName === name || m.eventName === name
            );
            const imageUrl = match?.image
              ? match.image.startsWith("http")
                ? match.image
                : `https://ticketflix-backend.onrender.com/${match.image}`
              : "";

            const isCancelled = booking.status?.toLowerCase() === "cancelled";

            return (
              <div
                key={booking._id}
                onClick={() => handleCardClick(booking._id)}
                className={`bg-white rounded-xl shadow p-3 mb-6 space-y-4 transition-opacity cursor-pointer ${
                  isCancelled ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between h-[18px] ">
                <p className="text-xs text-gray-500">
                  Ordered on:{" "}
                  {dayjs.utc(booking.bookingDate).local().format(
                    "DD MMM, YYYY [at] hh:mm:ss A"
                  )}
                </p>
                <span className="text-xs bg-gray-200 px-2 rounded">
                        M-Ticket
                </span>
                </div>
                <div className="flex gap-4">
                  <img
                    src={imageUrl || "https://via.placeholder.com/80x120"}
                    alt={name}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-1 pt-1.5 ">
                    <div className="flex justify-between items-start flex-nowrap">
                      <h2 className="font-semibold text-sm line-clamp-1">{name}</h2>
                    </div>
                    <p className="text-xs text-gray-500">
                      {booking.language || "Hindi"}, {booking.type || "2D"}
                    </p>
                    <p className="text-sm font-medium">
                      {dayjs(booking.showTime).format("ddd, DD MMM | h:mm A")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.venue || "INOX: Star Mall, Madhyamgram"}
                    </p>
                    <p className="text-sm font-medium">
                      Tickets: {booking.seats?.join(", ") || "N/A"} • Screen{" "}
                      {booking.screen || "1"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Status badge in place of Cancel button */}
                  <div
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${
                      isCancelled
                        ? "bg-red-200 text-red-800"
                        : booking.status?.toLowerCase() === "finished"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {booking.status?.toUpperCase() || "UNKNOWN"}
                  </div>

                  {/* QR (hidden on phones) */}
                  <div className="hidden xl:flex flex-col items-center">
                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                      <QRCodeCanvas
                        value={JSON.stringify(booking)}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#4f46e5"
                        level="H"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      Scan QR code at venue
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ====== Booking Details Modal (only this popup changed) ====== */}
      {isDetailModalOpen && bookingDetails && (() => {
        const name = bookingDetails.movieName || bookingDetails.eventName || bookingDetails.Name;
        const match = movies.find(
          (m) => m.movieName === name || m.eventName === name
        );
        const imageUrl = match?.image
          ? match.image.startsWith("http")
            ? match.image
            : `https://ticketflix-backend.onrender.com/${match.image}`
          : "https://via.placeholder.com/80x120";

        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-lg relative">
              {/* Close Icon */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Header */}
              <div className="flex items-center mb-4">
                <img src={imageUrl}
                     alt={name}
                     className="w-16 h-24 rounded-lg object-cover mr-4"/>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dayjs(bookingDetails.showTime).format("ddd, DD MMM | h:mm A")}
                  </p>
                </div>
              </div>

              {/* Info Blocks */}
              <div className="space-y-3 text-sm text-gray-600 mb-5">
                <div className="flex justify-between">
                  <span className="font-medium">Venue</span>
                  <span>{bookingDetails.venue || "INOX: Star Mall, Madhyamgram"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Screen</span>
                  <span>{bookingDetails.screen || "1"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Seats</span>
                  <span>{bookingDetails.seats?.join(", ") || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      bookingDetails.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : bookingDetails.status === "finished"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {bookingDetails.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <QRCodeCanvas
                  value={JSON.stringify(bookingDetails)}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#1f2937"
                  level="H"
                />
              </div>

              {/* Cancel Button */}
              {bookingDetails.status?.toLowerCase() !== "cancelled" &&
               bookingDetails.status?.toLowerCase() !== "finished" && (
                <button
                  onClick={() => handleCancelClick(bookingDetails)}
                  className="w-full py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Cancel Confirmation Modal (unchanged) */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Cancel Booking?</h3>
              <p className="mt-2 text-gray-500">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleDelete(selectedBooking)}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsDetailModalOpen(true);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;