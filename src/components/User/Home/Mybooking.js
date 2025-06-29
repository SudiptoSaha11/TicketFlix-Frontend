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

  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: allBookings }, res1, res2] = await Promise.all([
          axios.get("http://localhost:5000/booking"),
          axios.get("http://localhost:5000/movieview"),
          axios.get("http://localhost:5000/event"),
        ]);
        setBookings(allBookings);
        setMovies([...(res1.data || []), ...(res2.data || [])]);
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();

    if (localStorage.getItem("newBooking")) {
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        localStorage.removeItem("newBooking");
      }, 5000);
    }
  }, []);

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
            <div><img className="" alt="lawda mera" src={require("./no bookings.jpeg")}/></div>
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
                : `http://localhost:5000/${match.image}`
              : "";

            const isCancelled = booking.status?.toLowerCase() === "cancelled";

            return (
              <div
                key={booking._id}
                className={`bg-white rounded-xl shadow p-3 mb-6 space-y-4 transition-opacity ${
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
    </div>
  );
};

export default MyBooking;
