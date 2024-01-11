import React from 'react';

const SecondRow = ({ setIsForYouSelected }) => (
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

const clickHandler = (event, setIsForYouSelected) => {
  event.stopPropagation();
  console.log(
    event.target.textContent && event.target.textContent === 'For you'
  );
  if (event.target.textContent && event.target.textContent === 'For you') {
    console.log('SETTING IS FOR YOU TO TRUE');
    setIsForYouSelected(true);
  } else if (
    event.target.textContent &&
    event.target.textContent === 'Following'
  ) {
    console.log('SETTING IS FOR YOU TO FALSE');
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
