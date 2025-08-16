// src/UserBeverage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../Utils/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c'
);

const TABS = ['All', 'Beverages', 'Combos', 'Snacks'];

const matchesTab = (itemCategory, tab) => {
  if (tab === 'All') return true;
  if (tab === 'Beverages') {
    return ['Soft Drink', 'Juice', 'Water', 'Coffee', 'Tea'].includes(itemCategory);
  }
  if (tab === 'Combos') {
    return itemCategory === 'Snack Combo';
  }
  if (tab === 'Snacks') {
    return !matchesTab(itemCategory, 'Beverages') && !matchesTab(itemCategory, 'Combos');
  }
  return false;
};

const UserBeverage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const booking = JSON.parse(sessionStorage.getItem('bookingDetails') || '{}');
  const movieName = booking.Name || '';
  const showTime = booking.Time || '';
  const bookingTotal = booking.totalAmount || 0;

  useEffect(() => {
    api
      .get('/beverages')
      .then(res => {
        setItems(res.data);
        const init = {};
        res.data.forEach(item => { init[item._id] = 0; });
        setQuantities(init);
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const filtered = items.filter(item => {
    if (!matchesTab(item.category, activeTab)) return false;
    if (search && !item.beverageName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const increase = id => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };
  
  const decrease = id => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(prev[id] - 1, 0) }));
  };

  // Get selected items and calculate total
  const selectedItems = filtered
    .filter(item => quantities[item._id] > 0)
    .map(item => ({
      ...item,
      quantity: quantities[item._id],
      price: item.sizes[0]?.price || 0
    }));
  
  const foodTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grandTotal = bookingTotal + foodTotal;

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

  const handleContinue = async () => {
    try {
      const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails') || '{}');
      const food = filtered
        .filter(item => quantities[item._id] > 0)
        .map(item => ({
          _id: item._id,
          beverageName: item.beverageName,
          category: item.category,
          size: item.sizes[0]?.label,
          price: item.sizes[0]?.price,
          quantity: quantities[item._id]
        }));
      const body = {
        Name: bookingDetails.Name,
        seats: bookingDetails.seats,
        food,
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
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-white overflow-x-hidden lg:flex lg:mt-4">
      {/* Main Content - Left Column */}
      <div className="w-full lg:w-2/3 lg:pr-4">
        {/* Movie + Showtime */}
        {(movieName || showTime) && (
          <div className="px-4 pt-4">
            {movieName && <h2 className="text-base text-gray-700 xl:text-lg">Movie: {movieName}</h2>}
            {showTime && <h3 className="text-sm text-gray-600 xl:text-base">Showtime: {showTime}</h3>}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10 shadow-sm">
          <button 
            onClick={() => navigate(-1)} 
            className="text-orange-500 text-xl"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">
            Ticket <span className="text-orange-500">Flix</span> Bites
          </h1>
          <button 
            className="text-orange-500 font-medium" 
            onClick={handleSkip}
          >
            Skip
          </button>
        </div>

        {/* Subtitle */}
        <p className="px-4 py-2 text-gray-600 text-sm lg:text-base">
          Now get your favorite snack at a <span className="text-orange-500 font-medium">discounted</span> price!
        </p>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            placeholder="Search for F&B Items"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 hover:text-orange-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Items */}
        <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-lg:mb-44">
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No items found. Try another search or category.
            </div>
          )}
          {filtered.map((item) => {
            const qty = quantities[item._id] || 0;
            const price = item.sizes[0]?.price ?? '--';
            return (
              <div
                key={item._id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-center mb-3">
                    <img
                      src={item.image}
                      alt={item.beverageName}
                      className="h-32 w-32 object-contain rounded-lg"
                    />
                  </div>
                  <h2 className="text-base font-semibold mt-2">{item.beverageName}</h2>
                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">₹{price}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decrease(item._id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        qty > 0 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      disabled={qty === 0}
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{qty}</span>
                    <button
                      onClick={() => increase(item._id)}
                      className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary - Right Column (Desktop) */}
      <div className="hidden lg:block lg:w-1/3 lg:pl-4 lg:border-l mt-4">
        <div className="sticky top-2 h-screen overflow-y-hidden">
          <div className="bg-orange-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span>Your Order</span>
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedItems.length}
              </span>
            </h2>
            
            {selectedItems.length > 0 ? (
              <>
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                  {selectedItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <h5 className="font-medium">{item.beverageName}</h5>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x ₹{item.price}
                        </p>
                      </div >
                      <div className='lg:pb-10'>
                        <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Seats Total:</span>
                    <span>₹{bookingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Food & Drinks:</span>
                    <span>₹{foodTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Grand Total:</span>
                    <span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                <p className="mt-4 text-gray-500">No items selected yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add items from the menu
                </p>
              </div>
            )}
            
            <button
              onClick={handleContinue}
              className={`w-full py-3 mt-6 font-bold rounded-xl transition-all ${
                selectedItems.length > 0
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {selectedItems.length > 0 
                ? `Continue to Payment - ₹${grandTotal.toFixed(2)}` 
                : 'Continue Without Items'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Order Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
        <div className="p-4 bg-orange-50">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold">Your Order</h3>
              {selectedItems.length > 0 && (
              <p className="text-sm text-gray-600">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} 
                  <span className="ml-2">₹{foodTotal.toFixed(2)}</span>
                </p>
              )}
            </div>
            <button 
              onClick={handleContinue}
              className={`px-4 py-2 rounded-xl font-bold mb-2 ${
                selectedItems.length > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {selectedItems.length > 0 ? 'Continue' : 'Skip'}
            </button>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="mt-2 pt-2 border-t lg:max-h-32 max-h-16 overflow-y-auto">
              {selectedItems.map(item => (
                <div key={item._id} className="flex justify-between text-sm py-1">
                  <span>
                    {item.beverageName} 
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBeverage;