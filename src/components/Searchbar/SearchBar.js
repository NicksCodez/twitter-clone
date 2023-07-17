import React, { useEffect, useState } from 'react';
import { Form } from 'react-router-dom';

// css
import './Searchbar.css';

// utils
import svgs from '../../utils/svgs';

const Searchbar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log({ searchQuery });
  }, [searchQuery]);

  return (
    <div id="searchbar">
      <Form>
        <label htmlFor="search">
          <div className="svg-search-wrapper">
            <svg
              viewBox="0 0 24 24"
              className="svg-search"
              id="searchbar-svg-search"
            >
              <path d={svgs.search} />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Twitter"
            id="search"
            onFocus={focusHandler}
            onBlur={focusOutHandler}
            onInput={() => changeHandlerInput(setSearchQuery)}
          />
          <div className="btn-close-wrapper " id="searchbar-clear">
            <button
              type="button"
              className="u-round"
              onClick={() => clickHandlerClear(setSearchQuery)}
            >
              <svg viewBox="0 0 15 15" className="svg-close">
                <path d={svgs.xSearch} />
              </svg>
            </button>
          </div>
        </label>
      </Form>
      <div id="search-results">
        {searchQuery === '' ? (
          <span id="no-search">
            Try searching for people, topics, or keywords
          </span>
        ) : (
          <span>{`You searched for ${searchQuery}`}</span>
        )}
      </div>
    </div>
  );
};

const focusHandler = () => {
  const searchbar = document.getElementById('searchbar');
  const search = document.getElementById('searchbar-svg-search');

  // aply focused style
  search.style.color = 'var(--clr-bg-blue)';
  searchbar.style.borderColor = 'var(--clr-bg-blue)';

  // show clear button if text is leftover from another search
  const text = search.value;
  const clear = document.getElementById('searchbar-clear');
  if (text !== '') {
    clear.classList.add('active');
  }

  // show search results div
  const searchResultsDiv = document.getElementById('search-results');
  searchResultsDiv.classList.add('active');

  // hide feather icon
  const featherButton = document.getElementById('feather-button');
  featherButton.style.display = 'none';
};

const focusOutHandler = () => {
  const searchbar = document.getElementById('searchbar');
  const search = document.getElementById('searchbar-svg-search');

  search.style.color = 'var(--clr-font-secondary)';
  searchbar.style.borderColor = 'var(--clr-bg-search)';
};

const clickHandlerClear = (setSearchQuery) => {
  const search = document.getElementById('search');
  // preserve search focused state
  search.focus();
  search.value = '';
  setSearchQuery('');
  // make button invisible because change event handler doesn't catch this
  const clearButton = document.getElementById('searchbar-clear');
  clearButton.classList.remove('active');
};

const changeHandlerInput = (setSearchQuery) => {
  // get input value
  const search = document.getElementById('search');
  const text = search.value;
  // add or remove x button accordingly
  const clear = document.getElementById('searchbar-clear');
  if (text !== '') {
    clear.classList.add('active');
  } else {
    clear.classList.remove('active');
  }
  // save input value in state
  setSearchQuery(text);
};

export default Searchbar;
