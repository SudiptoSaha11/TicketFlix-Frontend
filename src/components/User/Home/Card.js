import React from 'react';

const Card = ({ image, movieName, movieGenre, onClick }) => {
  // Normalize genre: array -> joined string; comma-string -> trim each
  let genreText = '';
  if (Array.isArray(movieGenre)) {
    genreText = movieGenre.join(', ');
  } else if (typeof movieGenre === 'string') {
    genreText = movieGenre.split(',').map(g => g.trim()).join(', ');
  }

  if (!genreText) genreText = 'Unknown genre';

  return (
    <div
      className="rounded-lg p-3 w-full max-w-[250px] 
                 lg:max-w-[220px] lg:h-[350px] xl:max-w-[250px] xl:h-[420px] xl:m-2"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="w-full">
        <img
          src={image}
          alt={movieName}
          className="w-full h-auto aspect-[12/17] object-cover rounded-[8px] transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </div>

      <div className="p-1 flex flex-col items-start text-start lg:mb-[15px]">
        <h2
          className="text-[0.95rem] font-semibold my-0 text-[#222] no-underline hover:no-underline
                     sm:text-[1rem] lg:text-[1.01rem] xl:text-[1.2rem]"
        >
          {movieName}
        </h2>

        <p
          className="mt-1 text-sm text-gray-600 leading-tight break-words"
          aria-label="movie-genre"
        >
          {genreText}
        </p>
      </div>
    </div>
  );
};

export default Card;
