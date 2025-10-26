// src/.../SuccessPage.js
import React, { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import api from '../../../Utils/api';

const SuccessPage = () => {
  const [bookingMessage, setBookingMessage] = useState('Processing your booking...');
  const [animationData, setAnimationData] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);
  const isApiCalled = useRef(false);

  const snap = JSON.parse(sessionStorage.getItem('paymentSummary') || 'null');
  const foodFromSnap = Array.isArray(snap?.food) ? snap.food : [];
  const summaryFromSnap = snap?.summary ?? null;

  const qs = new URLSearchParams(window.location.search);
  const sessionId = qs.get('session_id');   // stripe
  const paymentId = qs.get('payment_id');   // razorpay
  const urlProvider = qs.get('provider');
  const provider = urlProvider || (sessionId ? 'stripe' : (paymentId ? 'razorpay' : null));

  useEffect(() => {
    fetch('https://lottie.host/5c5bb36f-dbb3-4028-a8a1-62dfaa3ec292/L2ZlgkQwwn.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error('Lottie load error:', err);
        setAnimationData(null);
      });
  }, []);

  const fetchPaidAmount = async () => {
    if (provider === 'stripe' && sessionId) {
      try {
        const { data } = await api.get(`/checkout-session/${sessionId}`);
        return typeof data?.amount_total === 'number' ? data.amount_total / 100 : null;
      } catch (e) {
        console.error('Failed fetching Stripe session:', e);
        return null;
      }
    } else if (provider === 'razorpay' && paymentId) {
      const candidatePaths = ['/razorpay/payment/' + paymentId, '/api/razorpay/payment/' + paymentId];
      for (const path of candidatePaths) {
        try {
          const { data } = await api.get(path);
          if (data && typeof data.amount === 'number') return data.amount / 100;
        } catch (e) {
          // keep trying other candidate path
        }
      }
      console.error('Failed fetching Razorpay payment via both paths.');
      return null;
    }
    return null;
  };

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

    // ensure seats are strings
    const seats = (booking.seats || []).map((s) => (typeof s === 'object' && s.seatNumber ? s.seatNumber : s));

    (async () => {
      let finalPaid = await fetchPaidAmount();
      if (finalPaid == null) {
        const paymentSummary = JSON.parse(sessionStorage.getItem('paymentSummary') || 'null');
        const fallback = Number(paymentSummary?.summary?.finalPayable ?? booking.totalAmount);
        finalPaid = Number.isFinite(fallback) ? fallback : null;
      }

      if (finalPaid == null) {
        setBookingMessage('Payment verified, but amount unavailable.');
      } else {
        setPaidAmount(finalPaid);
        setBookingMessage(`Your booking has been confirmed! Paid Rs. ${finalPaid.toFixed(2)} 🎉`);
      }

      // derive a robust Time value (several places your code used different keys)
      const timeCandidate = booking.Time || booking.showTime || booking.time || booking.TimeSelected || '';
      // if still empty, fallback to a sensible string so mongoose 'required' passes (you could also reject)
      const finalTime = timeCandidate || '00:00';

      const payload = {
        userEmail,
        movieId: booking.movieId || localStorage.getItem('id'),
        Name: booking.Name || booking.movieName || undefined,
        Venue: booking.Venue,
        Time: finalTime,                        // IMPORTANT: always include Time
        Language: booking.Language,
        bookingDate: booking.date || booking.bookingDate || (new Date()).toISOString().split('T')[0],
        seats,
        food: foodFromSnap,
        summary: {
          subtotal: Number(summaryFromSnap?.subtotal ?? 0),
          foodTotal: Number(summaryFromSnap?.foodTotal ?? 0),
          convenienceFee: summaryFromSnap?.convenienceFee ?? { baseFee: 0, tax: 0, total: 0 },
          finalPayable: Number(finalPaid ?? summaryFromSnap?.finalPayable ?? 0),
        },
        promo: JSON.parse(sessionStorage.getItem('appliedPromo') || 'null') || undefined,
        provider: provider || undefined,                        // IMPORTANT: always include provider if detected
        paymentId: provider === 'razorpay' ? paymentId || undefined : undefined,
        sessionId: provider === 'stripe' ? sessionId || undefined : undefined,
        currency: 'INR',
      };

      console.log('Booking payload:', payload);

      try {
        // ensure your api helper base path + server route matches /booking/add
        const res = await api.post('/booking/add', payload);
        console.log('Booking saved:', res.data);
        sessionStorage.setItem('bookingProcessed', 'true');
      } catch (err) {
        console.error('Error saving booking:', err.response?.data || err.message);
        setBookingMessage('Booking save failed. Please contact support with your payment reference.');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => { window.location.href = '/'; }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-center">
      <DotLottieReact className="xl:h-64"
        src="https://lottie.host/f1eda73d-08bd-4a89-bec9-e095f1656329/e3KpA92vAb.lottie"
        loop autoplay />
      <br />
      {animationData && (
        <div className="w-48 sm:w-64 mb-6 animate-scale-up">
          <Lottie animationData={animationData} loop={false} />
        </div>
      )}

      <h1 className="text-2xl sm:text-4xl font-bold text-green-600 mb-3 animate-bounce">Booking Successful!</h1>

      <p className="text-base sm:text-lg text-gray-700 mb-2">{bookingMessage}</p>
      {paidAmount != null && (<p className="text-sm text-gray-500">Charged amount: Rs. {paidAmount.toFixed(2)}</p>)}

      <button onClick={() => (window.location.href = '/')}
        className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-6 py-2 rounded-md transition duration-300 mt-4">
        Back to Home
      </button>
    </div>
  );
};

export default SuccessPage;
