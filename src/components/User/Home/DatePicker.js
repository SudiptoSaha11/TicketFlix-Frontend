// src/components/User/Home/DatePicker.js
import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function DatePicker({ onDateSelect }) {
  const daysPerSlide = 7;
  const totalSlides = 2; // exactly 2 slides (7 + 7 = 14 days)
  const today = dayjs().startOf('day');

  const [page, setPage] = useState(0); // 0 = first 7 days, 1 = next 7 days
  const [selectedDate, setSelectedDate] = useState(today);

  const startDateForPage = today.add(page * daysPerSlide, 'day');

  const dates = Array.from({ length: daysPerSlide }).map((_, i) => {
    const currentDay = startDateForPage.add(i, 'day');
    return {
      day: currentDay.format('ddd'),
      dateNum: currentDay.format('D'),
      month: currentDay.format('MMM'),
      fullDate: currentDay,
    };
  });

  const isLeftDisabled = page === 0;
  const isRightDisabled = page === totalSlides - 1;

  const handlePrevious = () => {
    if (!isLeftDisabled) setPage((p) => Math.max(0, p - 1));
  };

  const handleNext = () => {
    if (!isRightDisabled) setPage((p) => Math.min(totalSlides - 1, p + 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date.fullDate);
    if (typeof onDateSelect === 'function') onDateSelect(date.fullDate);
  };

  return (
    <div
      className="
        flex items-center justify-center 
        w-full
        my-2
      "
    >
      <button
        onClick={handlePrevious}
        disabled={isLeftDisabled}
        aria-label="Previous week"
        className={`
          text-2xl
          sm:text-3xl
          select-none
          ${isLeftDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        &lsaquo;
      </button>

      <div
        className="
          flex 
          flex-1             
          justify-between    
          px-2              
          sm:px-4
          py-2
          bg-white
          rounded-md
          mx-3
        "
      >
        {dates.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleDateClick(item)}
            className={` 
              flex flex-col items-center justify-center 
              w-full       
              px-3         
              sm:px-4
              py-2
              rounded-lg
              cursor-pointer
              transition-colors duration-200
              focus:outline-none
              ${selectedDate.isSame(item.fullDate, 'day')
                ? 'bg-gradient-to-r from-amber-300 to-orange-500 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
              }
            `}
            style={{ flex: '1 1 0' }}
            aria-pressed={selectedDate.isSame(item.fullDate, 'day')}
            aria-label={`${item.day} ${item.dateNum} ${item.month}`}
          >
            <div className="font-medium">{item.day}</div>
            <div className="font-bold text-lg">{item.dateNum}</div>
            <div className="text-xs sm:text-sm">{item.month}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={isRightDisabled}
        aria-label="Next week"
        className={`
          text-2xl
          sm:text-3xl
          px-1
          select-none
          ${isRightDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        &rsaquo;
      </button>
    </div>
  );
}
