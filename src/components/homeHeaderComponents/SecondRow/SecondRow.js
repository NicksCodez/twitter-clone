import React from 'react';

// context providers
import { useTweetContext } from '../../../contextProvider/ContextProvider';

const SecondRow = () => {
  const { setIsForYouSelected } = useTweetContext();

  return (
    <div className="second-row">
      <div className="active button-wrapper">
        <button
          type="button"
          onClick={(event) => clickHandler(event, setIsForYouSelected)}
        >
          <div>
            <span>For you</span>
            <div className="blue-underscore u-round" />
          </div>
        </button>
      </div>
      <div className="button-wrapper">
        <button
          type="button"
          onClick={(event) => clickHandler(event, setIsForYouSelected)}
        >
          <div>
            <span>Following</span>
            <div className="blue-underscore u-round" />
          </div>
        </button>
      </div>
    </div>
  );
};

const clickHandler = (event, setIsForYouSelected) => {
  event.stopPropagation();

  if (event.target.textContent && event.target.textContent === 'For you') {
    setIsForYouSelected(true);
  } else if (
    event.target.textContent &&
    event.target.textContent === 'Following'
  ) {
    setIsForYouSelected(false);
  }
  const homeHeader = document.getElementsByClassName('home-header');
  // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
  Array.from(homeHeader).forEach((header) => {
    const activeTab = header.getElementsByClassName('active');
    Array.from(activeTab).forEach((element) => {
      element.classList.remove('active');
    });
  });
  event.target.parentElement.classList.add('active');
};

export default SecondRow;
