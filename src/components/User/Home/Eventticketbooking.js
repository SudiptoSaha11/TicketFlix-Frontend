import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import './Eventticketbooking.css';
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
  // New state to track which category is highlighted
  const [highlightCategory, setHighlightCategory] = useState(null);

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
      sessionStorage.setItem('selectedSeats', JSON.stringify(updatedSeats));
      sessionStorage.setItem('totalAmount', JSON.stringify(newTotalAmount));
      setTotalAmount(newTotalAmount);
      return updatedSeats;
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
      seatsBooked: selectedSeats.map((seat) => ({
        seatType: seat.seatType,
        seatNumber: seat.seatNumber,
        price: seat.price,
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
      handleBooking();
    }
  };

  const handleLoginNow = () => {
    navigate('/trylogin');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Handler for when a price is clicked to highlight a seat category
  const handlePriceClick = (priceKey) => {
    const category = categoryMapping[priceKey];
    setHighlightCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="event-booking-container">
      <div className="event-booking-left">
        <h2>{eventName}</h2>
        <p>{eventVenue}</p>
        <p>{new Date(eventDate).toDateString()} | {chosenTime}</p>
        <p>Please select the category of your choice. It will get highlighted on the layout.</p>

        <div className="ticket-pricing-event">
          {Object.entries(ticketPrices)
            .filter(([key]) => key !== "_id")
            .map(([key, price]) => (
              <div 
                key={key} 
                className={`event-ticket-item ${highlightCategory === categoryMapping[key] ? 'active' : ''}`}
                onClick={() => handlePriceClick(key)}
              >
                <span>{categoryMapping[key]} (₹{price})</span>
              </div>
            ))
          }
        </div>

        <div className="event-booking-actions">
          <button className="event-pay-btn" onClick={handlePayClick} disabled={loading}>
            {loading ? 'Processing...' : `PAY ₹${totalAmount}`}
          </button>
        </div>
      </div>

      <div className="event-booking-right">
        <h3>Select Seats:</h3>
        <SeatSelection
          ticketPrices={ticketPrices}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
          highlightCategory={highlightCategory}
        />
      </div>

      {isModalOpen && (
        <div className="event-login-modal">
          <p>Please log in to proceed with booking.</p>
          <button onClick={handleLoginNow}>Login Now</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
};

const SeatSelection = ({ ticketPrices, onSeatSelect, selectedSeats, highlightCategory }) => {
  const seatRows = {
    A: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    B: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    C: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    D: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    E: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    F: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    G: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    H: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    I: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    J: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    K: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    L: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    M: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    N: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  };

  const isSeatSelected = (seat) => selectedSeats.some((s) => s.seatNumber === seat);

  // A helper to conditionally add the highlighted class if the current section is selected.
  const getSectionClass = (section) => 
    highlightCategory === section ? 'seat-type-section highlighted' : 'seat-type-section-event';

  return (
    <div className="event-seat-selection-container">
      <div className="event-stage">STAGE</div>
      
      {/* VIP Section */}
      <div className={getSectionClass('VIP')}>
        <h4>VIP - ₹{ticketPrices.VIPPrice}</h4>
        {['A', 'B'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.VIPPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MIP Section */}
      <div className={getSectionClass('MIP')}>
        <h4>MIP - ₹{ticketPrices.MIPTicketPrice}</h4>
        {['C', 'D'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.MIPTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Platinum Section */}
      <div className={getSectionClass('Platinum')}>
        <h4>Platinum - ₹{ticketPrices.PlatinumTicketPrice}</h4>
        {['E', 'F'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.PlatinumTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Diamond Section */}
      <div className={getSectionClass('Diamond')}>
        <h4>Diamond - ₹{ticketPrices.DiamondTicketPrice}</h4>
        {['G', 'H'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.DiamondTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Gold Section */}
      <div className={getSectionClass('Gold')}>
        <h4>Gold - ₹{ticketPrices.GoldTicketPrice}</h4>
        {['I', 'J'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.GoldTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Silver Section */}
      <div className={getSectionClass('Silver')}>
        <h4>Silver - ₹{ticketPrices.SilverTicketPrice}</h4>
        {['K', 'L'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.SilverTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bronze Section */}
      <div className={getSectionClass('Bronze')}>
        <h4>Bronze - ₹{ticketPrices.BronzeTicketPrice}</h4>
        {['M', 'N'].map((row) => (
          <div key={row} className="seat-row-event">
            <h5>{row}</h5>
            {seatRows[row].map((seatNumber, index) => (
              <div
                key={index}
                className={`seat-event ${isSeatSelected(`${row}${seatNumber}`) ? 'selected' : ''}`}
                onClick={() => onSeatSelect(row, ticketPrices.BronzeTicketPrice, seatNumber)}
              >
                {seatNumber}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Eventticketbooking;