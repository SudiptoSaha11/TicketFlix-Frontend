import React from 'react';

const EventCard = ({ image, eventName, eventVenue, onClick }) => {
  return (
    <div className="border-none rounded-lg shadow-md p-3 m-2 w-[250px] h-[450px] text-start flex flex-col items-start justify-start" onClick={onClick} style={{ cursor: 'pointer', border: '1px solid #ddd', padding: '10px', margin: '10px' }}>
      {image ? (
        <img
          src={image}
          alt={eventName}
          class="w-[220px] aspect-[12/17] object-cover rounded-[1px] border-none outline-none shadow-none transition-transform duration-300 ease-in-out hover:scale-105"
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      ) : (
        <div className="w-full h-auto rounded">
          <p>No image available</p>
        </div>
      )}
      <div className="p-2 flex flex-col items-start text-start h-[120px]">
        <h2 className="text-[1.2rem] font-extrabold my-2 text-[#222] no-underline hover:no-underline">{eventName}</h2>
        <p className="mt-1 text-sm text-gray-600 w-[220px] no-underline">{eventVenue}</p>

      </div>
    </div>
  );
};

export default EventCard;