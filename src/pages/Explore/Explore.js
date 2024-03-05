// react
import React, { useEffect, useState } from 'react';

// css
import './Explore.css';

// components
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import People from '../../components/People/People';
import Searchbar from '../../components/Searchbar/SearchBar';
import PageHeader from '../../components/PageHeader/PageHeader';
import TrendingItem from '../../components/TrendingItem/TrendingItem';

// context provider
// import { useAppContext } from '../../contextProvider/ContextProvider';
import { useViewportContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';
import { clickHandlerAccount, loadTrending } from '../../utils/functions';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

const Explore = () => {
  // const { viewportWidth } = useAppContext();
  const { viewportWidth } = useViewportContext();

  // store trends
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    // search input events
    const search = document.getElementById('search');

    search.addEventListener('click', clickHandlerSearch);

    // back button events
    const back = document.getElementById('explore-header-back');
    back.addEventListener('click', clickHandlerBack);

    // load trends
    loadTrending(setTrends, setTrendsLoading, 5);

    return () => {
      search.removeEventListener('click', clickHandlerSearch);
      back.removeEventListener('click', clickHandlerBack);
    };
  }, []);

  // build left elements for page header
  const backButtonElement = (
    <div id="explore-header-back">
      <button type="button">
        <svg viewBox="0 0 24 24">
          <path d={svgs.back} />
        </svg>
      </button>
    </div>
  );

  const profilePictureElement = (
    <div id="explore-header-profile-picture">
      <button type="button" onClick={clickHandlerAccount}>
        <img src={DefaultProfile} alt="profile" className="u-round" />
      </button>
    </div>
  );

  // build right elements for page header
  const rightElement = (
    <div id="explore-header-settings">
      <Link to="/settings/explore">
        <svg viewBox="0 0 24 24">
          <path d={svgs.settings} />
        </svg>
      </Link>
    </div>
  );

  // build middle element for page header
  const middleElement = (
    <div className="middle-element">
      <Searchbar />
    </div>
  );

  return (
    <div id="explore">
      <div id="explore-header">
        <PageHeader
          leftElements={[backButtonElement, profilePictureElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      <Sidebar />
      {viewportWidth < 500 ? <FeatherButton /> : null}
      {trendsLoading ? (
        <div>Loading</div>
      ) : (
        <div className="trends">
          <h2>Trends for you</h2>
          {trends.length > 0 ? (
            trends.map((trend) => (
              <TrendingItem
                key={trend.id}
                trend={trend.id}
                tweetsNumber={trend.totalTweets}
              />
            ))
          ) : (
            <div>There seem to be no trends yet</div>
          )}
          <Link to="/i/trends" className="show-more">
            <span>Show more</span>
          </Link>
        </div>
      )}
      <div className="separator-wrapper">
        <div className="separator" />
      </div>
      <People />
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

export default Explore;
