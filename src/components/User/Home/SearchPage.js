import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import '../Home/Success.css';

const SuccessPage = () => {
  const [bookingMessage, setBookingMessage] = useState('Processing your booking...');

  const isApiCalled = useRef(false); // Track API call
  
  useEffect(() => {
    console.log("useEffect is running...");
  
    if (isApiCalled.current) {
      console.log("API already called, skipping...");
      return;
    }
  
    const storedBookingDetails = sessionStorage.getItem("bookingDetails");
    if (!storedBookingDetails) {
      console.log("No booking details found in sessionStorage.");
      setBookingMessage("No booking details found.");
      return;
    }
  
    let bookingDetails;
    try {
      bookingDetails = JSON.parse(storedBookingDetails);
      console.log("Parsed Booking Details:", bookingDetails);
    } catch (error) {
      console.error("Error parsing booking details:", error);
      setBookingMessage("Invalid booking details.");
      return;
    }
  
    // Format seat numbers
    bookingDetails.seats = bookingDetails.seats.map(seat =>
      typeof seat === "object" && seat.seatNumber ? seat.seatNumber : seat
    );
    
    bookingDetails.status = "confirmed";
  
    console.log("Final Booking Data to Send:", bookingDetails);
  
    isApiCalled.current = true; // Mark API as called
  
    axios.post("https://ticketflix-backend.onrender.com/booking/add", bookingDetails)
      .then(response => {
        console.log("Booking Success:", response.data);
        setBookingMessage("Your booking has been confirmed! 🎉");
        sessionStorage.setItem("bookingProcessed", "true");
      })
      .catch(error => {
        console.error("Error saving booking:", error.response ? error.response.data : error.message);
        setBookingMessage("Booking failed. Please try again.");
      });
  
  }, []);
  
  return (
    <div className="success-container">
      <div className="success-icon">🎉</div>
      <h1 className="success-header">Booking Successful!</h1>
      <p className="success-message">{bookingMessage}</p>
      <button className="back-button" onClick={() => window.location.href = '/'}>Back to Home</button>
    </div>
  );
};

export default SuccessPage;