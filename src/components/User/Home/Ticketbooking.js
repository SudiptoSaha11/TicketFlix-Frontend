import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { loadStripe } from '@stripe/stripe-js';
import screenImage from './Screen1.png';
import styled from 'styled-components';

Modal.setAppElement('#root');

const stripePromise = loadStripe(
  'pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c'
);

const Ticketbooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    Name = '',
    Venue = '',
    Time = '',
    date = '',
    pricing = { GoldTicketPrice: 0, SilverTicketPrice: 0, PlatinumTicketPrice: 0 },
    chosenLanguage = '',
  } = location.state || {};

  useEffect(() => {
    console.log('Ticketbooking location.state:', location.state);
  }, [location.state]);

  const [ticketPrices] = useState(pricing);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.warn('User email is missing in localStorage.');
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
      Name,
      Venue,
      Time,
      date,
      seats: selectedSeats.map((s) => ({
        seatType: s.seatType,
        seatNumber: s.seatNumber,
        price: s.price,
      })),
      totalAmount,
      bookingDate: date,
    };
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    makePayment();
  };

  const makePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://ticketflix-backend.onrender.com/api/create-checkout-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Name, seats: selectedSeats, totalAmount }),
        }
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const session = await response.json();
      if (!session.id) throw new Error('Invalid session ID.');
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
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

  return (
    <div className="px-4 pt-4 pb-20 bg-gray-100 font-sans ">
      {/* HEADER */}
      <div className="text-center mb-5">
        <h2 className="text-2xl text-gray-800">
          Book Seats for {Name} {chosenLanguage && `(${chosenLanguage})`}
        </h2>
        <hr/>
        {Venue && <h3 className="text-lg text-gray-700">Hall: {Venue}</h3>}
        {Time && <h4 className="text-base text-gray-600">Show Time: {Time}</h4>}
        {date && <h4 className="text-base text-gray-600">Date: {date}</h4>}
      </div>

      {/* SEAT SELECTION */}
      <div className="flex flex-col items-center mt-5 p-3 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Select Seats:</h3>
        <SeatSelection
          ticketPrices={ticketPrices}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
        />
      </div>

      {/* SCREEN IMAGE */}
      <div className="text-center my-5">
        <img
          src={screenImage}
          alt="Screen"
          className="inline-block rounded-md border border-gray-300 w-full max-w-xs sm:max-w-md mb-2"
        />
      </div>

      {/* PAY BUTTON: Fixed at bottom */}

      <div className="fixed bottom-0  left-0 w-full bg-white py-4 shadow-inner z-50">
        <div className="max-sm:mx-5">
          <StyledWrapper>
            <button
              className="Btn"
              onClick={handlePayClick}
              disabled={loading}
            >
              {loading ? 'Processing...' : `PAY ₹${totalAmount}`}
              <svg className="svgIcon" viewBox="0 0 576 512">
                <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z" />
              </svg>
            </button>
          </StyledWrapper>
        </div>
      </div>

      {/* LOGIN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Confirm Booking Modal"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl w-80 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60"
      >
        <h2 className="text-xl text-gray-800 mb-4">Please log in to continue</h2>
        {/* <p className="text-base text-gray-600 mb-5">Total Amount: ₹{totalAmount}</p> */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/trylogin')}
            className="bg-green-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-700 transition ease-in-out duration-300"
          >
            Login Now
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition ease-in-out duration-300"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

const SeatSelection = ({ ticketPrices, onSeatSelect, selectedSeats }) => {
  const seatRows = {
    J: ['1','2','3','4','5','6','7','8','9','10'],
    I: ['1','2','3','4','5','6','7','8','9','10'],
    H: ['1','2','3','4','5','6','7','8','9','10'],
    G: ['1','2','3','4','5','6','7','8','9','10'],
    F: ['1','2','3','4','5','6','7','8','9','10'],
    E: ['1','2','3','4','5','6','7','8','9','10'],
    D: ['1','2','3','4','5','6','7','8','9','10'],
    C: ['1','2','3','4','5','6','7','8','9','10'],
    B: ['1','2','3','4','5','6','7','8','9','10'],
    A: ['1','2','3','4','5','6','7','8','9','10'],
  };

  const isSeatSelected = (id) =>
    selectedSeats.some((s) => s.seatNumber === id);

  return (
    <div className="w-full">
      {[
        [['J','I','H'], ticketPrices.PlatinumTicketPrice, 'Platinum'],
        [['G','F','E','D'], ticketPrices.GoldTicketPrice, 'Gold'],
        [['C','B','A'], ticketPrices.SilverTicketPrice, 'Silver'],
      ].map(([rows, price, label], idx) => (
        <div key={idx} className="mb-6 w-full">
          <h4 className="text-lg text-black mb-3 px-2 ">{label} Seat - ₹{price}</h4>

          {rows.map((row) => (
            <div key={row} className="mb-4">
              {/* Mobile: show label above */}
              <div className="block md:hidden text-gray-400 font-medium mb-2 px-2 ">{row}</div>

              {/* Seats grid: 5 cols on mobile, 11 cols (1 label + 10 seats) on md+ */}
              <div className="
                grid grid-cols-5 gap-2 px-2
                md:grid-cols-[40px_repeat(10,1fr)] md:gap-2 md:px-0 md:items-center
              ">
                {/* md+: label column */}
                <div className="hidden md:flex items-center justify-center text-gray-400 font-medium">
                  {row}
                </div>

                {/* seat buttons */}
                {seatRows[row].map((num) => {
                  const id = `${row}${num}`;
                  return (
                    <div
                      key={num}
                      onClick={() => onSeatSelect(row, price, num)}
                      className={
                        `
                        h-9 flex items-center justify-center text-sm font-bold
                        rounded-sm cursor-pointer transition ease-in-out duration-300 border
                        ${isSeatSelected(id)
                          ? 'bg-green-600 text-white border-transparent '
                          : 'bg-white text-black border-green-400 hover:bg-gray-600 hover:text-white'
                        }
                      `}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Ticketbooking;

const StyledWrapper = styled.div`
  .Btn {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(15, 15, 15);
    border: none;
    color: white;
    font-weight: 800;
    gap: 8px;
    cursor: pointer;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.103);
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
  }

  .svgIcon {
    width: 16px;
  }

  .svgIcon path {
    fill: white;
  }

`;