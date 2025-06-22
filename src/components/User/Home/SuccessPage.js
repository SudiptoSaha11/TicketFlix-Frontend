import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const SuccessPage = () => {
  const [bookingMessage, setBookingMessage] = useState('Processing your booking...');
  const [animationData, setAnimationData] = useState(null);
  const isApiCalled = useRef(false);

  useEffect(() => {
    // ✅ Load Lottie JSON from URL
    fetch('https://lottie.host/5c5bb36f-dbb3-4028-a8a1-62dfaa3ec292/L2ZlgkQwwn.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Lottie load error:', err));
  }, []);

  useEffect(() => {
    if (isApiCalled.current) return;
    isApiCalled.current = true;

    const stored = sessionStorage.getItem('bookingDetails');
    if (!stored) {
      setBookingMessage('No booking details found.');
      return;
    }

    let booking;
    try {
      booking = JSON.parse(stored);
    } catch (err) {
      console.error('Invalid booking JSON:', err);
      setBookingMessage('Invalid booking details.');
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      console.error('No userEmail in localStorage');
      setBookingMessage('User not logged in.');
      return;
    }

    const seats = booking.seats.map((s) =>
      typeof s === 'object' && s.seatNumber ? s.seatNumber : s
    );

    const payload = {
      userEmail,
      Name: booking.Name,
      Venue: booking.Venue,
      Time: booking.Time,
      bookingDate: new Date().toISOString(),
      seats,
      totalAmount: booking.totalAmount,
      status: 'confirmed',
    };

    axios
      .post('https://ticketflix-backend.onrender.com/booking/add', payload)
      .then((res) => {
        console.log('Booking saved:', res.data);
        setBookingMessage('Your booking has been confirmed! 🎉');
        sessionStorage.setItem('bookingProcessed', 'true');
      })
      .catch((err) => {
        console.error('Error saving booking:', err.response?.data || err.message);
        setBookingMessage('Booking failed. Please try again.');
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-center">
      <DotLottieReact
      src="https://lottie.host/f1eda73d-08bd-4a89-bec9-e095f1656329/e3KpA92vAb.lottie"
      loop
      autoplay
    /><br/>
      {animationData && (
        <div className="w-48 sm:w-64 mb-6 animate-scale-up">
          <Lottie animationData={animationData} loop={false} />
        </div>
      )}

      <h1 className="text-2xl sm:text-4xl font-bold text-green-600 mb-3 animate-bounce">
        Booking Successful!
      </h1>

      <p className="text-base sm:text-lg text-gray-700 mb-6">{bookingMessage}</p>

      <button
        onClick={() => (window.location.href = '/')}
        className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-6 py-2 rounded-md transition duration-300"
      >
        Back to Home
      </button>
    </div>
  );
};

export default SuccessPage;