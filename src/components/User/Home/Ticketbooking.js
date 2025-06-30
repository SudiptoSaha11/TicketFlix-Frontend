// src/components/User/Home/Ticketbooking.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import screenImage from './Screen1.png';
import styled from 'styled-components';

Modal.setAppElement('#root');

// same icons array
const seatIcons = [
  null,
  "https://t3.ftcdn.net/jpg/01/17/76/26/360_F_117762685_qn25zluBo4fI4hnMYSvMAlxrzqbQIDrz.jpg",
  "https://png.pngtree.com/png-vector/20230107/ourmid/pngtree-flat-scooter-png-image_6554348.png",
  "https://st3.depositphotos.com/1782409/18327/v/450/depositphotos_183273454-stock-illustration-flat-vector-exotic-cartoon-three.jpg",
  "https://t4.ftcdn.net/jpg/02/13/75/05/360_F_213750591_6bVeg9sH1cD7wEvYhb2OUyHOesJzPtAL.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://img.freepik.com/premium-vector/blue-motorcar-as-auto-retail-sales-vector-illustration_223337-29615.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
  "https://static.vecteezy.com/system/resources/previews/047/709/176/non_2x/realistic-truck-illustration-vector.jpg",
];

const Ticketbooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Log initial sessionStorage
  useEffect(() => {
    console.log("On Ticketbooking mount, sessionStorage.bookingDetails:", sessionStorage.getItem("bookingDetails"));
  }, []);

  // Parse stored once, ensure it's always an object
  const stored = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("bookingDetails")) || {};
    } catch {
      return {};
    }
  })();

  // Destructure either from location.state or from stored
  const {
    Name = stored.Name || '',
    Venue = stored.Venue || '',
    Time = stored.Time || '',
    date = stored.date || '',
    pricing = stored.pricing || { GoldTicketPrice: 0, SilverTicketPrice: 0, PlatinumTicketPrice: 0 },
    chosenLanguage = stored.chosenLanguage || '',
    seatCount = stored.seats?.length || 0,
  } = location.state || stored || {};

  // clear old fnbSelection on mount
  useEffect(() => {
    sessionStorage.removeItem('fnbSelection');
  }, []);

  const [selectedSeats, setSelectedSeats] = useState(stored.seats || []);
  const [totalAmount, setTotalAmount] = useState(stored.totalAmount || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [hoveredCount, setHoveredCount] = useState(seatCount);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const type = localStorage.getItem('usertype');
    setIsLoggedIn(!!email && type === 'user');
  }, []);

  const handleSeatSelection = (seatType, price, seatNumber) => {
    const id = `${seatType}${seatNumber}`;
    const already = selectedSeats.find(s => s.id === id);

    if (!already && selectedSeats.length >= hoveredCount) {
      setModalMessage(`You can only select ${hoveredCount} seats.`);
      setIsModalOpen(true);
      return;
    }

    let updated, newTotal;
    if (already) {
      updated = selectedSeats.filter(s => s.id !== id);
      newTotal = totalAmount - price;
    } else {
      updated = [...selectedSeats, { id, seatType, seatNumber: id, price }];
      newTotal = totalAmount + price;
    }
    setSelectedSeats(updated);
    setTotalAmount(newTotal);
  };

  const handlePayClick = () => {
    if (selectedSeats.length !== hoveredCount) {
      setModalMessage(`Please select exactly ${hoveredCount} seats.`);
      setIsModalOpen(true);
      return;
    }
    if (!isLoggedIn) {
      setModalMessage('You must be logged in to proceed.');
      setIsModalOpen(true);
      return;
    }

    const bundle = {
      Name,
      Venue,
      Time,
      Language: chosenLanguage,
      date,
      seats: selectedSeats,
      totalAmount
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bundle));
    console.log("Just before navigate, bookingDetails:", sessionStorage.getItem("bookingDetails"));

    navigate('/userbeverage');
  };

  return (
    <div className="px-4 pt-4 pb-20 bg-gray-100 font-sans">
      <div className="text-center mb-5">
        <h2 className="text-2xl text-gray-800 xl:text-3xl">
          Book Seats for {Name} {chosenLanguage && `(${chosenLanguage})`}
        </h2>
        <hr />
        {Venue && <h3 className="text-lg text-gray-700 xl:text-2xl">Hall: {Venue}</h3>}
        {Time && <h4 className="text-base text-gray-600 xl:text-xl">Show Time: {Time}</h4>}
        {date && <h4 className="text-base text-gray-600 xl:text-xl">Date: {date}</h4>}
        <p className="mt-2 text-sm text-gray-600">
          Select <span className="font-semibold">{hoveredCount}</span> seats
        </p>

        {/* Open count‑change popup */}
        <div
          className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-gray-700 cursor-pointer hover:bg-gray-300"
          onClick={() => setIsCountModalOpen(true)}
        >
          <span>✏️</span>
          <span className='text-orange-400'>{hoveredCount} Tickets</span>
        </div>
      </div>

      <div className="flex flex-col items-center mt-5 p-3 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 xl:text-xl">Select Seats:</h3>
        <SeatSelection
          ticketPrices={pricing}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
          maxSeats={hoveredCount}
        />
      </div>

      <div className="text-center my-5">
        <img
          src={screenImage}
          alt="Screen"
          className="inline-block rounded-md border border-gray-300 w-full max-w-xs sm:max-w-md mb-2"
        />
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white py-4 shadow-inner z-50">
        <div className="max-sm:mx-5 lg:flex lg:flex-row lg:justify-center">
          <StyledWrapper>
            <button className="Btn" onClick={handlePayClick}>
              PAY ₹{totalAmount}
              <svg className="svgIcon" viewBox="0 0 576 512">
                <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 
                  7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 
                  0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 
                  35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 
                  304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 
                  24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 
                  10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z" />
              </svg>
            </button>
          </StyledWrapper>
        </div>
      </div>

      {/* Validation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Notice"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl w-72 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-lg text-gray-800 mb-4">{modalMessage}</h2>
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Seat‑Count Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onRequestClose={() => setIsCountModalOpen(false)}
        contentLabel="How Many Seats?"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        className="
          fixed bottom-0 left-0 w-full bg-white p-4 
          sm:relative sm:bottom-auto sm:left-auto sm:w-auto sm:max-w-md sm:rounded-xl sm:mx-auto sm:p-6
          z-50
        "
      >
        <button
          onClick={() => setIsCountModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

        <h2 className="text-center text-xl mb-4">How Many Seats?</h2>
        <div className="flex justify-center mb-4">
          <img
            src={seatIcons[hoveredCount]}
            alt={`${hoveredCount} seats`}
            className="h-[110px]"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
            {[...Array(10)].map((_, idx) => {
              const num = idx + 1;
              return (
                <div
                  key={num}
                  onMouseEnter={() => setHoveredCount(num)}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center 
                    border-2 cursor-pointer transition-all duration-200
                    ${
                      hoveredCount === num
                        ? "bg-orange-400 border-orange-500 text-white scale-110"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  {num}
                </div>
              );
            })}
          </div>
        <button
          onClick={() => setIsCountModalOpen(false)}
          className="w-full bg-orange-400 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Done
        </button>
      </Modal>
    </div>
  );
};

const SeatSelection = ({ ticketPrices, onSeatSelect, selectedSeats, maxSeats }) => {
  const seatRows = {
    J: [...Array(10)].map((_, i) => (i + 1).toString()),
    I: [...Array(10)].map((_, i) => (i + 1).toString()),
    H: [...Array(10)].map((_, i) => (i + 1).toString()),
    G: [...Array(10)].map((_, i) => (i + 1).toString()),
    F: [...Array(10)].map((_, i) => (i + 1).toString()),
    E: [...Array(10)].map((_, i) => (i + 1).toString()),
    D: [...Array(10)].map((_, i) => (i + 1).toString()),
    C: [...Array(10)].map((_, i) => (i + 1).toString()),
    B: [...Array(10)].map((_, i) => (i + 1).toString()),
    A: [...Array(10)].map((_, i) => (i + 1).toString()),
  };

  const isSeatSelected = id => selectedSeats.some(s => s.id === id);

  return (
    <div className="w-full xl:w-[35rem]">
      {[
        [['J','I','H'], ticketPrices.PlatinumTicketPrice, 'Platinum'],
        [['G','F','E','D'], ticketPrices.GoldTicketPrice, 'Gold'],
        [['C','B','A'], ticketPrices.SilverTicketPrice, 'Silver'],
      ].map(([rows, price, label], idx) => (
        <div key={idx} className="mb-6 w-full">
          <h4 className="text-lg text-black mb-3 px-2">
            {label} – ₹{price}
          </h4>
          {rows.map(row => (
            <div key={row} className="mb-4">
              <div className="block md:hidden text-gray-400 font-medium mb-2 px-2">
                {row}
              </div>
              <div className="grid grid-cols-5 gap-2 px-2 md:grid-cols-[40px_repeat(10,1fr)] md:gap-2 md:px-0 md:items-center">
                <div className="hidden md:flex items-center justify-center text-gray-400 font-medium">
                  {row}
                </div>
                {seatRows[row].map(num => {
                  const id = `${row}${num}`;
                  const selected = isSeatSelected(id);
                  const disabled = !selected && selectedSeats.length >= maxSeats;
                  return (
                    <div
                      key={num}
                      onClick={() => !disabled && onSeatSelect(row, price, num)}
                      className={`h-9 flex items-center justify-center text-sm font-bold rounded-sm cursor-pointer transition duration-300 
                        ${selected 
                          ? 'bg-green-600 text-white border-0' 
                          : disabled 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'border border-orange-300 hover:bg-gray-300'}`}
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
    transition-duration: .3s;
    padding: 0 2rem;
  }
  .svgIcon { width: 16px; }
  .svgIcon path { fill: white; }
`;

export default Ticketbooking;
