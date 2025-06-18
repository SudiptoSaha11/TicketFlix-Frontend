import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import './Ticketbooking.css';
import { loadStripe } from '@stripe/stripe-js';
import screenImage from './Screen.png';

Modal.setAppElement('#root');

const stripePromise = loadStripe('pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c');

const Ticketbooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location.state
  const {
    Name = '',
    Venue = '',
    Time = '',
    date = '',
    pricing = {
      GoldTicketPrice: 0,
      SilverTicketPrice: 0,
      PlatinumTicketPrice: 0,
    },
    chosenLanguage = '', // Passed from previous page
  } = location.state || {};

  // Debug: log location.state
  useEffect(() => {
    console.log("Ticketbooking location.state:", location.state);
  }, [location.state]);

  // Use pricing from location.state
  const [ticketPrices] = useState(pricing);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // On component mount, check user login and clear any previous session data
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('usertype');

    // Clear previous seat selections from sessionStorage (but not bookingDetails)
    sessionStorage.removeItem('selectedSeats');
    sessionStorage.removeItem('totalAmount');
    setSelectedSeats([]);
    setTotalAmount(0);

    if (userType === 'user' && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    } else {
      setIsLoggedIn(false);
      console.warn('User email is missing in localStorage.');
    }

    // Block browser back navigation (clears sessionStorage for seats/amount)
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

  // Toggle seat selection and persist in sessionStorage
  const handleSeatSelection = (seatType, price, seatNumber) => {
    const seat = `${seatType}${seatNumber}`;
    if (!isLoggedIn) {
      setIsModalOpen(true);
      return;
    }
    setSelectedSeats((prevSelectedSeats) => {
      let updatedSeats;
      let newTotalAmount = totalAmount;
      if (prevSelectedSeats.find((s) => s.seatNumber === seat)) {
        updatedSeats = prevSelectedSeats.filter((s) => s.seatNumber !== seat);
        newTotalAmount -= price;
      } else {
        updatedSeats = [...prevSelectedSeats, { seatType, seatNumber: seat, price }];
        newTotalAmount += price;
      }
      // Persist in sessionStorage
      sessionStorage.setItem('selectedSeats', JSON.stringify(updatedSeats));
      sessionStorage.setItem('totalAmount', JSON.stringify(newTotalAmount));
      setTotalAmount(newTotalAmount);
      return updatedSeats;
    });
  };

  // Build booking details and store them in sessionStorage before proceeding to payment
  const handleBooking = () => {
    if (!userEmail) {
      console.error('No user email found. Please log in.');
      setIsModalOpen(true);
      return;
    }
    const bookingDetails = {
      userEmail,
      Name,
      Venue,
      Time,
      date,
      seats: selectedSeats.map((seat) => ({
        seatType: seat.seatType,
        seatNumber: seat.seatNumber,
        price: seat.price,
      })),
      totalAmount,
      bookingDate: date,
    };

    // Store booking details in sessionStorage
    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

    // Proceed to payment
    makePayment();
  };

  // Payment with Stripe
  const makePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ticketflix-backend.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name,
          seats: selectedSeats,
          totalAmount,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const session = await response.json();
      if (!session.id) {
        throw new Error('Invalid session ID.');
      }
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        console.error(result.error.message);
      } else {
        navigate('/success');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      navigate('/error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = () => {
    if (loading) return;
    if (!isLoggedIn) {
      setIsModalOpen(true);
    } else {
      handleBooking(); // Build booking details, store them, then call payment
    }
  };

  const handleLoginNow = () => {
    navigate('/trylogin');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="ticketbooking-container">
      <div className="header">
        <h2>Book Seats for {Name} {chosenLanguage && `(${chosenLanguage})`}</h2>
        {Venue && <h3>Hall: {Venue}</h3>}
        {Time && <h4>Show Time: {Time}</h4>}
        {date && <h4>Date: {date}</h4>}
      </div>

      <div className="seat-selection">
        <h3>Select Seats:</h3>
        <SeatSelection
          ticketPrices={ticketPrices}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
        />
      </div>

      <div className="screen-container">
        <img src={screenImage} alt="Screen" className="screen-image" />
      </div>

      <div className="Ticket-button">
        <button className="pay-button" onClick={handlePayClick} disabled={loading}>
          {loading ? 'Processing...' : `PAY ₹${totalAmount}`}
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
        contentLabel="Confirm Booking Modal"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Please log in to continue</h2>
        <p>Total Amount: ₹{totalAmount}</p>
        <button onClick={handleLoginNow}>Login Now</button>
        <button onClick={handleCancel}>Cancel</button>
      </Modal>
    </div>
  );
};

const SeatSelection = ({ ticketPrices, onSeatSelect, selectedSeats }) => {
  const seatRows = {
    J: ['1','2','3','4','5','6','7','8','9','10'], // Platinum
    I: ['1','2','3','4','5','6','7','8','9','10'],
    H: ['1','2','3','4','5','6','7','8','9','10'],
    G: ['1','2','3','4','5','6','7','8','9','10'], // Gold
    F: ['1','2','3','4','5','6','7','8','9','10'],
    E: ['1','2','3','4','5','6','7','8','9','10'],
    D: ['1','2','3','4','5','6','7','8','9','10'],
    C: ['1','2','3','4','5','6','7','8','9','10'], // Silver
    B: ['1','2','3','4','5','6','7','8','9','10'],
    A: ['1','2','3','4','5','6','7','8','9','10'],
  };

  const isSeatSelected = (seat) => selectedSeats.some((s) => s.seatNumber === seat);

  return (
    <div className="seat-selection-container">
      {/* Platinum Section */}
      <div className="seat-type-section">
        <h4>Platinum Seat - ₹{ticketPrices.PlatinumTicketPrice}</h4>
        {['J', 'I', 'H'].map((row) => (
          <div key={row}>
            <div className="seat-row">
              <h5>{row}</h5>
              {seatRows[row].map((seatNumber, index) => (
                <div
                  key={index}
                  className={`seat ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                  onClick={() => onSeatSelect(row, ticketPrices.PlatinumTicketPrice, seatNumber)}
                >
                  {seatNumber}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Gold Section */}
      <div className="seat-type-section">
        <h4>Gold Seat - ₹{ticketPrices.GoldTicketPrice}</h4>
        {['G', 'F', 'E', 'D'].map((row) => (
          <div key={row}>
            <div className="seat-row">
              <h5>{row}</h5>
              {seatRows[row].map((seatNumber, index) => (
                <div
                  key={index}
                  className={`seat ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                  onClick={() => onSeatSelect(row, ticketPrices.GoldTicketPrice, seatNumber)}
                >
                  {seatNumber}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Silver Section */}
      <div className="seat-type-section">
        <h4>Silver Seat - ₹{ticketPrices.SilverTicketPrice}</h4>
        {['C', 'B', 'A'].map((row) => (
          <div key={row}>
            <div className="seat-row">
              <h5>{row}</h5>
              {seatRows[row].map((seatNumber, index) => (
                <div
                  key={index}
                  className={`seat ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                  onClick={() => onSeatSelect(row, ticketPrices.SilverTicketPrice, seatNumber)}
                >
                  {seatNumber}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticketbooking;
