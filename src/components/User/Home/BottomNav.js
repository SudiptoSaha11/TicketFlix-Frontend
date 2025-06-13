import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, FilmIcon, TicketIcon, CalendarIcon } from '@heroicons/react/outline';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-[#222] border-t shadow-inner flex justify-around items-center py-2 z-50 md:hidden">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm no-underline ${isActive ? 'text-orange-500' : 'text-white'}`
        }
      >
        <HomeIcon className="h-6 w-6 mb-1" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/MoviePage"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm no-underline ${isActive ? 'text-orange-500' : 'text-white'}`
        }
      >
        <FilmIcon className="h-6 w-6 mb-1" />
        <span>Movies</span>
      </NavLink>

      <NavLink
        to="/comingsoon"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm no-underline ${isActive ? 'text-orange-500' : 'text-white'}`
        }
      >
        <CalendarIcon className="h-6 w-6 mb-1" />
        <span>Coming Soon</span>
      </NavLink>

      <NavLink
        to="/event"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm no-underline ${isActive ? 'text-orange-500' : 'text-white'}`
        }
      >
        <TicketIcon className="h-6 w-6 mb-1" />
        <span>Events</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;