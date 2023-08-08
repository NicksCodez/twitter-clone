import React, { useEffect, useRef, useState } from 'react';
import { Form, Link, redirect, useNavigate } from 'react-router-dom';

// css
import './SignUp.css';

// utils
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import svgs from '../../utils/svgs';

// firebase
import { auth } from '../../firebase';
import PageHeader from '../../components/PageHeader/PageHeader';

const SignUp = () => {
  const navigate = useNavigate();
  // keep track of first update, do not want some useEffect hooks to run on first update
  const firstUpdate = useRef(0);
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

  useEffect(() => {
    // when password is changed, automatically check confirm password
    // only if it is not first update, in order to start with blank styles
    if (firstUpdate.current < 2) {
      firstUpdate.current += 1;
    } else {
      inputChangeHandler(
        setPasswordConfirmInput,
        setInputsState,
        'passwordConfirmInput',
        'confirmPassword',
        validatePasswordConfirm
      );
    }
  }, [passwordInput]);

  useEffect(() => {
    // when confirm password is changed, automatically check password
    // only if it is not first update, in order to start with blank styles
    if (firstUpdate.current < 2) {
      firstUpdate.current += 1;
    } else {
      inputChangeHandler(
        setPasswordInput,
        setInputsState,
        'passwordInput',
        'password',
        validatePassword
      );
    }
  }, [passwordConfirmInput]);

  // build left element
  const leftElement = (
    <div>
      <button type='button' onClick={() => navigate('/home')}>
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
    <div id="signup">
      <div id="signup-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
        <div className="filler" />
      </div>
      <div id="signup-content">
        <Form method="post" action="/i/flow/signup">
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
                name="name"
                onInput={() =>
                  inputChangeHandler(
                    setNameInput,
                    setInputsState,
                    'nameInput',
                    'name',
                    validateName
                  )
                }
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
                name="tag"
                onInput={() =>
                  inputChangeHandler(
                    setTagInput,
                    setInputsState,
                    'tagInput',
                    'tag',
                    validateTag
                  )
                }
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
                name="email"
                onInput={() =>
                  inputChangeHandler(
                    setEmailInput,
                    setInputsState,
                    'emailInput',
                    'email',
                    validateEmail
                  )
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
                name="password"
                onInput={() =>
                  inputChangeHandler(
                    setPasswordInput,
                    setInputsState,
                    'passwordInput',
                    'password',
                    validatePassword
                  )
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
                name="confirmPassword"
                onInput={() =>
                  inputChangeHandler(
                    setPasswordConfirmInput,
                    setInputsState,
                    'passwordConfirmInput',
                    'confirmPassword',
                    validatePasswordConfirm
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

// form action
export const signUpFormAction = async ({ request }) => {
  const data = await request.formData();

  const name = data.get('name');
  const tag = data.get('tag');
  const email = data.get('email');
  const password = data.get('password');

  const newUserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  console.log(newUserCredential);
  try {
    await sendEmailVerification(newUserCredential.user);
  } catch (error) {
    console.error(error);
  }

  // await createUserWithEmailAndPassword(auth, email, password)
  //   .then((userCredential) => {
  //     const { user } = userCredential;
  //     console.log(user);
  //     sendEmailVerification(user).then(() => console.log('sent'));
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     console.log(errorCode, errorMessage);
  //   });

  return redirect('/i/flow/login');
};

// input change handlers
const inputChangeHandler = (
  setInput,
  setInputsState,
  inputID,
  inputState,
  validateFunction
) => {
  // set state
  const input = document.getElementById(inputID);
  setInput(input.value);

  // let user know if input is valid, if not tell him what is wrong
  const label = input.closest('label');
  const errorDiv = label.nextElementSibling;

  const validation = validateFunction(input.value);
  if (validation === '') {
    setInputsState((prevState) => ({
      ...prevState,
      [inputState]: true,
    }));
    errorDiv.classList.remove('active');
    label.classList.remove('error');
  } else {
    setInputsState((prevState) => ({
      ...prevState,
      [inputState]: false,
    }));
    errorDiv.firstChild.textContent = validation;
    errorDiv.classList.add('active');
    label.classList.add('error');
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
  const passwordConfirmInput = document.getElementById('passwordConfirmInput');
  if (name === '') return 'Password cannot be empty';
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^\-_])[A-Za-z\d@$!%*?&#^\-_]{8,30}$/;
  if (!regex.test(name))
    return 'Password must be between 8 and 30 characters and contain at least one lowercase letter, one uppercase letter, one number and one special character';
  if (name !== passwordConfirmInput.value) return 'Passwords must be the same';
  return '';
};

const validatePasswordConfirm = (name) => {
  const passwordInput = document.getElementById('passwordInput');
  if (name !== passwordInput.value) return 'Passwords must be the same';
  return '';
};

export default SignUp;
