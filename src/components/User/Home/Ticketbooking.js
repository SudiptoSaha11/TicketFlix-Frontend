// src/components/User/Home/Ticketbooking.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import screenImage from './Screen1.png';
import styled from 'styled-components';
import { FaChair, FaCheck, FaLock, FaTimes, FaEdit, FaTicketAlt } from 'react-icons/fa';

Modal.setAppElement('#root');

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

  useEffect(() => {
    console.log("On Ticketbooking mount, sessionStorage.bookingDetails:", sessionStorage.getItem("bookingDetails"));
  }, []);

  const stored = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("bookingDetails")) || {};
    } catch {
      return {};
    }
  })();

  const {
    Name = stored.Name || '',
    Venue = stored.Venue || '',
    Time = stored.Time || '',
    date = stored.date || '',
    pricing = stored.pricing || { GoldTicketPrice: 0, SilverTicketPrice: 0, PlatinumTicketPrice: 0 },
    chosenLanguage = stored.chosenLanguage || '',
    seatCount = stored.seats?.length || 0,
  } = location.state || stored || {};

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
    navigate('/userbeverage');
  };

  return (
    <div className="px-4 pt-4 pb-20 bg-gradient-to-b from-gray-50 to-gray-100 font-sans min-h-screen">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-semibold text-gray-800 xl:text-3xl bg-clip-text text-transparent bg-black ">
          Book Seats for {Name} {chosenLanguage && `(${chosenLanguage})`}
        </h2>
        <hr className="border-t-2 border-gray-200 my-3" />
        {Venue && <h3 className="text-lg font-medium text-gray-700 xl:text-xl">Hall: {Venue}</h3>}
        {Time && <h4 className="text-base text-gray-600 xl:text-lg">Show Time: {Time}</h4>}
        {date && <h4 className="text-base text-gray-600 xl:text-lg">Date: {date}</h4>}
        <div className="mt-3 flex items-center justify-center gap-2">
          <p className="text-sm text-gray-600">
            Select <span className="font-bold text-orange-500">{hoveredCount}</span> seats
          </p>
          
          <div
            className="mt-[-15px] flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-gray-700 cursor-pointer hover:bg-gray-200 transition-all"
            onClick={() => setIsCountModalOpen(true)}
          >
            <FaEdit className="text-orange-400" />
            <span className=" text-sm font-medium text-orange-500">Change</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mt-5 p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Select Seats</h3>
        
        <div className="w-full mb-6 flex justify-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-purple-500 to-blue-500 mr-1"></div>
            <span className="text-xs">Platinum</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-yellow-500 to-yellow-300 mr-1"></div>
            <span className="text-xs">Gold</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-gray-400 to-gray-200 mr-1"></div>
            <span className="text-xs">Silver</span>
          </div>
        </div>
        
        <SeatSelection
          ticketPrices={pricing}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
          maxSeats={hoveredCount}
        />
      </div>

      <div className="text-center my-5">
        <div className="relative inline-block">
          <img
            src={screenImage}
            alt="Screen"
            className="inline-block rounded-md border-2 border-gray-300 w-full max-w-xs sm:max-w-md mb-2 shadow-lg"
          />
          <div className="absolute top-0 left-0 right-0 text-center font-bold text-gray-700 bg-gradient-to-t from-gray-200 to-gray-300 py-1 rounded-t-md">
            SCREEN
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white py-4 shadow-inner z-50 border-t-2 border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <StyledWrapper>
            <button className="Btn" onClick={handlePayClick}>
              <span>PAY ₹{totalAmount.toLocaleString()}</span>
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl w-80 shadow-2xl border border-gray-200"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-xl" />
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">{modalMessage}</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
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
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl overflow-hidden"
      >
        <button
          onClick={() => setIsCountModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="p-6">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Select Ticket Quantity</h2>
          <p className="text-center text-gray-600 mb-6">Choose number of seats you want to book</p>
          
          <div className="flex justify-center mb-6">
            <img
              src={seatIcons[hoveredCount]}
              alt={`${hoveredCount} seats`}
              className="h-28 object-contain"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[...Array(10)].map((_, idx) => {
              const num = idx + 1;
              return (
                <div
                  key={num}
                  onMouseEnter={() => setHoveredCount(num)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    border-2 cursor-pointer transition-all duration-200 shadow-sm
                    ${
                      hoveredCount === num
                        ? "bg-gradient-to-r from-orange-400 to-orange-500 border-orange-600 text-white scale-110 shadow-md"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="font-medium">{num}</span>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaTicketAlt className="text-orange-500 mr-2" />
                <span className="font-medium">Tickets Selected</span>
              </div>
              <span className="text-xl font-bold text-orange-500">{hoveredCount}</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsCountModalOpen(false)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            Confirm Selection
          </button>
        </div>
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
    <div className="w-full max-w-2xl overflow-x-auto">
      {[
        [['J','I','H'], ticketPrices.PlatinumTicketPrice, 'Platinum'],
        [['G','F','E','D'], ticketPrices.GoldTicketPrice, 'Gold'],
        [['C','B','A'], ticketPrices.SilverTicketPrice, 'Silver'],
      ].map(([rows, price, label], idx) => (
        <div key={idx} className="mb-8 w-full">
          <h4 className="text-lg font-bold mb-4 px-2 flex items-center">
            <div className={`w-3 h-3 mr-2 ${
              label === 'Platinum' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
              label === 'Gold' ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 
              'bg-gradient-to-r from-gray-400 to-gray-200'
            }`}></div>
            {label} - ₹{price.toLocaleString()}
          </h4>
          
          {rows.map(row => (
            <div key={row} className="mb-4">
              <div className="block md:hidden text-gray-500 font-medium mb-2 px-2 flex items-center">
                <span className="mr-1">Row</span> {row}
              </div>
              <div className="grid grid-cols-5 gap-3 px-2 md:grid-cols-[50px_repeat(10,minmax(0,1fr))] md:gap-3 md:px-0 md:items-center">
                <div className="hidden md:flex items-center justify-center text-gray-500 font-medium">
                  Row {row}
                </div>
                {seatRows[row].map(num => {
                  const id = `${row}${num}`;
                  const selected = isSeatSelected(id);
                  const disabled = !selected && selectedSeats.length >= maxSeats;
                  return (
                    <button
                      key={num}
                      disabled={disabled}
                      onClick={() => onSeatSelect(row, price, num)}
                      className={`
                        relative h-10 w-full flex items-center justify-center text-sm font-bold rounded-md 
                        transition-all duration-300 transform hover:scale-105 focus:outline-none
                        ${selected 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                          : disabled 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-inner' 
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 text-blue-600 hover:bg-blue-100 hover:border-blue-500 shadow'
                        }`
                      }
                    >
                      {selected && <FaCheck className="absolute top-1 right-1 text-xs" />}
                      {disabled && <FaLock className="absolute top-1 right-1 text-xs" />}
                      <FaChair className="mr-1" />
                      {num}
                    </button>
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
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to left, #f97316 , #FA742B);
    border: none;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    gap: 12px;
    cursor: pointer;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .svgIcon {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease;
  }
  
  .Btn:hover .svgIcon {
    transform: translateX(5px);
  }
`;

export default Ticketbooking;