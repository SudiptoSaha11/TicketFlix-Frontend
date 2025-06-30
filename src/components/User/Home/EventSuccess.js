// src/pages/EventSuccess.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const EventSuccess = () => {
  const [bookingMessage, setBookingMessage] = useState('Processing your booking...');
  const [animationData, setAnimationData] = useState(null);
  const hasPosted = useRef(false);

  // 1) Load a public‑CDN Lottie JSON so we won’t hit 403
  useEffect(() => {
    fetch('https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json')
      .then(res => {
        if (!res.ok) throw new Error(`Animation load failed: ${res.status}`);
        return res.json();
      })
      .then(setAnimationData)
      .catch(err => console.error('Animation load failed:', err));
  }, []);

  // 2) On first mount, read bookingDetails and POST to backend
  useEffect(() => {
    if (hasPosted.current) return;
    hasPosted.current = true;

    const raw = sessionStorage.getItem('bookingDetails');
    if (!raw) {
      setBookingMessage('No booking details found.');
      return;
    }

    let booking;
    try {
      booking = JSON.parse(raw);
    } catch {
      setBookingMessage('Invalid booking details.');
      return;
    }

    console.log('Inside booking object:', booking);

    // seatsBooked was an array of strings already
    const seats = booking.seatsBooked
  ? booking.seatsBooked.map(s => (typeof s === 'string' ? s : s.seatNumber))
  : [];

    const payload = {
      userEmail:   booking.userEmail,
      Name:        booking.eventName,
      Venue:       booking.eventVenue,
      Time:        booking.chosenTime,
      seats,
      totalAmount: booking.totalAmount,
      bookingDate: booking.bookingDate,
      status:      booking.status || 'confirmed'
    };

    console.log('Payload to /booking/add:', payload);
    axios
      .post('https://ticketflix-backend.onrender.com/booking/add', payload)
      .then(() => {
        setBookingMessage('Your event booking has been confirmed! 🎉');
        sessionStorage.setItem('bookingProcessed', 'true');
      })
      .catch(err => {
        console.error('Error saving booking:', err.response?.data || err.message);
        setBookingMessage('Failed to save booking. Please try again later.');
      });
  }, []);

  // 3) Redirect back to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-center">
      {/* .lottie animation */}
      <DotLottieReact
        className='xl:h-64'
        src="https://lottie.host/f1eda73d-08bd-4a89-bec9-e095f1656329/e3KpA92vAb.lottie"
        loop
        autoplay
        style={{ width: 200, height: 200 }}
      />

      {/* JSON‑based Lottie animation
      {animationData && (
        <div className="w-48 sm:w-64 mb-6 animate-scale-up">
          <Lottie animationData={animationData} loop={false} />
        </div>
      )} */}

      <h1 className="text-2xl sm:text-4xl font-bold text-green-600 mb-3 animate-bounce">
        Booking Successful!
      </h1>

      <p className="text-base sm:text-lg text-gray-700 mb-6">
        {bookingMessage}
      </p>

      <button
        onClick={() => (window.location.href = '/')}
        className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-6 py-2 rounded-md transition duration-300"
      >
        Back to Home
      </button>
    </div>
  );
};

export default EventSuccess;
