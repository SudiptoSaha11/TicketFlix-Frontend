import React from 'react';

import './LoadingSpinner.css';

const LoadingSpinner = props => {
  return (
    <div className={`${props.asOverlay && 'container'}`}>
      <div class="loader"></div>
      <div class="loader"></div>
      <div class="loader"></div>
    </div>
  );
};

export default LoadingSpinner;
