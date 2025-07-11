// src/components/User/Home/DatePickerMobile.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function DatePickerMobile({ onDateSelect }) {
  const daysToShow = 7;
  const today = dayjs().startOf('day');
  const [startDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  // Fire the callback with the default date on mount
  useEffect(() => {
    onDateSelect?.(today);
  }, []); // run only once

  const dates = Array.from({ length: daysToShow }).map((_, i) => {
    const d = startDate.add(i, 'day');
    return {
      abbrevDay: d.format('ddd').toUpperCase(),
      dateNum: d.format('D'),
      abbrevMon: d.format('MMM').toUpperCase(),
      full: d,
    };
  });

  const handleClick = (item) => {
    setSelectedDate(item.full);
    onDateSelect?.(item.full);
  };

  return (
    <div className="sm:hidden">
      <Swiper
        slidesPerView={5}
        spaceBetween={4}
        freeMode={true}
        className="px-2 py-2"
      >
        {dates.map(item => {
          const active = selectedDate.isSame(item.full, 'day');
          return (
            <SwiperSlide key={item.full.valueOf()}>
              <div
                onClick={() => handleClick(item)}
                className={`
                  flex flex-col items-center justify-center
                  rounded-lg cursor-pointer select-none
                  transition-colors duration-150 py-2
                  ${active 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'}
                `}
              >
                <div className="text-xs font-medium">{item.abbrevDay}</div>
                <div className="text-lg font-bold my-1">{item.dateNum}</div>
                <div className="text-xs">{item.abbrevMon}</div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
