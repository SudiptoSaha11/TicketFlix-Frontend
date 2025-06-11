import React from 'react';

const EventCard = ({ image, eventName, eventVenue, onClick }) => {
  return (
    <div className="border-none rounded-lg  p-3 w-[60%] h-[60%]
                    lg:w-[220px] lg:h-[350px]
                    xl:shadow-md xl:w-[250px] xl:h-[420px] xl:m-2" onClick={onClick}>
      {image ? (
        <img
          src={image}
          alt={eventName}
          class="w-[220px] aspect-[12/17] object-cover rounded-[8px]
           border-none outline-none shadow-none transition-transform duration-300 ease-in-out hover:scale-105"
          
        />
      ) : (
        <div className="w-full h-auto rounded">
          <p>No image available</p>
        </div>
      )}
      <div className="p-1 flex flex-col items-start text-start mb-[15px] ">
        <h2 className="text-[0.9rem] font-extrabold my-0 text-[#222] no-underline hover:no-underline
                       sm: text-[1rem]
                       lg:text-[1rem]
                       xl:text-[1.2rem]">{eventName}</h2>
        <p className=" text-sm text-gray-600 w-[50%] no-underline hidden">{eventVenue}</p>

      </div>
    </div>
  );
};

export default EventCard;