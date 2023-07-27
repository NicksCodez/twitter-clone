import React, { useEffect, useRef } from 'react';

// firebase
import {
  collection,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  doc,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './TweetContainer.css';

// components
import Tweet from '../Tweet/Tweet';
import { useAppContext } from '../../contextProvider/ContextProvider';

const TweetContainer = ({ setLoading = () => true }) => {
  const { homeTweets, setHomeTweets } = useAppContext();
  const lastVisibleTweetRef = useRef(null);
  // const reloadRef = useRef(0);

  useEffect(() => {
    // if (reloadRef.current === 0) {
    //   reloadRef.current += 1;
    // }
    // if (reloadRef.current === 1) {
    //   deleteDuplicateTweets();
    // }
    // populateFirestoreWithTweets(200);
    if (homeTweets.length === 0) {
      tweetsLoader(setHomeTweets, lastVisibleTweetRef);
    }
    // deleteDuplicateTweets();
    setLoading(false);
  }, []);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      tweetsLoader(setHomeTweets, lastVisibleTweetRef);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });

    if (homeTweets.length > 20) {
      const lastTweetElement = document.getElementById(
        `tweet-${homeTweets[homeTweets.length - 1].tweetId}`
      );
      if (lastTweetElement) {
        observer.observe(lastTweetElement);
      }
    }

    return () => observer.disconnect();
  }, [homeTweets]);

  return (
    <div className="tweet-container">
      {homeTweets.map((tweet) => (
        <Tweet
          key={tweet.tweetId}
          img={tweet.userProfilePicture}
          name={tweet.userName}
          tag={tweet.userId}
          createdAt={formatTimeAgo(tweet.createdAt)}
          text={tweet.text}
          replies={tweet.repliesCount}
          likes={tweet.likesCount}
          retweets={tweet.retweetsCount}
          bookmarks={tweet.bookmarksCount}
          idProp={`tweet-${tweet.tweetId}`}
        />
      ))}
    </div>
  );
};

// Function to format timestamp
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - timestamp.toDate()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
  const options = { month: 'short', day: 'numeric' };
  return timestamp.toDate().toLocaleDateString('en-US', options);
};

// Function to load tweets
const tweetsLoader = async (setHomeTweets, lastVisibleTweetRef) => {
  const tweetsCollectionRef = collection(firestore, 'tweets');

  try {
    let queryRef;
    if (lastVisibleTweetRef.current) {
      queryRef = query(
        tweetsCollectionRef,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('tweetId', 'desc'),
        limit(25),
        startAfter(lastVisibleTweetRef.current)
      );
    } else {
      queryRef = query(
        tweetsCollectionRef,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('tweetId', 'desc'),
        limit(25)
      );
    }
    const querySnapshot = await getDocs(queryRef);

    const fetchedTweets = await Promise.all(
      querySnapshot.docs.map(async (document) => {
        const tweetData = document.data();

        // Get the document reference to the user using the tweet's userId
        const userDataRef = tweetData.userId;
        const userRef = doc(firestore, 'users', userDataRef);
        const userDataSnapshot = await getDoc(userRef);
        const userData = userDataSnapshot.data();

        return {
          tweetId: document.id,
          ...tweetData,
          userName: userData.name,
          userProfilePicture: userData.profileImg,
        };
      })
    );
    if (querySnapshot.docs.length > 0) {
      const lastTweet = querySnapshot.docs[querySnapshot.docs.length - 1];
      // eslint-disable-next-line no-param-reassign
      lastVisibleTweetRef.current = lastTweet;
    }

    // Check if the tweet is already present in the state and avoid duplication
    setHomeTweets((prevTweets) => {
      const tweetIds = new Set(prevTweets.map((tweet) => tweet.tweetId));
      const newTweets = fetchedTweets.filter(
        (tweet) => !tweetIds.has(tweet.tweetId)
      );
      return [...prevTweets, ...newTweets];
    });
    // setHomeTweets(fetchedTweets);
  } catch (error) {
    console.error('Error fetching homeTweets:', error);
  }
};

export default TweetContainer;
