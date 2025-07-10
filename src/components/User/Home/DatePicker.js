// src/components/User/Home/DatePicker.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function DatePicker({ onDateSelect }) {
  const daysToShow = 7; 
  const today = dayjs().startOf('day');
  const [startDate, setStartDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const dates = Array.from({ length: daysToShow }).map((_, i) => {
    const currentDay = startDate.add(i, 'day');
    return {
      day: currentDay.format('ddd'),
      dateNum: currentDay.format('D'),
      month: currentDay.format('MMM'),
      fullDate: currentDay,
    };
  });

  const isLeftDisabled = startDate.isSame(today, 'day');

  const handlePrevious = () => {
    if (!isLeftDisabled) setStartDate(startDate.subtract(daysToShow, 'day'));
  };
  const handleNext = () => setStartDate(startDate.add(daysToShow, 'day'));
  const handleDateClick = (date) => {
    setSelectedDate(date.fullDate);
    onDateSelect?.(date.fullDate);
  };

  return (
    <div
      className="
        inline-flex items-center justify-center 
        mx-auto              /* all screens: center horizontally */
        my-2                 /* all screens: vertical margin */
      "
    >
      {/* Left arrow */}
      <button
        onClick={handlePrevious}
        disabled={isLeftDisabled}
        className={`
          text-2xl            /* all screens: large arrow */
          sm:text-3xl         /* ≥640px: even larger */
          px-1                /* all screens: horizontal padding */
          ${isLeftDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        &lsaquo;
      </button>

      {/* Date list */}
      <div
        className="
          flex 
          gap-1               /* all: small gap */
          sm:gap-2            /* ≥640px: medium gap */
          px-2                /* all: horizontal padding */
          sm:px-4             /* ≥640px: more padding */
          py-1                /* all: vertical padding */
          bg-white 
          rounded-sm          /* all: slight rounding */
          overflow-x-auto     /* all: scroll if needed */
        "
      >
        {dates.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleDateClick(item)}
            className={`
              flex flex-col items-center justify-center 
              min-w-[40px]        
              sm:min-w-[50px]     
              px-2                
              sm:px-3             
              py-1                
              text-xs            
              sm:text-sm        
              rounded-lg 
              cursor-pointer 
              transition-colors duration-200
              ${
                selectedDate.isSame(item.fullDate, 'day')
                  ? 'bg-gradient-to-r from-amber-300 to-orange-500 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
              }
            `}
          >
            <div className="font-medium">{item.day}</div>
            <div className="font-semibold">{item.dateNum}</div>
            <div className="text-[0.6rem] sm:text-xs">{item.month}</div>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={handleNext}
        className="
          text-2xl            
          sm:text-3xl        
          px-1                
          cursor-pointer      
        "
      >
        &rsaquo;
      </button>
    </div>
  );
}
