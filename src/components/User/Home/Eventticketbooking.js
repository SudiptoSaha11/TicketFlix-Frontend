import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { loadStripe } from '@stripe/stripe-js';

Modal.setAppElement('#root');

const stripePromise = loadStripe('pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c');

const categoryMapping = {
  VIPPrice: 'VIP',
  MIPTicketPrice: 'MIP',
  PlatinumTicketPrice: 'Platinum',
  DiamondTicketPrice: 'Diamond',
  GoldTicketPrice: 'Gold',
  SilverTicketPrice: 'Silver',
  BronzeTicketPrice: 'Bronze',
};

const Eventticketbooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    eventName = '',
    eventVenue = '',
    eventDate = '',
    pricing = {
      VIPPrice: 0,
      MIPTicketPrice: 0,
      PlatinumTicketPrice: 0,
      DiamondTicketPrice: 0,
      GoldTicketPrice: 0,
      SilverTicketPrice: 0,
      BronzeTicketPrice: 0,
    },
    chosenTime = '',
  } = location.state || {};

  useEffect(() => {
    console.log("Ticketbooking location.state:", location.state);
  }, [location.state]);

  const [ticketPrices] = useState(pricing);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState(null);

  // Refs for scrolling
  const sectionRefs = {
    VIP: useRef(null),
    MIP: useRef(null),
    Platinum: useRef(null),
    Diamond: useRef(null),
    Gold: useRef(null),
    Silver: useRef(null),
    Bronze: useRef(null),
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('usertype');

    sessionStorage.removeItem('selectedSeats');
    sessionStorage.removeItem('totalAmount');
    setSelectedSeats([]);
    setTotalAmount(0);

    if (userType === 'user' && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    } else {
      setIsLoggedIn(false);
    }

    const handlePopState = () => {
      sessionStorage.removeItem('selectedSeats');
      sessionStorage.removeItem('totalAmount');
      setSelectedSeats([]);
      setTotalAmount(0);
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const handleSeatSelection = (seatType, price, seatNumber) => {
    const seat = `${seatType}${seatNumber}`;
    if (!isLoggedIn) {
      setIsModalOpen(true);
      return;
    }
    setSelectedSeats((prev) => {
      let updated;
      let newTotal = totalAmount;
      if (prev.find((s) => s.seatNumber === seat)) {
        updated = prev.filter((s) => s.seatNumber !== seat);
        newTotal -= price;
      } else {
        updated = [...prev, { seatType, seatNumber: seat, price }];
        newTotal += price;
      }
      sessionStorage.setItem('selectedSeats', JSON.stringify(updated));
      sessionStorage.setItem('totalAmount', JSON.stringify(newTotal));
      setTotalAmount(newTotal);
      return updated;
    });
  };

  const handleBooking = () => {
    if (!userEmail) {
      setIsModalOpen(true);
      return;
    }
    const bookingDetails = {
      userEmail,
      eventName,
      eventVenue,
      chosenTime,
      eventDate,
      seatsBooked: selectedSeats.map((s) => ({
        seatType: s.seatType,
        seatNumber: s.seatNumber,
        price: s.price,
      })),
      totalAmount,
      bookingDate: eventDate,
    };
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    makePayment();
  };

  const makePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ticketflix-backend.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          seatsBooked: selectedSeats,
          totalAmount,
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok.');
      const session = await response.json();
      if (!session.id) throw new Error('Invalid session ID.');
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) console.error(result.error.message);
      else navigate('/success');
    } catch (error) {
      console.error('Error during payment:', error);
      navigate('/error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = () => {
    if (loading) return;
    if (!isLoggedIn) setIsModalOpen(true);
    else handleBooking();
  };

  const handleLoginNow = () => navigate('/trylogin');
  const handleCancel = () => setIsModalOpen(false);

  const handlePriceClick = (priceKey) => {
    const category = categoryMapping[priceKey];
    setHighlightCategory((prev) => (prev === category ? null : category));
    const ref = sectionRefs[category];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-5 md:p-8 lg:p-12 space-y-8 md:space-y-0 md:space-x-8 bg-gray-50 min-h-screen max-lg:mb-20">
      {/* Left Panel */}
      <div className="w-full md:w-1/3 bg-white p-4 md:p-6 rounded-lg shadow-sm flex flex-col md:sticky md:top-10 md:self-start">
        <h2 className="text-2xl font-bold mb-2">{eventName}</h2>
        <p className="text-gray-600 mb-1">{eventVenue}</p>
        <p className="text-gray-600 mb-4">{new Date(eventDate).toDateString()} | {chosenTime}</p>
        <p className="text-sm text-gray-500 mb-4">
          Select a category to highlight its seats below.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {Object.entries(ticketPrices)
            .filter(([key]) => key !== '_id')
            .map(([key, price]) => {
              const cat = categoryMapping[key];
              const isActive = highlightCategory === cat;
              return (
                <div
                  key={key}
                  onClick={() => handlePriceClick(key)}
                  className={`
                    cursor-pointer
                    px-4 py-3
                    rounded-md
                    transition
                    text-base font-medium
                    ${isActive ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100 border border-gray-200'}
                  `}
                >
                  {cat} – ₹{price}
                </div>
              );
            })}
        </div>

        {/* Desktop Pay button */}
        <button
          onClick={handlePayClick}
          disabled={loading}
          className={`
            hidden lg:block
            mt-auto
            w-full py-3
            text-lg font-semibold
            text-white
            rounded-md
            transition
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {loading ? 'Processing...' : `PAY ₹${totalAmount}`}
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-2/3 bg-white p-4 md:p-6 rounded-lg shadow-sm ">
        <h3 className="text-xl font-semibold mb-4 text-center">Select Your Seats</h3>
        <SeatSelection
          ticketPrices={ticketPrices}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
          highlightCategory={highlightCategory}
          sectionRefs={sectionRefs}
        />
      </div>

      {/* Mobile Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow md:hidden">
        <button
          onClick={handlePayClick}
          disabled={loading}
          className={`
            w-full py-3
            text-lg font-semibold
            text-white
            rounded-md
            transition
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {loading ? 'Processing...' : `PAY ₹${totalAmount}`}
        </button>
      </div>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <p className="mb-4">Please log in to proceed with booking.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLoginNow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Login Now
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatSelection = ({ ticketPrices, onSeatSelect, selectedSeats, highlightCategory, sectionRefs }) => {
  const seatRows = {
    A: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    B: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    C: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    D: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    E: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    F: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    G: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    H: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    I: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    J: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    K: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    L: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    M: Array.from({ length: 10 }, (_, i) => String(i + 1)),
    N: Array.from({ length: 10 }, (_, i) => String(i + 1)),
  };

  const isSelected = (seat) => selectedSeats.some((s) => s.seatNumber === seat);
  const sectionClasses = (section) =>
    `mb-6 p-4 rounded-md transition ${
      highlightCategory === section
        ? 'border-2 border-orange-500 bg-orange-50'
        : 'border border-gray-200 bg-white'
    }`;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full bg-gray-400 text-center py-2 rounded-md text-white font-bold mb-4">
        STAGE
      </div>

      {Object.entries({
        VIP: ['A', 'B', ticketPrices.VIPPrice],
        MIP: ['C', 'D', ticketPrices.MIPTicketPrice],
        Platinum: ['E', 'F', ticketPrices.PlatinumTicketPrice],
        Diamond: ['G', 'H', ticketPrices.DiamondTicketPrice],
        Gold: ['I', 'J', ticketPrices.GoldTicketPrice],
        Silver: ['K', 'L', ticketPrices.SilverTicketPrice],
        Bronze: ['M', 'N', ticketPrices.BronzeTicketPrice],
      }).map(([section, [row1, row2, price]]) => (
        <div key={section} ref={sectionRefs[section]} className={sectionClasses(section)}>
          <h4 className="text-lg font-semibold mb-2">{section} – ₹{price}</h4>
          {[row1, row2].map((row) => (
            <div key={row} className="flex flex-wrap justify-center mb-2">
              <span className="w-full text-center font-medium mb-1">{row}</span>
              {seatRows[row].map((num) => {
                const seatId = `${row}${num}`;
                const selected = isSelected(seatId);
                return (
                  <div
                    key={seatId}
                    onClick={() => onSeatSelect(row, price, num)}
                    className={`
                      w-8 h-8 m-1 flex items-center justify-center text-sm font-bold rounded-sm transition
                      ${selected ? 'bg-green-600 text-white' : 'bg-white border border-yellow-300'}
                      hover:bg-yellow-400 hover:text-white
                    `}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Eventticketbooking;
