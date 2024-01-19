import React, { useEffect, useRef, useState } from 'react';

// css
import './GeneralInput.css';

// externals
import { v4 as uuidv4 } from 'uuid';

const GeneralInput = ({ placeholder, maxChars, text, setText }) => {
  const [charsWritten, setCharsWritten] = useState(0);
  const idRef = useRef(uuidv4());

  // if text is present apply styling to input on component load
  useEffect(() => {
    if (text && text !== '') {
      const input = document.getElementById(`${idRef.current}`);
      input.value = text;
      const label = input.closest('label');
      label.querySelector('.input-placeholder').classList.add('active');
      label.querySelector('.input-placeholder').classList.add('no-color');
      setCharsWritten(text.length);
    }
  }, []);

  useEffect(() => {
    console.log({ text });
  }, [text]);

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

    if (inputValue && inputValue !== '') {
      label.querySelector('.input-placeholder').classList.add('no-color');
    } else {
      label.querySelector('.input-placeholder').classList.remove('active');
    }
  };
  return (
    <div className="general-input">
      <label htmlFor={`${idRef.current}`}>
        <div className="input-placeholder">
          <span>{placeholder}</span>
        </div>
        <div className="input-counter">
          <span>
            {charsWritten}/{maxChars}
          </span>
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            autoCapitalize="sentences"
            autoComplete="on"
            autoCorrect="on"
            inputMode="text"
            maxLength={`${maxChars}`}
            name="text"
            spellCheck="false"
            id={`${idRef.current}`}
            onInput={(event) => inputHandler(event)}
            onFocus={(event) => focusHandlerInput(event)}
            onBlur={(event) => focusOutHandlerInput(event, text)}
          />
        </div>
      </label>
    </div>
  );
};

export default GeneralInput;
