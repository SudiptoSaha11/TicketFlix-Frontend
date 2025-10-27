import React from 'react';

const Card = ({ image, movieName, movieGenre, onClick }) => {
  return (
    
    <div
      className="border-none rounded-lg p-3 w-[60%] h-[60%] 
                 lg:w-[220px] lg:h-[350px]
                 xl:w-[250px] xl:h-[420px] xl:p-3 xl:m-2 "
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={image}
        alt={movieName}
        className="w-[220px] aspect-[12/17] object-cover rounded-[8px] border-none outline-none shadow-none transition-transform duration-300 ease-in-out hover:scale-105"
      />
      <div className="p-1  flex flex-col items-start text-start no-underline text-blue-500 
                      lg:mb-[15px]">
        <h2 className="text-[0.9rem] font-semibold my-0 text-[#222] no-underline hover:no-underline
                       sm: text-[1rem]
                       lg:text-[1.01rem] 
                       xl:text-[1.2rem]" >
          {movieName}
        </h2>
        <div className="text-[0.75rem] text-[#555] 
                        sm:text-[0.8rem]
                        lg:text-[0.85rem]
                        xl:text-[0.9rem]">
          {movieGenre}
        </div>
      </div>
    </div>
    
  );
};

export default Card;