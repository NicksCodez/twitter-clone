import React, { useEffect, useState } from 'react';
import { Form, Link } from 'react-router-dom';

// css
import './SignUp.css';

// utils
import svgs from '../../utils/svgs';

const SignUp = () => {
  // store input values in state for client side validation
  const [nameInput, setNameInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('');
  // start with all inputs not valid
  const [inputsState, setInputsState] = useState({
    name: false,
    tag: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    // only make submit button clickable if all inputs are valid
    const submitButton = document.getElementById('submit-form-button');
    if (Object.values(inputsState).includes(false)) {
      submitButton.classList.remove('active');
    } else {
      submitButton.classList.add('active');
    }
  }, [inputsState]);

  return (
    <div id="signup">
      <div id="signup-header">
        <div>
          <svg viewBox="0 0 24 24">
            <path d={svgs.x} />
          </svg>
        </div>
        <div>
          <svg viewBox="0 0 24 24">
            <path d={svgs.bird} />
          </svg>
        </div>
        <div className="filler" />
      </div>
      <div id="signup-content">
        <Form>
          <h2>Join Twitter today</h2>
          <label htmlFor="nameInput">
            <div className="input-placeholder">
              <span>Name</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="text"
                id="nameInput"
                onInput={() => nameChangeHandler(setNameInput, setInputsState)}
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, nameInput)}
              />
            </div>
          </label>
          <div className="error">
            <span>Name cannot be empty</span>
          </div>
          <label htmlFor="tagInput">
            <div className="input-placeholder">
              <span>Tag</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="text"
                id="tagInput"
                onInput={() => tagChangeHandler(setTagInput, setInputsState)}
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, tagInput)}
              />
            </div>
          </label>
          <div className="error">
            <span>Tag cannot be empty</span>
          </div>
          <label htmlFor="emailInput">
            <div className="input-placeholder">
              <span>Email</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="email"
                id="emailInput"
                onInput={() =>
                  emailChangeHandler(setEmailInput, setInputsState)
                }
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, emailInput)}
              />
            </div>
          </label>
          <div className="error">
            <span>Email cannot be empty</span>
          </div>
          <label htmlFor="passwordInput">
            <div className="input-placeholder">
              <span>Password</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="password"
                id="passwordInput"
                onInput={() =>
                  passwordChangeHandler(setPasswordInput, setInputsState)
                }
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, passwordInput)}
              />
            </div>
          </label>
          <div className="error">
            <span>Password cannot be empty</span>
          </div>
          <label htmlFor="passwordConfirmInput">
            <div className="input-placeholder">
              <span>Confirm Password</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="password"
                id="passwordConfirmInput"
                onInput={() =>
                  passwordConfirmChangeHandler(
                    setPasswordConfirmInput,
                    setInputsState
                  )
                }
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) =>
                  focusOutHandlerInput(event, passwordConfirmInput)
                }
              />
            </div>
          </label>
          <div className="error">
            <span>Passwords must match</span>
          </div>
          <div className="button-wrapper">
            <button type="submit" className="u-round" id="submit-form-button">
              Sign up
            </button>
          </div>
        </Form>
        <div id="signup-existing-account">
          <span>
            Have an account already?&#160;
            <Link to="/i/flow/login">Log in</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

// input change handlers

const nameChangeHandler = (setNameInput, setInputsState) => {
  // set state
  const nameInput = document.getElementById('nameInput');
  setNameInput(nameInput.value);

  // let user know if input is valid, if not tell him what is wrong
  const errorDiv = nameInput.closest('label').nextElementSibling;
  const validation = validateName(nameInput.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      name: true,
    }));
    errorDiv.classList.remove('active');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      name: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
  }
};

const tagChangeHandler = (setTagInput, setInputsState) => {
  // set state
  const tagInput = document.getElementById('tagInput');
  setTagInput(tagInput.value);

  // let user know if input is valid, if not tell him what is wrong
  const errorDiv = tagInput.closest('label').nextElementSibling;
  const validation = validateTag(tagInput.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      tag: true,
    }));
    errorDiv.classList.remove('active');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      tag: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
  }
};

const emailChangeHandler = (setEmailInput, setInputsState) => {
  // set state
  const emailInput = document.getElementById('emailInput');
  setEmailInput(emailInput.value);

  // let user know if input is valid, if not tell him what is wrong
  const errorDiv = emailInput.closest('label').nextElementSibling;
  const validation = validateEmail(emailInput.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      email: true,
    }));
    errorDiv.classList.remove('active');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      email: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
  }
};

const passwordChangeHandler = (setPasswordInput, setInputsState) => {
  // set state
  const passwordInput = document.getElementById('passwordInput');
  setPasswordInput(passwordInput.value);

  // let user know if input is valid, if not tell him what is wrong
  const errorDiv = passwordInput.closest('label').nextElementSibling;
  const validation = validatePassword(passwordInput.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      password: true,
    }));
    errorDiv.classList.remove('active');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      password: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
  }
};

const passwordConfirmChangeHandler = (
  setPasswordConfirmInput,
  setInputsState
) => {
  // set state
  const passwordConfirmInput = document.getElementById('passwordConfirmInput');
  setPasswordConfirmInput(passwordConfirmInput.value);

  // let user know if input is valid, if not tell him what is wrong
  const errorDiv = passwordConfirmInput.closest('label').nextElementSibling;
  const validation = validatePasswordConfirm(passwordConfirmInput.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      confirmPassword: true,
    }));
    errorDiv.classList.remove('active');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      confirmPassword: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
  }
};

// focus in, focus out handlers
const focusHandlerInput = (event) => {
  const label = event.target.closest('label');
  label.classList.add('active');

  label.querySelector('.input-placeholder').classList.add('active');
  label.querySelector('.input-placeholder').classList.remove('no-color');
};

const focusOutHandlerInput = (event, inputValue) => {
  const label = event.target.closest('label');
  label.classList.remove('active');

  if (inputValue !== '') {
    label.querySelector('.input-placeholder').classList.add('no-color');
  } else {
    label.querySelector('.input-placeholder').classList.remove('active');
  }
};

// form validation
const validateName = (name) => {
  if (name === '') return 'Name cannot be empty';
  const regex = /^[a-zA-Z0-9_]{1,50}$/;
  if (!regex.test(name))
    return 'Name can have only characters a-z, numbers 0-9 and underscore';
  return '';
};

const validateTag = (name) => {
  if (name === '') return 'Tag cannot be empty';
  const regex = /^[a-zA-Z0-9_]{4,15}$/;
  if (!regex.test(name))
    return 'Tags can have only characters a-z, numbers 0-9 and underscore, maximum 15 characters';
  return '';
};

const validateEmail = (name) => {
  if (name === '') return 'Email cannot be empty';
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(name))
    return 'That does not seem to be a valid email address';
  return '';
};

const validatePassword = (name) => {
  if (name === '') return 'Password cannot be empty';
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^\-_])[A-Za-z\d@$!%*?&#^\-_]{8,30}$/;
  if (!regex.test(name))
    return 'Password must be between 8 and 30 characters and contain at least one lowercase letter, one uppercase letter, one number and one special character';
  return '';
};

const validatePasswordConfirm = (name) => {
  const passwordInput = document.getElementById('passwordInput');
  if (name !== passwordInput.value) return 'Passwords must be the same';
  return '';
};

export default SignUp;
