// src/pages/EventSuccess.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const BACKEND = process.env.REACT_APP_BACKEND_BASE || 'https://ticketflix-backend.onrender.com';

const EventSuccess = () => {
  const [bookingMessage, setBookingMessage] = useState('Processing your booking...');
  const [processing, setProcessing] = useState(true);
  const hasPosted = useRef(false);

  // Attempt to POST booking details from sessionStorage or recover via server using session_id
  useEffect(() => {
    if (hasPosted.current) return;
    hasPosted.current = true;

    const run = async () => {
      try {
        // 1) Try sessionStorage first (fast path)
        const raw = sessionStorage.getItem('bookingDetails');
        if (raw) {
          let booking;
          try {
            booking = JSON.parse(raw);
          } catch (err) {
            console.warn('bookingDetails parse failed:', err);
            sessionStorage.removeItem('bookingDetails'); // cleanup corrupted data
          }
          if (booking) {
            setBookingMessage('Saving your booking...');
            console.log('Posting booking from sessionStorage:', booking);
            await postBookingToBackend(booking);
            return;
          }
        }

        // 2) Fall back: try to recover booking from Stripe session id in URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id') || params.get('checkout_session_id') || params.get('sessionId');

        if (!sessionId) {
          setBookingMessage('No booking details found and no Stripe session id present.');
          setProcessing(false);
          return;
        }

        setBookingMessage('Recovering booking details from payment provider...');
        console.log('Attempting server-side recovery with session id:', sessionId);

        // Call backend endpoint to recover and persist booking using stripe session metadata.
        // Expectation: backend will call Stripe with secret key, read session.metadata.bookingDetails, then save.
        const resp = await axios.post(`${BACKEND}/booking/recover-from-session`, { sessionId });

        console.log('Recovery response:', resp.data);
        if (resp.status === 200 && resp.data && resp.data.saved) {
          setBookingMessage('Your event booking has been confirmed! 🎉');
          sessionStorage.setItem('bookingProcessed', 'true');
        } else {
          const serverMsg = resp.data && resp.data.message ? resp.data.message : 'Unknown server response';
          console.warn('Recover-from-session did not save:', serverMsg);
          setBookingMessage('Failed to recover booking. Please contact support.');
        }
      } catch (err) {
        console.error('Error saving/recovering booking:', err.response?.data || err.message || err);
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
        setBookingMessage(`Failed to save booking: ${msg}`);
      } finally {
        setProcessing(false);
      }
    };

    run();
  }, []);

  // redirect back to home after 6s (give user time to read)
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-center">
      <DotLottieReact
        className="xl:h-64"
        src="https://lottie.host/f1eda73d-08bd-4a89-bec9-e095f1656329/e3KpA92vAb.lottie"
        loop
        autoplay
        style={{ width: 200, height: 200 }}
      />

      <h1 className="text-2xl sm:text-4xl font-bold text-green-600 mb-3 animate-bounce">Booking Successful!</h1>

      <p className="text-base sm:text-lg text-gray-700 mb-6">{bookingMessage}</p>

      {!processing && (
        <button
          onClick={() => (window.location.href = '/')}
          className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-6 py-2 rounded-md transition duration-300"
        >
          Back to Home
        </button>
      )}
    </div>
  );
};

async function postBookingToBackend(booking) {
  // adapt path as needed for your backend; this uses your existing /booking/add
  const url = `${process.env.REACT_APP_BACKEND_BASE || 'https://ticketflix-backend.onrender.com'}/booking/add`;
  // normalize payload same as you already used
  const seats = Array.isArray(booking.seatsBooked)
    ? booking.seatsBooked.map(s => (typeof s === 'string' ? s : s.seatNumber))
    : [];

  const payload = {
    userEmail: booking.userEmail,
    Name: booking.eventName || booking.Name || booking.name,
    Venue: booking.eventVenue || booking.Venue,
    Time: booking.chosenTime || booking.Time,
    seats,
    totalAmount: booking.totalAmount,
    bookingDate: booking.bookingDate,
    status: booking.status || 'confirmed',
  };

  console.log('POST payload to /booking/add:', payload);
  const resp = await axios.post(url, payload);
  if (resp.status === 200) {
    sessionStorage.setItem('bookingProcessed', 'true');
  } else {
    throw new Error(resp.data?.message || `HTTP ${resp.status}`);
  }
  return resp.data;
}

export default EventSuccess;
