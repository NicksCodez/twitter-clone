import React, { useEffect, useRef } from 'react';

// firestore
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './HomeNewTweetsButton.css';

// context providers
import {
  useTweetContext,
  useUserContext,
} from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';

const HomeNewTweetsButton = ({ attachListenersToTweets }) => {
  const { tweets, setTweets, newTweets, setNewTweets, isForYouSelected } =
    useTweetContext();
  const { user } = useUserContext();
  const latestTweetUnsubscribersRef = useRef([]);
  const addedtweetsUnsubsribersRef = useRef([]);

  useEffect(() => {
    const tweetsCollection = collection(firestore, 'tweets');
    let queryRef;
    if (isForYouSelected) {
      queryRef = query(
        tweetsCollection,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    } else {
      queryRef = query(
        tweetsCollection,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('createdAt', 'desc'),
        where(
          'userId',
          'in',
          user.following.length > 0 ? user.following : [-1111]
        ),
        limit(1)
      );
    }
    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        switch (change.type) {
          case 'added':
            if (
              !tweets.some((tweet) => tweet.originalTweetId === data.tweetId) &&
              !newTweets.some((tweet) => tweet.originalTweetId === data.tweetId)
            ) {
              setNewTweets((prevNewTweets) => {
                if (
                  !prevNewTweets.some(
                    (tweet) => tweet.originalTweetId === data.tweetId
                  )
                ) {
                  return [
                    ...prevNewTweets,
                    {
                      originalTweetId: data.tweetId,
                      key: '-1',
                    },
                  ];
                }
                return prevNewTweets;
              });
            }
            break;
          default:
            break;
        }
      });
    });
    latestTweetUnsubscribersRef.current.push(unsubscribe);
    return () => {
      latestTweetUnsubscribersRef.current.forEach((unsubscriber) => {
        unsubscriber();
      });
      latestTweetUnsubscribersRef.current = [];
    };
  }, [tweets, isForYouSelected]);

  useEffect(
    () => () => {
      addedtweetsUnsubsribersRef.current.forEach((unsubscriber) => {
        unsubscriber();
      });
    },
    [isForYouSelected]
  );

  const clickHandler = () => {
    const unsubscribers = attachListenersToTweets(newTweets, setTweets);
    unsubscribers.then((resolved) => {
      // add unsubscribers
      addedtweetsUnsubsribersRef.current =
        addedtweetsUnsubsribersRef.current.concat(resolved);
      // clear new tweets
      setNewTweets([]);

      const home = document.getElementById('home');
      // scroll to top
      home.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    });
  };

  return (
    <div id="new-tweets-button">
      {newTweets.length > 0 && (
        <button type="button" onClick={() => clickHandler()}>
          <span>
            <svg viewBox="0 0 24 24">
              <path d={svgs.arrowUp} />
            </svg>
          </span>
          <span>New Tweets</span>
        </button>
      )}
    </div>
  );
};

export default HomeNewTweetsButton;
