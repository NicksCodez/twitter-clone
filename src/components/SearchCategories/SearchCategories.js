import React from 'react';

// css
import './SearchCategories.css';

const SearchCategories = ({ isTweetsSelected, setIsTweetsSelected }) => (
  <div id="search-categories">
    <div className={`${isTweetsSelected ? 'active' : ''} button-wrapper`}>
      <button
        type="button"
        onClick={(event) => clickHandler(event, setIsTweetsSelected)}
      >
        <div>
          <span>Tweets</span>
          <div className="blue-underscore u-round" />
        </div>
      </button>
    </div>
    <div className={`${isTweetsSelected ? '' : 'active'} button-wrapper`}>
      <button
        type="button"
        onClick={(event) => clickHandler(event, setIsTweetsSelected)}
      >
        <div>
          <span>People</span>
          <div className="blue-underscore u-round" />
        </div>
      </button>
    </div>
  </div>
);

const clickHandler = (event, setIsTweetsSelected) => {
  event.stopPropagation();

  if (event.target.textContent && event.target.textContent === 'Tweets') {
    setIsTweetsSelected(true);
  } else if (
    event.target.textContent &&
    event.target.textContent === 'People'
  ) {
    setIsTweetsSelected(false);
  }
  const homeHeader = document.getElementById('search-categories');
  // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop

  const activeTab = homeHeader.getElementsByClassName('active');
  Array.from(activeTab).forEach((element) => {
    element.classList.remove('active');
  });
  event.target.parentElement.classList.add('active');
};

export default SearchCategories;
