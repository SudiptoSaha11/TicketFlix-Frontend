import React from 'react';

const Card = ({ image, movieName, movieGenre, onClick }) => {
  return (
    
    <div
      className="border-none rounded-lg  p-2  w-[60%] h-[60%] "
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={image}
        alt={movieName}
        className="w-[100%] aspect-[12/17] object-cover rounded-[8px] border-none outline-none shadow-none transition-transform duration-300 ease-in-out hover:scale-105"
      />
      <div className="p-1 flex flex-col items-start text-start ">
        <h2 className="text-[0.9rem] font-extrabold my-2 text-[#222] no-underline hover:no-underline" >
          {movieName}
        </h2>
        <p className=" text-sm text-gray-600 w-[50%] no-underline hidden" >
          {movieGenre}
        </p>
      </div>
    </div>
    
  );
};

export default Card;