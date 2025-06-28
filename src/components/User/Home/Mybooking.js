import React, { useState, useEffect } from "react"; 
import axios from "axios";
import Usernavbar from "./Usernavbar";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const MyBooking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const userEmail = localStorage.getItem("userEmail") || "";

  const formatTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("https://ticketflix-backend.onrender.com/booking");
      setBookings(data);
      console.log(bookings)
    } catch (err) {
      setError("Error fetching bookings");
    }
  };

  const fetchMoviesAndEvents = async () => {
    try {
      const [res1, res2] = await Promise.all([
        axios.get("https://ticketflix-backend.onrender.com/movieview"),
        axios.get("https://ticketflix-backend.onrender.com/event"),
      ]);
      setMovies([...(res1.data || []), ...(res2.data || [])]);
    } catch {
      setError("Error fetching movies and events");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchBookings();
        await fetchMoviesAndEvents();
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("newBooking")) {
      setShowThankYou(true);
      const timer = setTimeout(() => {
        setShowThankYou(false);
        localStorage.removeItem("newBooking");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/booking/${id}/cancel`);
      await fetchBookings();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (id) => {
    setSelectedBooking(id);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = bookings.filter(
    (b) => b.userEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Bookings</h1>
          <p className="mt-3 text-gray-600">
            Manage your upcoming and past bookings
          </p>
        </div>

        {showThankYou && filtered.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700">Thank you for your purchase! Your booking is complete.</span>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-6">
            {filtered.map((booking) => {
              const name = booking.movieName || booking.eventName || booking.Name;
              const match = movies.find(
                (m) => 
                  (m.movieName === name) ||
                  (m.eventName === name)
              );
              const imageUrl = match?.image
                ? match.image.startsWith("http")
                  ? match.image
                  : `https://ticketflix-backend.onrender.com/${match.image}`
                : "";

              return (
                <div 
                  key={booking._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                    booking.status?.toLowerCase() === "cancelled" 
                      ? "border-gray-200 opacity-80" 
                      : "border-gray-100 hover:shadow-lg transition-shadow"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Poster */}
                      <div className="flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-48 h-64 rounded-lg object-cover shadow"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-64 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Poster not available</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                            <div className="flex items-center mt-1">
                              <span className="text-gray-500 text-sm">
                                Booking ID: {booking._id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status?.toLowerCase() === "cancelled" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          

                          {/* Booking Info */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                              Booking Information
                            </h3>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <div>
                                  <span className="text-gray-600">Booking Date: </span>
                                  <span className="font-medium">
                                    {dayjs.utc(booking.bookingDate).local().format("MMM D, YYYY")}
                                  </span>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                  <span className="text-gray-600">Seats: </span>
                                  <span className="font-medium">
                                    {Array.isArray(booking.seats) && booking.seats.length > 0 
                                      ? booking.seats.join(", ") 
                                      : "N/A"}
                                  </span>
                                </div>
                              </li>
                              <li className="flex items-start">
                                <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <span className="text-gray-600">Total Amount: </span>
                                  <span className="font-bold text-indigo-600">₹{booking.totalAmount}</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center">
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                              <QRCodeCanvas 
                                value={JSON.stringify(booking)} 
                                size={80} 
                                bgColor={"#ffffff"}
                                fgColor={"#4f46e5"}
                                level={"H"}
                              />
                            </div>
                            <div className="ml-4 text-sm text-gray-500">
                              Scan QR code at venue
                            </div>
                          </div>
                          
                          {booking.status?.toLowerCase() !== "cancelled" && (
                            <button
                              onClick={() => openModal(booking._id)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all shadow-sm flex items-center"
                            >
                              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto max-w-md">
              <svg className="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-6 text-xl font-medium text-gray-900">No bookings found</h3>
              <p className="mt-2 text-gray-500">
                You haven't made any bookings yet. Start by exploring our collection!
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Browse Movies & Events
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Cancel Booking?</h3>
              <div className="mt-2">
                <p className="text-gray-500">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleDelete(selectedBooking)}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes, Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;