import React, { useState } from 'react';

// css
import './SetupProfileBio.css';

// components
import SkipNextButton from '../SkipNextButton/SkipNextButton';
import TitleSubtitle from '../TitleSubtitle/TiteSubtitle';

const SetupProfileBio = ({ text, setText, currentStep, setCurrentStep }) => {
  const [charsWritten, setCharsWritten] = useState(0);

  // input handler
  const inputHandler = (event) => {
    setText(event.target.value);
    setCharsWritten(event.target.value.length);
  };

  // focus in, focus out handlers
  const focusHandlerInput = (event) => {
    const label = event.target.closest('label');
    label.classList.add('active');

    label.querySelector('.input-placeholder').classList.add('active');
    label.querySelector('.input-placeholder').classList.remove('no-color');
    label.querySelector('.input-counter').classList.add('active');
  };

  const focusOutHandlerInput = async (event, inputValue) => {
    const label = event.target.closest('label');
    label.classList.remove('active');
    label.querySelector('.input-counter').classList.remove('active');

    if (inputValue !== '') {
      label.querySelector('.input-placeholder').classList.add('no-color');
    } else {
      label.querySelector('.input-placeholder').classList.remove('active');
    }
  };

  return (
    <div id="setup-profile-bio">
      <TitleSubtitle
        title="Describe yourself"
        subtitle="What makes you special? Don't think too hard, just have fun with it"
      />
      <div className="input-zone">
        <label htmlFor="bioInput">
          <div className="input-placeholder">
            <span>Your bio</span>
          </div>
          <div className="input-counter">
            <span>{charsWritten}/160</span>
          </div>
          <div className="input-wrapper">
            <textarea
              autoCapitalize="sentences"
              autoComplete="on"
              autoCorrect="on"
              inputMode="text"
              maxLength="160"
              name="text"
              spellCheck="false"
              id="bioInput"
              onInput={(event) => inputHandler(event)}
              onFocus={(event) => focusHandlerInput(event)}
              onBlur={(event) => focusOutHandlerInput(event, text)}
            />
          </div>
        </label>
      </div>
      <SkipNextButton
        inputSelected={text}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default SetupProfileBio;
