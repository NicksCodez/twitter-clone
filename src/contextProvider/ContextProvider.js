/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useContext, useRef, useState } from 'react';

// const AppContext = createContext();
const UserContext = createContext();
const TweetContext = createContext();
const ViewportContext = createContext();

const AppContextProvider = ({ children }) => {
  // Tweets context
  // In the homepage, 'For You' section, how much has the user scrolled and what tweets were loaded
  const [homeScroll, setHomeScroll] = useState(0);
  const [homeTweets, setHomeTweets] = useState([]);
  // In the homepage, 'Following' section, how much has the user scrolled and what tweets were loaded
  const [homeFollowingScroll, setHomeFollowingScroll] = useState(0);
  const [homeFollowingTweets, setHomeFollowingTweets] = useState([]);
  // keep track of selected tab in the homepage
  const [isForYouSelected, setIsForYouSelected] = useState(true);
  // Width of the viewport for conditional rendering (mobile/tablet/desktop)
  const [viewportWidth, setViewportWidth] = useState([]);
  // in the homepage, ref to whether the last tweet (meaning first ever tweet) in 'For You' tab has been seen
  const seenLastForYouTweetRef = useRef(false);
  // in the homepage, ref to whether the last tweet (meaning first ever tweet) in 'Following' tab has been seen
  const seenLastFollowingTweetRef = useRef(false);
  // in the homepage, ref to the last visible tweet in the 'For You' tab that user has scrolled down to
  const lastVisibleForYouTweetRef = useRef(null);
  // in the homepage, ref to the last visible tweet in the 'Following' tab that user has scrolled down to
  const lastVisibleFollowingTweetRef = useRef(null);

  // User Context
  const [user, setUser] = useState({});

  const userContextValue = {
    user,
    setUser,
  };

  const tweetContextValue = isForYouSelected
    ? {
        tweets: homeTweets,
        setTweets: setHomeTweets,
        scroll: homeScroll,
        setScroll: setHomeScroll,
        seenLastTweetRef: seenLastForYouTweetRef,
        setSeenLastTweetRef: (newValue) => {
          seenLastForYouTweetRef.current = newValue;
        },
        lastVisibleTweetRef: lastVisibleForYouTweetRef,
        setLastVisibleTweetRef: (newValue) => {
          lastVisibleForYouTweetRef.current = newValue;
        },
        isForYouSelected,
        setIsForYouSelected,
      }
    : {
        tweets: homeFollowingTweets,
        setTweets: setHomeFollowingTweets,
        scroll: homeFollowingScroll,
        setScroll: setHomeFollowingScroll,
        seenLastTweetRef: seenLastFollowingTweetRef,
        setSeenLastTweetRef: (newValue) => {
          seenLastFollowingTweetRef.current = newValue;
        },
        lastVisibleTweetRef: lastVisibleFollowingTweetRef,
        setLastVisibleTweetRef: (newValue) => {
          lastVisibleFollowingTweetRef.current = newValue;
        },
        isForYouSelected,
        setIsForYouSelected,
      };

  const viewportContextValue = {
    viewportWidth,
    setViewportWidth,
  };

  // const contextValue = useMemo(
  //   () => ({
  //     homeScroll,
  //     setHomeScroll,
  //     homeTweets,
  //     setHomeTweets,
  //     homeFollowingScroll,
  //     setHomeFollowingScroll,
  //     homeFollowingTweets,
  //     setHomeFollowingTweets,
  //     isForYouSelected,
  //     setIsForYouSelected,
  //     seenLastForYouTweetRef,
  //     seenLastFollowingTweetRef,
  //     lastVisibleForYouTweetRef,
  //     lastVisibleFollowingTweetRef,
  //     viewportWidth,
  //     setViewportWidth,
  //     user,
  //     setUser,
  //   }),
  //   [
  //     homeScroll,
  //     setHomeScroll,
  //     homeTweets,
  //     setHomeTweets,
  //     homeFollowingScroll,
  //     setHomeFollowingScroll,
  //     homeFollowingTweets,
  //     setHomeFollowingTweets,
  //     isForYouSelected,
  //     setIsForYouSelected,
  //     seenLastForYouTweetRef,
  //     seenLastFollowingTweetRef,
  //     lastVisibleForYouTweetRef,
  //     lastVisibleFollowingTweetRef,
  //     viewportWidth,
  //     setViewportWidth,
  //     user,
  //     setUser,
  //   ]
  // );

  return (
    // <AppContext.Provider
    //   value={
    //     //   {
    //     //   homeScroll,
    //     //   setHomeScroll,
    //     //   homeTweets,
    //     //   setHomeTweets,
    //     //   homeFollowingScroll,
    //     //   setHomeFollowingScroll,
    //     //   homeFollowingTweets,
    //     //   setHomeFollowingTweets,
    //     //   isForYouSelected,
    //     //   setIsForYouSelected,
    //     //   seenLastForYouTweetRef,
    //     //   seenLastFollowingTweetRef,
    //     //   lastVisibleForYouTweetRef,
    //     //   lastVisibleFollowingTweetRef,
    //     //   viewportWidth,
    //     //   setViewportWidth,
    //     //   user,
    //     //   setUser,
    //     // }
    //     contextValue
    //   }
    // >
    <UserContext.Provider value={userContextValue}>
      <TweetContext.Provider value={tweetContextValue}>
        <ViewportContext.Provider value={viewportContextValue}>
          {children}
        </ViewportContext.Provider>
      </TweetContext.Provider>
    </UserContext.Provider>

    // </AppContext.Provider>
  );
};

// const useAppContext = () => useContext(AppContext);
const useUserContext = () => useContext(UserContext);
const useTweetContext = () => useContext(TweetContext);
const useViewportContext = () => useContext(ViewportContext);

// export { AppContextProvider, useAppContext, AppContext };

export {
  AppContextProvider,
  useUserContext,
  useTweetContext,
  useViewportContext,
};
