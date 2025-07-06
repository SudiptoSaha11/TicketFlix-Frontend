import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  FilmIcon,
  TicketIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-[#1a1a1a] border-t border-gray-800 shadow-[0_-4px_15px_rgba(0,0,0,0.5)] flex justify-around items-center py-1 z-50 md:hidden">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center no-underline text-xs p-2 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'text-orange-500' 
              : 'text-gray-400'
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex flex-col items-center">
            <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
              <HomeIcon className="h-5 w-5" />
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="mt-0.5">Home</span>
          </div>
        )}
      </NavLink>

      <NavLink
        to="/MoviePage"
        className={({ isActive }) =>
          `flex flex-col items-center no-underline text-xs p-2 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'text-orange-500' 
              : 'text-gray-400'
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex flex-col items-center">
            <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
              <FilmIcon className="h-5 w-5" />
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="mt-0.5">Movies</span>
          </div>
        )}
      </NavLink>

      <NavLink
        to="/comingsoon"
        className={({ isActive }) =>
          `flex flex-col items-center no-underline text-xs p-2 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'text-orange-500' 
              : 'text-gray-400'
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex flex-col items-center">
            <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
              <CalendarIcon className="h-5 w-5" />
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="mt-0.5">Coming</span>
          </div>
        )}
      </NavLink>

      <NavLink
        to="/event"
        className={({ isActive }) =>
          `flex flex-col items-center no-underline text-xs p-2 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'text-orange-500' 
              : 'text-gray-400'
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex flex-col items-center">
            <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
              <TicketIcon className="h-5 w-5" />
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="mt-0.5">Events</span>
          </div>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;