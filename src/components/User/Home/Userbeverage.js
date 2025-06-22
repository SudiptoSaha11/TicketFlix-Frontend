import React, { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import axios                    from 'axios';
import { loadStripe }           from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c'
);

const TABS = ['All', 'Beverages', 'Combos', 'Snacks'];

// helper to decide which category falls under which tab
const matchesTab = (itemCategory, tab) => {
  if (tab === 'All') return true;
  if (tab === 'Beverages') {
    return ['Soft Drink', 'Juice', 'Water', 'Coffee', 'Tea'].includes(itemCategory);
  }
  if (tab === 'Combos') {
    return itemCategory === 'Snack Combo';
  }
  if (tab === 'Snacks') {
    // anything not beverages or combos
    return !matchesTab(itemCategory, 'Beverages') &&
           !matchesTab(itemCategory, 'Combos');
  }
  return false;
};

const UserBeverage = () => {
  const navigate = useNavigate();
  const [items, setItems]         = useState([]);
  const [selection, setSelection] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');

  // pull movie name + time
  const booking   = JSON.parse(sessionStorage.getItem('bookingDetails') || '{}');
  const movieName = booking.Name || '';
  const showTime  = booking.Time || '';

  // fetch all beverages
  useEffect(() => {
    axios
      .get('https://ticketflix-backend.onrender.com/beverages')
      .then(res => setItems(res.data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  // filter by tab + search
  const filtered = items.filter(item => {
    if (!matchesTab(item.category, activeTab)) return false;
    if (search && !item.beverageName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // toggle selection
  const toggleItem = item => {
    setSelection(prev =>
      prev.some(x => x._id === item._id)
        ? prev.filter(x => x._id !== item._id)
        : [...prev, item]
    );
  };

  // Skip: only seats
  const handleSkip = async () => {
    try {
      const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails') || '{}');
      const body = {
        Name: bookingDetails.Name,
        seats: bookingDetails.seats,
        totalAmount: bookingDetails.totalAmount,
      };
      const resp = await fetch('https://ticketflix-backend.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || resp.status);
      }
      const { id: sessionId } = await resp.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error('Skip error:', err);
    }
  };

  // Continue: include food
  const handleContinue = async () => {
    try {
      const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails') || '{}');
      const foodTotal = selection.reduce(
        (sum, i) => sum + (i.sizes[0]?.price || 0),
        0
      );
      const body = {
        Name: bookingDetails.Name,
        seats: bookingDetails.seats,
        food: selection,
        totalAmount: bookingDetails.totalAmount + foodTotal,
      };
      const resp = await fetch('https://ticketflix-backend.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || resp.status);
      }
      const { id: sessionId } = await resp.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error('Continue error:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white overflow-x-hidden 2xl:max-w-5xl">
      {/* Movie + Showtime */}
      {(movieName || showTime) && (
        <div className="px-4 pt-4">
          {movieName && <h2 className="text-base text-gray-700 xl:text-lg">Movie: {movieName}</h2>}
          {showTime && <h3 className="text-sm text-gray-600 xl:text-base">Showtime: {showTime}</h3>}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)}>←</button>
        <h1 className="text-xl font-medium">Ticket Flix <span className="text-orange-400">Bites!</span></h1>
        <button className="text-orange-400" onClick={handleSkip}>Skip</button>
      </div>

      {/* Subtitle */}
      <p className="px-4 text-gray-600">
        Now get your favorite snack at a <span className="text-orange-400">discounted</span> price!
      </p>

      {/* Search */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Search for F&B Items"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex flex-wrap gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
                  ? 'border-b-2 border-orange-400 text-orange-400'
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="px-4 max-lg:pt-4 max-lg:pb-28 lg:py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No items found.</div>
        )}
        {filtered.map((item) => {
          const isSelected = selection.some((x) => x._id === item._id);
          const price      = item.sizes[0]?.price ?? '--';
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.image}
                  alt={item.beverageName}
                  className="h-24 w-24 object-cover rounded-lg mb-3"
                />
                <h2 className="text-sm font-medium">{item.beverageName}</h2>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">₹{price}</span>
                <button
                  onClick={() => toggleItem(item)}
                  className={`px-4 py-1 rounded border ${
                    isSelected
                      ? 'bg-orange-400 text-white border-orange-400'
                      : 'text-orange-400 border-orange-400'
                  }`}
                >
                  {isSelected ? 'Remove' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue */}
      <div className="max-lg:fixed bottom-0 max-lg:left-0 w-full bg-white p-4 lg:w-[20rem] lg:flex lg:mx-auto">
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-black text-white font-bold rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default UserBeverage;
