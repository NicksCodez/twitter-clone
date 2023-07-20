import React, { useState } from 'react';
import { Form, Link } from 'react-router-dom';

// css
import './Login.css';

// utils
import svgs from '../../utils/svgs';

const Login = () => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  return (
    <div id="login">
      <div id="login-header">
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
      <div id="login-content">
        <Form>
          <h2>Sign in to Twitter</h2>
          <label htmlFor="emailInput">
            <div className="input-placeholder">
              <span>Email</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="email"
                id="emailInput"
                onInput={() => emailChangeHandler(setEmailInput)}
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, emailInput)}
              />
            </div>
          </label>
          <label htmlFor="passwordInput">
            <div className="input-placeholder">
              <span>Password</span>
            </div>
            <div className="input-wrapper">
              <input
                required
                type="password"
                id="passwordInput"
                onInput={() => passwordChangeHandler(setPasswordInput)}
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, passwordInput)}
                // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^\-_])[A-Za-z\d@$!%*?&#^\-_]{8,30}$"
              />
            </div>
          </label>
        </Form>
        <div id="login-forgot-account">
          <span>
            Don&#39;t have an account?&#160;
            <Link to="/i/flow/signup">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

const emailChangeHandler = (setEmailInput) => {
  const emailInput = document.getElementById('emailInput');
  setEmailInput(emailInput.value);
};

const passwordChangeHandler = (setPasswordInput) => {
  const passwordInput = document.getElementById('passwordInput');
  setPasswordInput(passwordInput.value);
};

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

export default Login;
