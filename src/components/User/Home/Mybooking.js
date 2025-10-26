import React, { useState, useEffect } from "react";
import Usernavbar from "./Usernavbar";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import api from "../../../Utils/api";

dayjs.extend(utc);
dayjs.extend(timezone);

const MyBooking = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
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

  // Detect screen size
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsLaptop(width > 1024);
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  const load = async () => {
    setLoading(true);

    try {
      const [{ data: allBookings }, res1, res2] = await Promise.all([
        api.get("/booking"),
        api.get("/movieview"),
        api.get("/event"),
      ]);

      const sortedBookings = allBookings
        .slice()
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

      setBookings(sortedBookings);
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

  useEffect(() => {
    const cleanupStale = async () => {
      const twoDaysAgo = dayjs().subtract(2, "day");
      const toDelete = bookings.filter(b => {
        const st = b.status?.toLowerCase();
        if (st !== "used" && st !== "rejected") return false;
        return dayjs.utc(b.bookingDate).local().isBefore(twoDaysAgo);
      });

      await Promise.all(
        toDelete.map(b =>
          api
            .delete(`/booking/delete/${b._id}`)
            .catch(err => console.error("Delete failed", b._id, err))
        )
      );

      if (toDelete.length > 0) {
        load();
      }
    };

    if (bookings.length) {
      cleanupStale();
    }
  }, [bookings]);

  const handleCardClick = async (id) => {
    try {
      const response = await api.get(`/booking/${id}`);
      setBookingDetails(response.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Failed to load booking details");
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
      await api.patch(`/booking/${booking._id}/cancel`);
      await load();
      setShowModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const filtered = bookings.filter(
    (b) => b.userEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase()
  );

  // 📱 Mobile version
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="max-w-3xl mx-2.5 py-6">
          <h1 className="text-2xl font-bold mb-6 text-center">My Bookings</h1>

          {filtered.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center py-48 overflow-y-hidden">
              <img alt="No bookings" src={require("./no bookings.jpeg")} />
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
              const match = movies.find((m) =>
                m.movieName === name || m.eventName === name
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
                  className={`bg-white rounded-xl shadow p-3 mb-6 transition-opacity cursor-pointer ${isCancelled ? "opacity-50" : ""
                    }`}
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Booked on:{" "}
                      {dayjs
                        .utc(booking.bookingDate)
                        .local()
                        .format("DD MMM, YYYY [at] hh:mm:ss A")}
                    </span>
                    <span className="bg-gray-200 px-2 rounded">M-Ticket</span>
                  </div>
                  <div className="flex gap-4">
                    <img
                      src={imageUrl || "https://via.placeholder.com/80x120"}
                      alt={name}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-1 pt-1.5">
                      <h2 className="font-semibold text-sm line-clamp-1">{name}</h2>
                      <p className="text-xs text-gray-500">
                        {booking.Language || "Hindi"}
                      </p>
                      <p className="text-sm font-medium">{booking.Time}</p>
                      <p className="text-xs text-gray-500">
                        {booking.Venue || "INOX: Star Mall, Madhyamgram"}
                      </p>
                      <p className="text-sm font-medium">
                        Tickets: {booking.seats?.join(", ") || "N/A"} • Screen {booking.screen || "1"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-gray-100 flex justify-start">
                    <span
                      className={`px-4 py-2 text-sm font-semibold rounded-md ${isCancelled
                        ? "bg-red-200 text-red-800"
                        : booking.status?.toLowerCase() === "finished"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-green-200 text-green-800"
                        }`}
                    >
                      {booking.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile Detail Modal */}
        {isDetailModalOpen && bookingDetails && (() => {
          const name =
            bookingDetails.movieName ||
            bookingDetails.eventName ||
            bookingDetails.Name;
          const match = movies.find((m) =>
            m.movieName === name || m.eventName === name
          );
          const imageUrl = match?.image
            ? match.image.startsWith("http")
              ? match.image
              : `https://ticketflix-backend.onrender.com/${match.image}`
            : "https://via.placeholder.com/80x120";

          return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-lg relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex items-center mb-4">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-16 h-24 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-[0px]">{name}</h3>
                    <p className="text-sm text-gray-500 mb-[0px]">
                      {bookingDetails.Language}
                    </p>
                    <p className="text-sm text-gray-500 mb-[0px]">
                      {bookingDetails.Time}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600 mb-5">
                  <div className="flex justify-between">
                    <span>Venue: {bookingDetails.Venue || "N/A"}</span>
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
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bookingDetails.status === "cancelled"
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
                <div className="flex justify-center mb-4">
                  <QRCodeCanvas
                    value={`https://ticketflix-official.netlify.app/qrprotectedpage/${bookingDetails._id}`}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                {bookingDetails.status !== "cancelled" &&
                  bookingDetails.status !== "used" &&
                  bookingDetails.status !== "rejected" && (
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

        {/* Mobile Cancel Confirmation */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg
                    className="h-8 w-8 text-red-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
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
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setIsDetailModalOpen(true);
                  }}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 💻 Laptop version
  // 💻 Laptop version
  if (isLaptop) {
    const formatBookingId = (id) => {
      if (!id) return "";
      const chars = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
      return chars.length < 7
        ? chars
        : `${chars.substring(0, 5)}${chars.substring(5, 6)}/${chars.slice(-2)}`;
    };

    const toMoney = (n) => `₹${Number(n || 0).toFixed(1).replace(/\.0$/, "")}`;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        <Usernavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Bookings</h1>
            <p className="mt-3 text-gray-600">Manage your upcoming and past bookings</p>
          </div>

          {/* Thank You Banner */}
          {showThankYou && filtered.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-700">
                Thank you for your purchase! Your booking is complete.
              </span>
            </div>
          )}

          {/* Bookings List */}
          {filtered.length > 0 ? (
            <div className="space-y-6">
              {filtered.map((booking) => {
                const name = booking.movieName || booking.eventName || booking.Name;
                const match = movies.find((m) => m.movieName === name || m.eventName === name);
                const imageUrl = match?.image?.startsWith("http")
                  ? match.image
                  : `https://ticketflix-backend.onrender.com/${match?.image}`;

                const isCancelled = booking.status?.toLowerCase() === "cancelled";

                return (
                  <div
                    key={booking._id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden border ${isCancelled
                        ? "border-gray-200 opacity-80"
                        : "border-gray-100 hover:shadow-lg transition-shadow"
                      }`}
                  >
                    <div className="p-6 grid grid-cols-12 gap-6">

                      {/* LEFT: Poster */}
                      <div
                        className="col-span-12 md:col-span-3 flex-shrink-0 cursor-pointer"
                        onClick={() => handleCardClick(booking._id)}
                      >
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

                      {/* MIDDLE: Details + breakdown */}
                      <div className="col-span-12 md:col-span-6 flex flex-col">
                        {/* Title */}
                        <div className="cursor-pointer" onClick={() => handleCardClick(booking._id)}>
                          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                          <div className="mt-1 text-gray-500 text-sm">
                            Booking ID: {formatBookingId(booking._id)}
                          </div>
                        </div>

                        {/* Quick facts */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Booking Date
                            </div>
                            <div className="mt-1 text-gray-700">
                              {dayjs.utc(booking.bookingDate).local().format("MMM D, YYYY")}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Venue
                            </div>
                            <div className="mt-1 text-gray-700">{booking.Venue}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Show-Time
                            </div>
                            <div className="mt-1 text-gray-700">{booking.Time}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Seats
                          </div>
                          <div className="mt-1 text-gray-700">
                            {Array.isArray(booking.seats) ? booking.seats.join(", ") : "N/A"}
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="mt-auto pt-4">
                          <div className="border-t border-gray-100" />
                          <div className="mt-4 max-w-md">
                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="flex justify-between">
                                <span>Ticket price</span>
                                <span className="font-medium">{toMoney(booking?.totals?.subtotal)}</span>
                              </div>

                              {booking?.totals?.foodTotal > 0 && (
                                <div className="flex justify-between">
                                  <span>Addons</span>
                                  <span className="font-medium">{toMoney(booking.totals.foodTotal)}</span>
                                </div>
                              )}

                              <div className="flex justify-between">
                                <span>Convenience Fee</span>
                                <span className="font-medium">{toMoney(booking.totals.convenienceFee.total)}</span>
                              </div>

                              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                                <span className="text-gray-800 font-semibold">Amount Paid</span>
                                <span className="text-black font-extrabold">
                                  {toMoney(booking?.totals?.finalPayable)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: Status + QR + Cancel */}
                      <div className="col-span-12 md:col-span-3 flex flex-col justify-between items-center">
                        {/* Status on top */}
                        <span
                          className={`self-end mb-4 px-3 py-1 rounded-full text-sm font-semibold ${isCancelled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                        >
                          {booking.status}
                        </span>

                        {/* QR centered */}
                        <div className="flex-1 flex flex-col justify-center items-center">
                          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <QRCodeCanvas
                              value={`https://ticketflix-official.netlify.app/qrprotectedpage/${booking?._id || ""}`}
                              size={120}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="H"
                            />
                          </div>
                          <div className="mt-2 text-sm text-gray-500">Scan QR code at venue</div>
                        </div>

                        {/* Cancel at bottom */}
                        {!["cancelled", "used", "rejected"].includes(booking.status?.toLowerCase()) && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="mt-6 w-full px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center"
                          >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h3 className="mt-6 text-xl font-medium text-gray-900">No bookings found</h3>
              <p className="mt-2 text-gray-500">
                You haven't made any bookings yet. Start by exploring our collection!
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
              >
                Browse Movies & Events
              </button>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal — unchanged */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg
                    className="h-8 w-8 text-red-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Cancel Booking?</h3>
                <p className="mt-2 text-gray-500">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => handleDelete(selectedBooking)}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }


  return null;
};

export default MyBooking;


