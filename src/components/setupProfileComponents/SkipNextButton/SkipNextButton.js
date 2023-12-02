import React from 'react';

// css
import './SkipNextButton.css';

const SkipNextButton = ({ inputSelected, currentStep, setCurrentStep }) => (
  <div
    className={inputSelected ? 'skip-next-button active' : 'skip-next-button'}
  >
    <button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
      <span>{inputSelected ? 'Next' : 'Skip for now'}</span>
    </button>
  </div>
);

export default SkipNextButton;
