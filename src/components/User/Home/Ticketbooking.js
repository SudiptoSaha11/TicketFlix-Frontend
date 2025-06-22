import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import screenImage from './Screen1.png';
import styled from 'styled-components';

Modal.setAppElement('#root');

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

  // Clear any old booking or F&B
  useEffect(() => {
    sessionStorage.removeItem('bookingDetails');
    sessionStorage.removeItem('fnbSelection');
  }, []);

  // Seats & price
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Login state (must have both userEmail and usertype==='user')
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const type = localStorage.getItem('usertype');
    setIsLoggedIn(!!email && type === 'user');
  }, []);

  // Seat click just toggles
  const handleSeatSelection = (seatType, price, seatNumber) => {
    const id = `${seatType}${seatNumber}`;
    let updated = [];
    let newTotal = totalAmount;
    if (selectedSeats.find((s) => s.id === id)) {
      updated = selectedSeats.filter((s) => s.id !== id);
      newTotal -= price;
    } else {
      updated = [...selectedSeats, { id, seatType, seatNumber: id, price }];
      newTotal += price;
    }
    setSelectedSeats(updated);
    setTotalAmount(newTotal);
  };

  // PAY button: check seat selection first, then login
  const handlePayClick = () => {
    if (selectedSeats.length === 0) {
      setModalMessage('Please select at least one seat.');
      setIsModalOpen(true);
      return;
    }
    if (!isLoggedIn) {
      setModalMessage('You must be logged in to proceed.');
      setIsModalOpen(true);
      return;
    }
    // Everything OK → save booking and navigate
    sessionStorage.setItem(
      'bookingDetails',
      JSON.stringify({ Name, Venue, Time, date, seats: selectedSeats, totalAmount })
    );
    navigate('/userbeverage');
  };

  return (
    <div className="px-4 pt-4 pb-20 bg-gray-100 font-sans">
      <div className="text-center mb-5">
        <h2 className="text-2xl text-gray-800
                      xl:text-3xl">
          Book Seats for {Name} {chosenLanguage && `(${chosenLanguage})`}
        </h2>
        <hr />
        {Venue && <h3 className="text-lg text-gray-700 xl:text-2xl">Hall: {Venue}</h3>}
        {Time && <h4 className="text-base text-gray-600 xl:text-xl">Show Time: {Time}</h4>}
        {date && <h4 className="text-base text-gray-600 xl:text-xl">Date: {date}</h4>}
      </div>

      <div className="flex flex-col items-center mt-5 p-3 bg-white rounded-lg shadow ">
        <h3 className="text-lg font-semibold mb-3 xl:text-xl">Select Seats:</h3>
        <SeatSelection
          ticketPrices={pricing}
          onSeatSelect={handleSeatSelection}
          selectedSeats={selectedSeats}
        />
      </div>

      <div className="text-center my-5">
        <img
          src={screenImage}
          alt="Screen"
          className="inline-block rounded-md border border-gray-300 w-full max-w-xs sm:max-w-md mb-2"
        />
      </div>

      <div className="fixed bottom-0  left-0 w-full bg-white py-4 shadow-inner z-50">
        <div className="max-sm:mx-5
        lg:flex lg:flex-row lg:justify-center">
          <StyledWrapper>
            <button className="Btn" onClick={handlePayClick}>
              PAY ₹{totalAmount}
              <svg className="svgIcon" viewBox="0 0 576 512"><path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 
              144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 
              0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 
              0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z" /></svg>
            </button>
          </StyledWrapper>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Validation Required"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl w-80 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60"
      >
        <h2 className="text-xl text-gray-800 mb-4">{modalMessage}</h2>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
          {!isLoggedIn && (
            <button
              onClick={() => navigate('/trylogin')}
              className="bg-pink-500 text-white px-4 py-2 rounded-md"
            >
              Login
            </button>
          )}
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
    selectedSeats.some((s) => s.id === id);

  return (
    <div className="w-full xl:w-[35rem] ">
      {[
        [['J','I','H'], ticketPrices.PlatinumTicketPrice, 'Platinum'],
        [['G','F','E','D'], ticketPrices.GoldTicketPrice, 'Gold'],
        [['C','B','A'], ticketPrices.SilverTicketPrice, 'Silver'],
      ].map(([rows, price, label], idx) => (
        <div key={idx} className="mb-6 w-full">
          <h4 className="text-lg text-black mb-3 px-2">
            {label} Seat - ₹{price}
          </h4>
          {rows.map((row) => (
            <div key={row} className="mb-4">
              <div className="block md:hidden text-gray-400 font-medium mb-2 px-2">
                {row}
              </div>
              <div className="
                grid grid-cols-5 gap-2 px-2
                md:grid-cols-[40px_repeat(10,1fr)] md:gap-2 md:px-0 md:items-center
              ">
                <div className="hidden md:flex items-center justify-center text-gray-400 font-medium">
                  {row}
                </div>
                {seatRows[row].map((num) => {
                  const id = `${row}${num}`;

                  return (
                    <div
                      key={num}
                      onClick={() => onSeatSelect(row, price, num)}
                      className={`
                        h-9 flex items-center justify-center text-sm font-bold
                        rounded-sm cursor-pointer transition ease-in-out duration-300 border-1 border-orange-300 
                        xl:w-10 xl:h-8 
                        
                        ${isSeatSelected(id)
                          ? 'bg-green-600 text-white border-0'
                          : ' hover:bg-gray-300'
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
    padding-top:15px;
    padding-bottom:15px;
    padding-left:100px;
    padding-right:100px;
  }
    .svgIcon {
    width: 16px;
  }

  .svgIcon path {
    fill: white;
  }
`;

export default Ticketbooking;