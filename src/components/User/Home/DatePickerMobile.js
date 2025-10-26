// src/components/User/Home/DatePickerMobile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function DatePickerMobile({ onDateSelect, disabledDate }) {
  const daysToShow = 7;
  const today = dayjs().startOf('day');
  const [startDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);

  const dates = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => {
      const d = startDate.add(i, 'day');
      return {
        abbrevDay: d.format('ddd').toUpperCase(),
        dateNum: d.format('D'),
        abbrevMon: d.format('MMM').toUpperCase(),
        full: d,
      };
    });
  }, [startDate]);

  // Pick initial date: today if enabled, else first enabled date in range
  useEffect(() => {
    const isTodayDisabled =
      typeof disabledDate === 'function' ? disabledDate(today) : false;

    if (!isTodayDisabled) {
      onDateSelect?.(today);
      setSelectedDate(today);
      return;
    }

    const firstEnabled = dates.find(
      (item) => !(typeof disabledDate === 'function' && disabledDate(item.full))
    );
    if (firstEnabled) {
      setSelectedDate(firstEnabled.full);
      onDateSelect?.(firstEnabled.full);
    }
    // run on mount and when disabledDate/dates changes (e.g., new availability)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledDate, dates]);

  const handleClick = (item) => {
    const isDisabled =
      typeof disabledDate === 'function' ? disabledDate(item.full) : false;
    if (isDisabled) return;

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
        {dates.map((item) => {
          const active = selectedDate.isSame(item.full, 'day');
          const isDisabled =
            typeof disabledDate === 'function' ? disabledDate(item.full) : false;

          return (
            <SwiperSlide key={item.full.valueOf()}>
              <div
                onClick={() => handleClick(item)}
                className={`
                  flex flex-col items-center justify-center
                  rounded-lg select-none
                  transition-colors duration-150 py-2
                  ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                  ${
                    active
                      ? 'bg-orange-500 text-white'
                      : isDisabled
                      ? 'bg-white text-gray-400'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={isDisabled ? 'Booking not open for this date' : undefined}
                aria-disabled={isDisabled ? 'true' : 'false'}
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
