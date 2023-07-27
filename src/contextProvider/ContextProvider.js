/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // In the homepage, 'For You' section, how much has the user scrolled and what tweets were loaded
  const [homeScroll, setHomeScroll] = useState(0);
  const [homeTweets, setHomeTweets] = useState([]);
  // In the homepage, 'Following' section, how much has the user scrolled and what tweets were loaded
  const [homeFollowingScroll, setHomeFollowingScroll] = useState(0);
  const [homeFollowingTweets, setHomeFollowingTweets] = useState([]);
  // Width of the viewport for conditional rendering (mobile/tablet/desktop)
  const [viewportWidth, setViewportWidth] = useState([]);

  return (
    <AppContext.Provider
      value={{
        homeScroll,
        setHomeScroll,
        homeTweets,
        setHomeTweets,
        viewportWidth,
        setViewportWidth,
        homeFollowingScroll,
        setHomeFollowingScroll,
        homeFollowingTweets,
        setHomeFollowingTweets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

export { AppContextProvider, useAppContext, AppContext };
