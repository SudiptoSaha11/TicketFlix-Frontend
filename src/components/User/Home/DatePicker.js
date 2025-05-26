// DatePicker.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';
import './DatePicker.css';

function DatePicker({ onDateSelect }) {
  const daysToShow = 7; // Number of days to display at once
  const today = dayjs().startOf('day'); // "Today" normalized to midnight

  // Start with today's date as the beginning of the displayed window
  const [startDate, setStartDate] = useState(today);
  // Track the selected date (default to today)
  const [selectedDate, setSelectedDate] = useState(today);

  // Generate an array of dates for the current "window"
  const dates = Array.from({ length: daysToShow }).map((_, i) => {
    const currentDay = startDate.add(i, 'day');
    return {
      day: currentDay.format('ddd'),    // e.g. "Thu"
      dateNum: currentDay.format('D'),    // e.g. "20"
      month: currentDay.format('MMM'),    // e.g. "Feb"
      fullDate: currentDay,               // Store the full dayjs object
    };
  });

  // Handlers for left/right arrows
  const handlePrevious = () => {
    if (!startDate.isSame(today, 'day')) {
      setStartDate(startDate.subtract(daysToShow, 'day'));
    }
  };

  const handleNext = () => {
    setStartDate(startDate.add(daysToShow, 'day'));
  };

  // When a date is clicked, update local state and notify the parent
  const handleDateClick = (date) => {
    setSelectedDate(date.fullDate);
    if (onDateSelect) {
      onDateSelect(date.fullDate);
    }
  };

  // Disable the left arrow if we are at today
  const isLeftDisabled = startDate.isSame(today, 'day');

  return (
    <div className="date-picker-container">
      {/* Left arrow */}
      <div
        className={`arrow arrow-left ${isLeftDisabled ? 'disabled' : ''}`}
        onClick={isLeftDisabled ? null : handlePrevious}
      >
        &lsaquo;
      </div>

      {/* The horizontal date list */}
      <div className="date-picker">
        {dates.map((item, index) => (
          <div
            key={index}
            className={`date-item ${
              selectedDate.isSame(item.fullDate, 'day') ? 'selected' : ''
            }`}
            onClick={() => handleDateClick(item)}
          >
            <div className="day">{item.day}</div>
            <div className="date-num">{item.dateNum}</div>
            <div className="month">{item.month}</div>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <div className="arrow arrow-right" onClick={handleNext}>
        &rsaquo;
      </div>
    </div>
  );
}

export default DatePicker;
