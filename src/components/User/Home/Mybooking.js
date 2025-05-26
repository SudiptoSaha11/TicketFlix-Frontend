import React, { useState, useEffect } from "react"; 
import axios from "axios";
import "../Home/Mybookings.css";
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
  console.log("Logged in user's email:", userEmail);

  const formatTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/booking");
      console.log("Fetched bookings:", response.data);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Error fetching bookings");
    }
  };

  // Fetch movies and events data from backend
  const fetchMoviesAndEvents = async () => {
    try {
      const response1 = await axios.get("http://localhost:5000/movieview");
      const response2 = await axios.get("http://localhost:5000/event");
      // Combine both API responses into a single array
      const combinedMovies = [
        ...(response1.data || []),
        ...(response2.data || []),
      ];
      console.log("Fetched movies and events:", combinedMovies);
      setMovies(combinedMovies);
    } catch (error) {
      console.error("Error fetching movies and events:", error);
      setError("Error fetching movies and events");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchBookings();
      await fetchMoviesAndEvents();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const flag = localStorage.getItem("newBooking");
    if (flag) {
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
      await axios.patch(`http://localhost:5000/booking/${id}/cancel`);
      fetchBookings();
      closeModal();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const openModal = (bookingId) => {
    setSelectedBooking(bookingId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Filter bookings for logged-in user using userEmail
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter(
        (booking) =>
          booking.userEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase()
      )
    : [];

  return (
    <div className="my-bookings">
      <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {showThankYou && filteredBookings.length > 0 && (
        <div className="thank-you-message_booking">
          <p>Thank you for your purchase! Your booking is complete.</p>
        </div>
      )}

      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => {
          // Determine booking name: it can be either movieName or eventName
          const bookingName = booking.Name || booking.Name;
          // Find the matching movie/event based on the bookingName
          const matchedItem = movies.find(
            (m) =>
              (m.movieName && m.movieName === bookingName) ||
              (m.eventName && m.eventName === bookingName)
          );

          // Construct image URL: if image starts with http, use it; otherwise prepend backend URL
          const imageUrl =
            matchedItem && matchedItem.image
              ? matchedItem.image.startsWith("http")
                ? matchedItem.image
                : `http://localhost:5000/${matchedItem.image}`
              : "";

          return (
            <div className="card_booking" key={booking._id}>
              <div className="card-content_booking">
                <div className="top-container">
                  <h1 className="booking-moviename">
                    <strong>{bookingName}</strong>
                  </h1>
                </div>
                <div className="bottom-container">
                  <div className="left-container">
                    <div className="movie-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={bookingName}
                          className="movie-poster"
                        />
                      ) : (
                        <p>Loading poster...</p>
                      )}
                    </div>
                    <div className="hall-showtime-booking">
                      {booking.hall && <p>Hall: {booking.hall}</p>}
                      {booking.eventVenue && <p>Venue: {booking.eventVenue}</p>}
                      {booking.showTime && (
                        <p>Show Time: {formatTime(booking.showTime)}</p>
                      )}
                      {booking.eventTime && (
                        <p>Event Time: {formatTime(booking.eventTime)}</p>
                      )}
                    </div>
                  </div>

                  <div className="middle-container">
                    <div className="seats-booked_booking">
                      <h4 className="seat-h4">Seats Booked:</h4>
                      {Array.isArray(booking.seats) && booking.seats.length > 0 ? (
                        <p>Seat Number: {booking.seats.join(", ")}</p>
                      ) : (
                        <p>No seats booked.</p>
                      )}
                    </div>

                    <h1
                      className={
                        booking.status?.trim().toLowerCase() === "cancelled"
                          ? "cancelled-ticket"
                          : "active-ticket"
                      }
                    >
                      Status: {booking.status}
                    </h1>

                    <p>Total Amount: ₹{booking.totalAmount}</p>
                    <p>
                      Booking Date:{" "}
                      {dayjs
                        .utc(booking.bookingDate)
                        .local()
                        .format("MM/DD/YYYY")}
                    </p>
                  </div>

                  <div className="right-container">
                    <div className="qr-code">
                      <QRCodeCanvas value={JSON.stringify(booking)} size={128} />
                    </div>
                  </div>
                </div>

                {booking.status?.trim().toLowerCase() !== "cancelled" && (
                  <button
                    className="delete-btn_booking"
                    onClick={() => openModal(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="nobooking">
          <img
            src={require("./norecord.png")}
            alt="no-booking"
            className="nobooking"
          />
          <p>No bookings found.</p>
        </div>
      )}

      {showModal && (
        <div className="cancel-popup">
          <p>Are you sure you want to cancel this booking?</p>
          <div>
            <button
              className="confirm-btn_booking"
              onClick={() => handleDelete(selectedBooking)}
            >
              Yes
            </button>
            <button className="cancel-btn_booking" onClick={closeModal}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;
