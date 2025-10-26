import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

export default function DatePicker({ onDateSelect, disabledDate }) {
  const daysToShow = 7;
  const today = dayjs().startOf('day');

  // allow booking up to N days ahead (inclusive)
  const bookableDaysAhead = 3;
  const maxBookableDate = today.add(bookableDaysAhead, 'day');

  const [startDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const dates = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => {
      const currentDay = startDate.add(i, 'day');
      return {
        day: currentDay.format('ddd'),
        dateNum: currentDay.format('D'),
        month: currentDay.format('MMM'),
        fullDate: currentDay,
      };
    });
  }, [startDate, daysToShow]);

  useEffect(() => {
    const isSelDisabled =
      selectedDate.isAfter(maxBookableDate, 'day') ||
      (typeof disabledDate === 'function' && disabledDate(selectedDate));

    if (!isSelDisabled) return;

    const firstEnabled = dates.find(
      (d) =>
        !d.fullDate.isAfter(maxBookableDate, 'day') &&
        !(typeof disabledDate === 'function' && disabledDate(d.fullDate))
    );

    if (firstEnabled) {
      setSelectedDate(firstEnabled.fullDate);
      onDateSelect?.(firstEnabled.fullDate);
    }
  }, [dates, disabledDate, onDateSelect, selectedDate, maxBookableDate]);

  const handleDateClick = (date) => {
    const beyondWindow = date.fullDate.isAfter(maxBookableDate, 'day');
    const customDisabled =
      typeof disabledDate === 'function' ? disabledDate(date.fullDate) : false;

    if (beyondWindow || customDisabled) return;

    setSelectedDate(date.fullDate);
    onDateSelect?.(date.fullDate);
  };

  return (
    <div className="flex items-center justify-center w-full my-2">
      <div className="flex flex-1 justify-between px-2 sm:px-4 py-2 bg-white rounded-md">
        {dates.map((item, idx) => {
          const beyondWindow = item.fullDate.isAfter(maxBookableDate, 'day');
          const customDisabled =
            typeof disabledDate === 'function' ? disabledDate(item.fullDate) : false;
          const isDisabled = beyondWindow || customDisabled;

          return (
            <div
              key={idx}
              onClick={() => !isDisabled && handleDateClick(item)}
              className={`
        flex flex-col items-center justify-center 
        w-full px-3 sm:px-4 py-2 rounded-lg
        ${isDisabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'cursor-pointer bg-white text-gray-800'
                }
        transition-colors duration-200
        ${selectedDate.isSame(item.fullDate, 'day') && !isDisabled
                  ? 'bg-gradient-to-r from-amber-300 to-orange-500 text-white'
                  : ''
                }
      `}
              style={{ flex: '1 1 0' }}
              role="button"
              aria-disabled={isDisabled ? 'true' : 'false'}
              title={isDisabled ? 'Booking not open for this date' : undefined}
            >
              <div className="font-medium">{item.day}</div>
              <div className="font-bold text-lg">{item.dateNum}</div>
              <div className="text-xs sm:text-sm">{item.month}</div>
            </div>
          );
        })}


      </div>
    </div>
  );
}
