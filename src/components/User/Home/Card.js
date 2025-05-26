import React from 'react';
import './Card.css'; // Adjust path as needed

const Card = ({ image, movieName, movieGenre, movieLanguage, movieFormat, onClick }) => {
  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <img src={image} alt={movieName} className="card-image" />
      <div className="card-details">
        <h2 className="card-title">{movieName}</h2>
        <p className="card-genre">{movieGenre}</p>
        <p className="card-format">{movieFormat}</p>
        <p className="card-language">{movieLanguage}</p>

      </div>
    </div>
  );
};

export default Card;


