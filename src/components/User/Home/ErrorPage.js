import React from 'react';
import './ErrorPage.css'

const ErrorPage = () => {
  return (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <h1 className="error-header">Booking Failed!</h1>
      <p className="Error-message">Something went wrong. Please try again later.</p>
      <button className="error-back-button" onClick={() => window.location.href = '/'}>Back to Home</button>
    </div>
  );
};

export default ErrorPage;