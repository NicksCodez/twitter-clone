import React, { useEffect, useRef, useState } from 'react';

// css
import './Bookmarks.css';
import { useNavigate } from 'react-router-dom';

// context providers
import { useUserContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';
import PageHeader from '../../components/PageHeader/PageHeader';
import { getLikesBookmarks } from '../../components/profileComponents/ProfileContent/ProfileContent';
import { auth } from '../../firebase';
import Tweet from '../../components/Tweet/Tweet';
import ScrollableElementsLoader from '../../components/ScrollableElementsLoader/ScrollableElementsLoader';

const Bookmarks = () => {
  // state to store tweets
  const [tweets, setTweets] = useState([]);

  // state to keep track of scrollable state
  const [isScrollableLoading, setIsScrollableLoading] = useState(true);

  // refs for scroll functionality
  const seenLastTweetRef = useRef(false);
  const lastRetrievedTweetRef = useRef(false);

  // unsubscriber functions ref
  const unsubscribersRef = useRef([]);

  // user context
  const { user } = useUserContext();

  // navigator function
  const navigate = useNavigate();

  // header components
  const leftHeaderComp = (
    <button
      type="button"
      className="minW"
      onClick={() => {
        navigate(-1);
      }}
    >
      <svg viewBox="0 0 24 24">
        <path d={svgs.back} />
      </svg>
    </button>
  );

  const middleHeaderComp = (
    <div className="wrapper-col">
      <span>Bookmarks</span>
      <span>@{user.tag}</span>
    </div>
  );

  const rightHeaderComp = <div className="minW" />;

  // useEffects

  useEffect(() => {
    if (auth.currentUser?.uid) {
      // on component load, get tweets
      getTweets();
    }

    return () => {
      // on unmount, unsubscribe from listeners
      // unsubsribersRef is an array, each element in it is an promise returned by tweetsLoader
      // each of these promises resolves to an array returned by attachListeners...
      // each element in this array is a function which unsubscribes from the tweets listener

      unsubscribersRef.current.forEach((unsubbersArray) => {
        unsubbersArray.forEach((unsubber) => {
          unsubber();
        });
      });
    };
  }, [auth.currentUser]);

  // functions

  // function to add unsubscriber to unsubsribersRef
  const pushUnsubscriber = (unsubscriber) => {
    unsubscribersRef.current.push(unsubscriber);
  };

  // function to get tweets
  const getTweets = () => {
    getLikesBookmarks(
      'bookmark',
      lastRetrievedTweetRef,
      seenLastTweetRef,
      setTweets,
      auth.currentUser.uid
    ).then((resolved) => {
      pushUnsubscriber(resolved);
    });
  };

  // function to handle scroll intersection
  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !seenLastTweetRef.current) {
      getTweets();
    }
  };

  return (
    <div id="bookmarks">
      <div id="bookmarks-header">
        <PageHeader
          leftElements={[leftHeaderComp]}
          middleElements={[middleHeaderComp]}
          rightElements={[rightHeaderComp]}
        />
      </div>
      <div className="padded-container">
        <ScrollableElementsLoader
          elementsLoader={{}}
          elements={tweets}
          setElements={setTweets}
          loadElements={() => null}
          attachListenersToElements={() => {}}
          setLoadedSignal={setIsScrollableLoading}
          ElementComponent={Tweet}
          pushUnsubscriber={pushUnsubscriber}
          setLastRetrievedElement={(tweet) => {
            lastRetrievedTweetRef.current = tweet;
          }}
          seenLastElement={seenLastTweetRef}
          setSeenLastElement={(val) => {
            seenLastTweetRef.current = val;
          }}
          intersectionHandler={handleIntersection}
          noQuery
        />
      </div>
    </div>
  );
};

export default Bookmarks;
