import React, { useState } from 'react';
import { Form, Link, redirect, useNavigate } from 'react-router-dom';

// firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

// css
import './Login.css';

// components
import PageHeader from '../../components/PageHeader/PageHeader';

// utils
import svgs from '../../utils/svgs';

const Login = () => {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // build left element
  const leftElement = (
    <div>
      <button type="button" onClick={() => navigate('/home')}>
        <svg viewBox="0 0 24 24">
          <path d={svgs.x} />
        </svg>
      </button>
    </div>
  );

  // build middle element
  const middleElement = (
    <div>
      <svg viewBox="0 0 24 24">
        <path d={svgs.bird} />
      </svg>
    </div>
  );

  // build right element
  const rightElement = <div className="filler" />;

  return (
    <div id="login">
      <div id="login-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      <div id="login-content">
        <Form method="post" action="/i/flow/login">
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
                name="email"
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
                name="password"
                onInput={() => passwordChangeHandler(setPasswordInput)}
                onFocus={(event) => focusHandlerInput(event)}
                onBlur={(event) => focusOutHandlerInput(event, passwordInput)}
                // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^\-_])[A-Za-z\d@$!%*?&#^\-_]{8,30}$"
              />
            </div>
          </label>
          <div className="button-wrapper">
            <button type="submit" className="u-round" id="submit-form-button">
              Sign in
            </button>
          </div>
        </Form>
        <div id="login-no-account">
          <span>
            Don&#39;t have an account?&#160;
            <Link to="/i/flow/signup">Sign up</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

// action
export const loginFormAction = async ({ request }) => {
  const data = await request.formData();
  const email = data.get('email');
  const password = data.get('password');

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return redirect('/home');
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
