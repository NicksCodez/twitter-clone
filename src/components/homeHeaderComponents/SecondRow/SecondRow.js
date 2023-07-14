import React from 'react';

const SecondRow = () => (
  <div className="second-row">
    <div className="active button-wrapper">
      <button type="button" onClick={clickHandler}>
        <div>
          <span>For you</span>
          <div className="blue-underscore u-round" />
        </div>
      </button>
    </div>
    <div className="button-wrapper">
      <button type="button" onClick={clickHandler}>
        <div>
          <span>Following</span>
          <div className="blue-underscore u-round" />
        </div>
      </button>
    </div>
  </div>
);

const clickHandler = (event) => {
  event.stopPropagation();
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
