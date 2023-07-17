import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// css
import './ExploreHeader.css';

// components
import Searchbar from '../Searchbar/SearchBar';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

// utils
import svgs from '../../utils/svgs';
import { clickHandlerAccount } from '../../utils/functions';

const ExploreHeader = () => {
  useEffect(() => {
    // search input events
    const search = document.getElementById('search');

    search.addEventListener('click', clickHandlerSearch);

    // back button events
    const back = document.getElementById('explore-header-back');
    back.addEventListener('click', clickHandlerBack);

    return () => {
      search.removeEventListener('click', clickHandlerSearch);
      back.removeEventListener('click', clickHandlerBack);
    };
  }, []);

  return (
    <div id="explore-header">
      <div id="explore-header-back">
        <button type="button">
          <svg viewBox="0 0 24 24">
            <path d={svgs.back} />
          </svg>
        </button>
      </div>
      <div id="explore-header-profile-picture">
        <button type="button" onClick={clickHandlerAccount}>
          <img src={DefaultProfile} alt="profile" className="u-round" />
        </button>
      </div>
      <div className="middle-element">
        <Searchbar />
      </div>
      <div id="explore-header-settings">
        <Link to="/settings/explore">
          <svg viewBox="0 0 24 24">
            <path d={svgs.settings} />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const clickHandlerSearch = () => {
  const account = document.getElementById('explore-header-profile-picture');
  const back = document.getElementById('explore-header-back');

  // replace account picture with back bsutton
  account.style.display = 'none';
  back.style.display = 'flex';
};

const clickHandlerBack = () => {
  const account = document.getElementById('explore-header-profile-picture');
  const back = document.getElementById('explore-header-back');

  // replace account picture with back button
  account.style.display = 'flex';
  back.style.display = 'none';

  // make clear button invisible
  const clearButton = document.getElementById('searchbar-clear');
  clearButton.classList.remove('active');

  // hide search results div
  const searchResultsDiv = document.getElementById('search-results');
  searchResultsDiv.classList.remove('active');

  // show feather icon
  const featherButton = document.getElementById('feather-button');
  featherButton.style.display = 'flex';
};

export default ExploreHeader;
