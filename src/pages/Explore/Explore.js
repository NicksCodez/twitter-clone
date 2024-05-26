// react
import React, { useEffect, useState } from 'react';

// css
import './Explore.css';

// components
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import People from '../../components/People/People';
import Searchbar from '../../components/Searchbar/SearchBar';
import PageHeader from '../../components/PageHeader/PageHeader';
import TrendingItem from '../../components/TrendingItem/TrendingItem';

// context provider
// import { useAppContext } from '../../contextProvider/ContextProvider';
import {
  useUserContext,
  useViewportContext,
} from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';
import { clickHandlerAccount, loadTrending } from '../../utils/functions';

// images
import DefaultProfile from '../../assets/images/default_profile.png';
import SearchResults from '../../components/SearchResults/SearchResults';

const Explore = () => {
  // const { viewportWidth } = useAppContext();
  const { viewportWidth } = useViewportContext();
  const { user } = useUserContext();

  const navigate = useNavigate();
  // check if any query
  const query = new URLSearchParams(useLocation().search);
  const searchQuery = query.get('q');

  // store trends
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    // load trends
    loadTrending(setTrends, setTrendsLoading, 5);
  }, []);

  // build left elements for page header
  const backButtonElement = (
    <div
      id="explore-header-back"
      style={{ display: searchQuery ? 'flex' : 'none' }}
    >
      <button
        type="button"
        onClick={() => clickHandlerBack(searchQuery, navigate)}
      >
        <svg viewBox="0 0 24 24">
          <path d={svgs.back} />
        </svg>
      </button>
    </div>
  );

  const profilePictureElement =
    viewportWidth <= 500 ? (
      <div
        id="explore-header-profile-picture"
        style={{ display: searchQuery ? 'none' : 'flex' }}
      >
        <button type="button" onClick={clickHandlerAccount}>
          <img
            src={user?.profileImg || DefaultProfile}
            alt="profile"
            className="u-round"
          />
        </button>
      </div>
    ) : null;

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
      <Searchbar searchQuery={searchQuery} />
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
      {!searchQuery && (
        <div>
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
          <div className="explore-separator-wrapper">
            <div className="explore-separator" />
          </div>
          <People />
        </div>
      )}
      {searchQuery && <SearchResults searchQuery={searchQuery} />}
    </div>
  );
};

const clickHandlerBack = (searchQuery, navigate) => {
  const searchResultsDiv = document.getElementById('search-results');
  const searchResultsActive = searchResultsDiv.classList.contains('active');
  // if I have a search query, navigate to previous page
  if (searchQuery) {
    if (!searchResultsActive) {
      // search results are not active, so navigate back
      navigate(-1);
    } else {
      // search results are active, so hide them and associated styles
      searchResultsDiv.classList.remove('active');
      const clearButton = document.getElementById('searchbar-clear');
      clearButton.classList.remove('active');

      // enable explore page scroll
      const explore = document.getElementById('explore');
      explore.classList.remove('no-scroll');
      return;
    }
  }

  // no search query, change styles
  const account = document.getElementById('explore-header-profile-picture');
  const back = document.getElementById('explore-header-back');

  // replace back button with account picture
  if (account) {
    account.style.display = 'flex';
  }
  back.style.display = 'none';

  // make clear button invisible
  const clearButton = document.getElementById('searchbar-clear');
  clearButton.classList.remove('active');

  // hide search results div
  searchResultsDiv.classList.remove('active');

  // show feather icon
  const featherButton = document.getElementById('feather-button');
  if (featherButton) {
    featherButton.style.display = 'flex';
  }
};

export default Explore;
