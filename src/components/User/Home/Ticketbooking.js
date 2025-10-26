// src/components/User/Home/Ticketbooking.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import screenImage from './Screen1.png';
import styled from 'styled-components';
import { FaTimes, FaEdit, FaTicketAlt } from 'react-icons/fa';
import api from '../../../Utils/api';

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

const normalizeToHHMM = (t) => {
  if (!t) return '';
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const m = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(t);
  if (m) {
    let [, hh, mm, ap] = m;
    let h = parseInt(hh, 10);
    if (/PM/i.test(ap) && h !== 12) h += 12;
    if (/AM/i.test(ap) && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${mm}`;
  }
  return t;
};

const to12h = (hhmm) => {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2, '0')}:${mStr} ${ampm}`;
};

const Ticketbooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stored = (() => {
    try { return JSON.parse(sessionStorage.getItem('bookingDetails')) || {}; }
    catch { return {}; }
  })();
  const storedTime24 = stored.time24 || normalizeToHHMM(stored.Time); // prefer 24h if present

  const {
    movieId,   
    Name = stored.Name || '',
    Venue = stored.Venue || '',
    Time = stored.Time || '',
    date = stored.date || '',
    pricing = stored.pricing || { RoyalTicketPrice: 0, ExecutiveTicketPrice: 0, ClubTicketPrice: 0 },
    chosenLanguage = stored.chosenLanguage || '',
    seatCount = stored.seats?.length || 0,
  } = location.state || stored;

  // base state
  const [selectedSeats, setSelectedSeats] = useState(stored.seats || []);
  const [totalAmount, setTotalAmount] = useState(stored.totalAmount || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [hoveredCount, setHoveredCount] = useState(seatCount || 1);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  // showtimes
  const [currentTime, setCurrentTime] = useState(storedTime24 || normalizeToHHMM(Time) || '');
  const [ticketPrices, setTicketPrices] = useState(pricing);
  const [showtimes, setShowtimes] = useState([]);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const [showtimesErr, setShowtimesErr] = useState('');

  useEffect(() => { sessionStorage.removeItem('fnbSelection'); }, []);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return setIsLoggedIn(false);
    try { const u = JSON.parse(storedUser); setIsLoggedIn(!!u.email && u.type === 'user'); }
    catch { setIsLoggedIn(false); }
  }, []);

  // fetch showtimes for day
  useEffect(() => {
    if (!Name || !Venue || !date) return;
    const run = async () => {
      setIsLoadingShowtimes(true); setShowtimesErr('');
      try {
        const url = `/getShowsByMovieAndhall/movie/${encodeURIComponent(Name)}/hall/${encodeURIComponent(Venue)}`;
        const { data } = await api.get(url);
        const dayStr = new Date(date).toDateString();
        const todays = (data || []).filter(s => new Date(s.startAt).toDateString() === dayStr);
        setShowtimes(todays);

        // select default if current doesn't exist
        const norm = normalizeToHHMM(currentTime);
        const has = todays.some(s => s.time === norm);
        if (!has && todays.length) {
          const f = todays[0];
          setCurrentTime(f.time);
          setTicketPrices({
            RoyalTicketPrice: f.RoyalTicketPrice ?? 0,
            ExecutiveTicketPrice: f.ExecutiveTicketPrice ?? 0,
            ClubTicketPrice: f.ClubTicketPrice ?? 0,
          });
          const bundle = {
            movieId,  
            userEmail: localStorage.getItem('userEmail'),
            Name, Venue,
            Time: to12h(f.time),      // store 12h for UI
            time24: f.time,           // keep 24h for logic/APIs
            Language: chosenLanguage, date,
            seats: [], totalAmount: 0,
            pricing: {
              RoyalTicketPrice: f.RoyalTicketPrice ?? 0,
              ExecutiveTicketPrice: f.ExecutiveTicketPrice ?? 0,
              ClubTicketPrice: f.ClubTicketPrice ?? 0,
            }
          };
          sessionStorage.setItem('bookingDetails', JSON.stringify(bundle));
          localStorage.setItem('bookingDetails', JSON.stringify(bundle));
        }
      } catch {
        setShowtimesErr('Could not load showtimes.');
        setShowtimes([]);
      } finally { setIsLoadingShowtimes(false); }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Name, Venue, date]);

  // fetch booked seats for time
  useEffect(() => {
    if (!Name || !Venue || !date || !currentTime) return;
    const run = async () => {
      setIsLoadingSeats(true);
      try {
        const response = await api.post('/booking/seats', {
          movieId: stored.movieId || location.state?.movieId,  // ✅ required now
          Venue: Venue.trim(),
          bookingDate: date,
          Time: to12h(currentTime),   // still convert to "hh:mm AM/PM"
        });
        
        const arr = response.data && Array.isArray(response.data.bookedSeats) ? response.data.bookedSeats : [];
        setBookedSeats(arr);
      } catch (err) {
        if (err.response?.status === 404) setBookedSeats([]);
        else {
          setModalMessage('Something went wrong while loading seats.');
          setIsModalOpen(true);
          setBookedSeats([]);
        }
      } finally { setIsLoadingSeats(false); }
    };
    run();
  }, [Name, Venue, date, currentTime]);

  const handleSeatSelection = (seatType, price, seatNumber) => {
    const id = `${seatType}${seatNumber}`;
    const already = selectedSeats.some(s => s.id === id);
    if (!already && selectedSeats.length >= hoveredCount) {
      setModalMessage(`You can only select ${hoveredCount} seats.`);
      setIsModalOpen(true);
      return;
    }
    let updated, newTotal;
    if (already) { updated = selectedSeats.filter(s => s.id !== id); newTotal = totalAmount - price; }
    else { updated = [...selectedSeats, { id, seatType, seatNumber: id, price }]; newTotal = totalAmount + price; }
    setSelectedSeats(updated); setTotalAmount(newTotal);
  };

  const handlePayClick = () => {
    if (selectedSeats.length !== hoveredCount) {
      setModalMessage(`Please select exactly ${hoveredCount} seats.`); setIsModalOpen(true); return;
    }
    if (!isLoggedIn && !localStorage.getItem('user')) {
      setModalMessage('You must be logged in to proceed.'); setIsModalOpen(true); return;
    }
    const bundle = {
      userEmail: localStorage.getItem('userEmail'),
      movieId: stored.movieId || location.state?.movieId,   // ✅ new
      Name, Venue,
      Time: to12h(currentTime),
      time24: currentTime,
      Language: chosenLanguage, 
      date,
      seats: selectedSeats,
      totalAmount,
      pricing: ticketPrices,
    };
    sessionStorage.setItem('bookingDetails', JSON.stringify(bundle));
    localStorage.setItem('bookingDetails', JSON.stringify(bundle));
    navigate('/userbeverage');
    
  };

  // Reusable showtime strip (used in desktop and mobile)
  const renderShowtimeStrip = () => (
    <ShowtimeStrip>
      {isLoadingShowtimes ? (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
          Loading showtimes...
        </div>
      ) : showtimesErr ? (
        <div className="text-sm text-red-600">{showtimesErr}</div>
      ) : showtimes.length ? (
        <div className="showtime-scroll flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1 py-2">
          {showtimes.map((s, idx) => {
            const selected = s.time === normalizeToHHMM(currentTime);
            const subtitle =
              (/insignia/i.test(s.hallName || '') && 'INSIGNIA') ||
              (/atmos/i.test(s.hallName || '') && 'Atmos') ||
              '';

            return (
              <button
                key={`${s.startAtISO}-${idx}`}
                onClick={() => {
                  setCurrentTime(s.time);
                  setTicketPrices({
                    RoyalTicketPrice: s.RoyalTicketPrice ?? 0,
                    ExecutiveTicketPrice: s.ExecutiveTicketPrice ?? 0,
                    ClubTicketPrice: s.ClubTicketPrice ?? 0,
                  });
                  setSelectedSeats([]); setTotalAmount(0);

                  const bundle = {
                    userEmail: localStorage.getItem('userEmail'),
                    movieId: stored.movieId || location.state?.movieId,  // ✅ new
                    Name, Venue,
                    Time: to12h(s.time),
                    time24: s.time,
                    Language: chosenLanguage, 
                    date,
                    seats: [], 
                    totalAmount: 0,
                    pricing: {
                      RoyalTicketPrice: s.RoyalTicketPrice ?? 0,
                      ExecutiveTicketPrice: s.ExecutiveTicketPrice ?? 0,
                      ClubTicketPrice: s.ClubTicketPrice ?? 0,
                    }
                  };
                  sessionStorage.setItem('bookingDetails', JSON.stringify(bundle));
                  localStorage.setItem('bookingDetails', JSON.stringify(bundle));
                  
                }}
                className={[
                  "inline-flex flex-col items-center justify-center rounded-md",
                  "min-w-[88px] sm:min-w-[106px] px-3 sm:px-4 py-1.5 sm:py-2",
                  "text-[12px] sm:text-sm leading-tight",
                  "border-2",
                  selected
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-800 border-green-500 hover:bg-green-50"
                ].join(' ')}
                type="button"
              >
                <div className="font-semibold">{to12h(s.time)}</div>
                {subtitle ? (
                  <div className="text-[10px] text-gray-500 sm:hidden -mt-0.5">{subtitle}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-600">No showtimes for this date.</div>
      )}
    </ShowtimeStrip>
  );

  return (
    <div className="w-full min-h-screen">
      {/* ===== DESKTOP/TABLET HEADER + SHOWTIMES (full-bleed) ===== */}
      <div className="hidden sm:block">
        {/* Header bar */}
        <div
          className="w-screen bg-white border-b border-gray-200"
          style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-start justify-between">
            <div>
              <div className="text-[22px] font-semibold text-gray-800">
                {Name} {chosenLanguage && `- (${chosenLanguage})`}
              </div>
              <div className="text-base font-semibold text-gray-800">
                {Venue} | {new Date(date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })} | {to12h(normalizeToHHMM(currentTime || Time))}
              </div>
            </div>

            <div
              onClick={() => setIsCountModalOpen(true)}
              className="flex items-center gap-2 border border-red-400 text-red-500 px-4 py-2 rounded-lg cursor-pointer hover:bg-red-50 transition"
            >
              <FaEdit className="text-red-400" />
              <span className="text-sm font-medium">{hoveredCount} Tickets</span>
            </div>
          </div>

          {/* Full-bleed showtime strip */}
          <div
            className="w-screen bg-orange-100 border-y border-slate-200"
            style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
          >
            <div className="max-w-7xl mx-auto px-6 py-2">
              {renderShowtimeStrip()}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE HEADER + SHOWTIMES (compact card) ===== */}
      <div className="sm:hidden px-4 py-3">
        <div className="text-[18px] font-semibold text-gray-800">
          {Name} {chosenLanguage && `- (${chosenLanguage})`}
        </div>
        <div className="text-[13px] text-gray-600 mt-0.5">{Venue}</div>
        <div className="text-gray-700 text-sm font-medium mt-1">
          {new Date(date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          {' | '}
          {to12h(normalizeToHHMM(currentTime || Time))}
        </div>

        <div
          onClick={() => setIsCountModalOpen(true)}
          className="mt-3 inline-flex items-center gap-2 border border-red-400 text-red-500 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-50 transition text-sm"
        >
          <FaEdit className="text-red-400" />
          <span>{hoveredCount} Tickets</span>
        </div>

        <div className="mt-4">
          {renderShowtimeStrip()}
        </div>

      </div>

      {/* ===== MAIN CENTERED CONTENT (both views) ===== */}
      <div className="max-w-6xl mx-auto px-4">
        {isLoadingSeats && (
          <div className="mt-3 text-sm text-blue-600 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            Loading seat availability...
          </div>
        )}

        {/* Legend + Seat Grid */}
        <div className="flex flex-col items-center mt-1 rounded-xl">
          <SeatSelection
            ticketPrices={ticketPrices}
            onSeatSelect={handleSeatSelection}
            selectedSeats={selectedSeats}
            maxSeats={hoveredCount}
            bookedSeats={bookedSeats}
            isLoading={isLoadingSeats}
          />
        </div>

        {/* Screen Graphic */}
        <div className="text-center my-3">
          <div className="relative inline-block">
            <img src={screenImage} alt="Screen" className="rounded-md max-w-xs sm:max-w-md" />
            <div>SCREEN</div>
          </div>
          <div className="w-full mb-1 flex justify-center gap-6">
            <LegendItem className="bg-white border-2 border-green-500" label="Available" />
            <LegendItem className="bg-green-500" label="Selected" />
            <LegendItem className="bg-gray-300" label="Sold" />
          </div>
        </div>
      </div>

      {/* Bottom Pay Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 z-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          {selectedSeats.length > 0 && (
            <button
              onClick={handlePayClick}
              className="
          w-full sm:w-1/2
          flex items-center justify-center gap-2
          py-2
          bg-gradient-to-r from-orange-500 to-orange-600
          text-white font-semibold text-base
          rounded-lg shadow-md
           
        "
            >
              <span>PAY ₹{totalAmount.toLocaleString()}</span>
              <svg className="w-5 h-5" viewBox="0 0 576 512" fill="currentColor">
                <path d="M512 80c8.8 0 16 7.2 16 16v16H48V96c0-8.8 7.2-16 16-16H512zM48 144H528V368c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V144zM64 32C28.7 32 0 60.7 0 96V416c35.3 28.7 64 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
              </svg>
            </button>
          )}
        </div>
      </div>



      {/* Validation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
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
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Seat Count Modal */}
      <Modal
        isOpen={isCountModalOpen}
        onRequestClose={() => setIsCountModalOpen(false)}
        className="relative bg-white rounded-2xl max-w-md w-full mx-4 shadow-xl overflow-hidden max-lg:mb-10"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <button
          onClick={() => setIsCountModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes className="text-xl" />
        </button>
        <div className="p-6">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Select Ticket Quantity</h2>
          <p className="text-center text-gray-600 mb-6">Choose number of seats you want to book</p>
          <div className="flex justify-center mb-6 max-lg:mt-[-8px]">
            <img src={seatIcons[hoveredCount]} alt={`${hoveredCount} seats`} className="h-28 object-contain max-lg:h-20" />
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 lg:gap-3 mb-8">
            {[...Array(10)].map((_, i) => {
              const num = i + 1;
              return (
                <div
                  key={num}
                  onMouseEnter={() => setHoveredCount(num)}
                  className={`w-10 h-10 max-lg:w-[35px] max-lg:h-[35px] rounded-full flex items-center justify-center border-2 cursor-pointer transition duration-200 shadow-sm ${hoveredCount === num
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 border-orange-600 text-white scale-110 shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium">{num}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-2 mb-6 lg:p-4">
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

const LegendItem = ({ className, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-sm ${className}`} />
    <span className="text-sm text-gray-700">{label}</span>
  </div>
);

const SeatSelection = ({
  ticketPrices,
  onSeatSelect,
  selectedSeats,
  maxSeats,
  bookedSeats = [],
  isLoading = false,
}) => {
  const seatRows = {
    A: [...Array(10)].map((_, i) => `${i + 1}`),
    B: [...Array(10)].map((_, i) => `${i + 1}`),
    C: [...Array(10)].map((_, i) => `${i + 1}`),
    D: [...Array(10)].map((_, i) => `${i + 1}`),
    E: [...Array(10)].map((_, i) => `${i + 1}`),
    F: [...Array(10)].map((_, i) => `${i + 1}`),
    G: [...Array(10)].map((_, i) => `${i + 1}`),
    H: [...Array(10)].map((_, i) => `${i + 1}`),
    I: [...Array(10)].map((_, i) => `${i + 1}`),
    J: [...Array(10)].map((_, i) => `${i + 1}`),
  };

  const isBooked = (id) => bookedSeats.includes(id);
  const isSelected = (id) => selectedSeats.some((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl text-center py-8">
        <div className="text-gray-500 flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500" />
          Loading seat availability...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl overflow-x-auto">
      {[
        [['A', 'B', 'C'], ticketPrices.RoyalTicketPrice, 'Royal'],
        [['D', 'E', 'F', 'G'], ticketPrices.ClubTicketPrice, 'Club'],
        [['H', 'I', 'J'], ticketPrices.ExecutiveTicketPrice, 'Executive'],
      ].map(([rows, price, label], idx) => (
        <div key={idx} className="mb-4">
          <h4 className="text-lg font-semibold mb-3 text-center border-b border-gray-300 pb-1">
            ₹{price?.toLocaleString?.() ?? 0} {label}
          </h4>

          {rows.map((row) => (
            <div key={row} className="mb-1">
              <div
                className="
                  grid
                  grid-cols-[30px_repeat(10,minmax(0,1fr))]
                  gap-[2px] px-2
                  md:grid-cols-[40px_repeat(10,minmax(0,1fr))]
                  md:gap-2 md:px-4
                "
              >
                <div className="flex items-center justify-center text-gray-500 font-medium">
                  {row}
                </div>

                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                  const id = `${row}${num}`;
                  const booked = isBooked(id);
                  const selected = isSelected(id);
                  const disabled = booked || (!selected && selectedSeats.length >= maxSeats);

                  return (
                    <button
                      key={id}
                      disabled={disabled}
                      onClick={() => !booked && onSeatSelect(row, price || 0, num)}
                      className={`
                        relative flex items-center justify-center font-bold rounded-md transition transform focus:outline-none
                        h-6 w-6 text-[10px]
                        md:h-7 md:w-7 md:text-sm
                        ${booked
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : selected
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                            : disabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-inner'
                              : 'border-2 border-green-300 text-black'
                        }
                      `}
                    >
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
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to left, #f97316 , #FA742B);
    border: none;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    gap: 10px;
    cursor: pointer;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
  }
  .Btn:active { transform: translateY(0); }
  .svgIcon { width: 20px; height: 20px; transition: all 0.3s ease; }

`;

/* Hides scrollbars for the showtime strip but keeps it scrollable */
const ShowtimeStrip = styled.div`
  .showtime-scroll::-webkit-scrollbar { display: none; }
  .showtime-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

export default Ticketbooking;
