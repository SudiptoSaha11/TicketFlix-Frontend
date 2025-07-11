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
        flex items-center justify-center 
        w-full
        my-2
      "
    >
      <button
        onClick={handlePrevious}
        disabled={isLeftDisabled}
        className={`
          text-2xl
          sm:text-3xl
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
        "
      >
        {dates.map((item, idx) => (
          <div
            key={idx}
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
              ${
                selectedDate.isSame(item.fullDate, 'day')
                  ? 'bg-gradient-to-r from-amber-300 to-orange-500 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
              }
            `}
            style={{ flex: '1 1 0' }}  // Force each block to evenly distribute
          >
            <div className="font-medium">{item.day}</div>
            <div className="font-bold text-lg">{item.dateNum}</div>
            <div className="text-xs sm:text-sm">{item.month}</div>
          </div>
        ))}
      </div>

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
