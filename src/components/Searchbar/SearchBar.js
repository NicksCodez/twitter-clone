import React, { useEffect, useRef, useState } from 'react';
import { Form, Link, useNavigate } from 'react-router-dom';

// firebase
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

// css
import './Searchbar.css';

// utils
import { v4 as uuidv4 } from 'uuid';
import svgs from '../../utils/svgs';
import { firestore } from '../../firebase';

// components
import UserCard from '../UserCard/UserCard';

// context
import { useViewportContext } from '../../contextProvider/ContextProvider';

const Searchbar = ({ searchQuery }) => {
  // viewport Width
  const viewportWidth = useViewportContext();

  // state to store search input
  const [searchInput, setSearchInput] = useState('');

  // state to store search results
  const [foundUsers, setFoundUsers] = useState([]);

  // ref to search input
  const searchRef = useRef(null);

  // navigator
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery && searchRef) {
      setSearchInput(searchQuery);
      searchRef.current.value = searchQuery;
    }
  }, []);

  useEffect(() => {
    // get users according to search input
    const usersCollectionRef = collection(firestore, 'users');
    const queryRef = query(
      usersCollectionRef,
      where('tagLowerCase', '>=', searchInput),
      where('tagLowerCase', '<=', `${searchInput}\uf8ff`),
      limit(10),
      orderBy('tagLowerCase')
    );
    const usersQuerySnapshot = getDocs(queryRef);
    usersQuerySnapshot.then((r) => {
      const userDocs = r.docs.map((doc) => ({
        ...doc.data(),
        profileDocId: doc.ref,
        hideFollow: true,
      }));
      setFoundUsers(userDocs);
    });
  }, [searchInput]);

  return (
    <div id="searchbar">
      <Form onSubmit={(event) => submitForm(event, searchInput, navigate)}>
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
            onFocus={() => focusHandler(viewportWidth)}
            onBlur={focusOutHandler}
            onInput={() => changeHandlerInput(setSearchInput)}
            ref={searchRef}
          />
          <div className="btn-close-wrapper " id="searchbar-clear">
            <button
              type="button"
              className="u-round"
              onClick={() => clickHandlerClear(setSearchInput)}
            >
              <svg viewBox="0 0 15 15" className="svg-close">
                <path d={svgs.xSearch} />
              </svg>
            </button>
          </div>
        </label>
      </Form>
      <div id="search-results">
        {searchInput === '' ? (
          <span id="no-search">
            Try searching for people, topics, or keywords
          </span>
        ) : (
          <div className="results-found">
            <span className="">
              <Link to={`/search?q=${searchInput}`}>
                Search for {searchInput}
              </Link>
            </span>
            {foundUsers.map((foundUser) => (
              <UserCard element={foundUser} key={uuidv4()} />
            ))}
            <span className="searchbar-go-to-profile">
              Go to <Link to={`/${searchInput}`}>&nbsp;@{searchInput}</Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const focusHandler = (viewportWidth) => {
  // stop explore page scroll
  const explore = document.getElementById('explore');
  explore.classList.add('no-scroll');

  const account = document.getElementById('explore-header-profile-picture');
  const back = document.getElementById('explore-header-back');

  // replace account picture with back button
  if (account) {
    account.style.display = 'none';
  }
  back.style.display = 'flex';

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
  if (viewportWidth < 500) {
    const featherButton = document.getElementById('feather-button');
    if (featherButton) {
      featherButton.style.display = 'none';
    }
  }
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

const submitForm = (event, formData, navigate) => {
  event.preventDefault();
  // enable explore page scroll
  const explore = document.getElementById('explore');
  explore.classList.remove('no-scroll');
  if (formData !== '') {
    navigate(`/search?q=${formData}`);
  }
};

export default Searchbar;
