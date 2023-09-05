// react
import React, { useEffect, useRef, useState } from 'react';

// firebase
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './Home.css';

// components
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeHeader from '../../components/HomeHeader/HomeHeader';
import TweetContainer from '../../components/TweetContainer/TweetContainer';

// context providers
import { useAppContext } from '../../contextProvider/ContextProvider';

const Home = () => {
  const {
    homeScroll,
    setHomeScroll,
    viewportWidth,
    homeTweets,
    setHomeTweets,
  } = useAppContext();
  const [isLoading, setLoading] = useState(true);
  const time = useRef(Date.now());
  const lastVisibleTweetRef = useRef(null);

  useEffect(() => {
    // home event listeners
    const home = document.getElementById('home');
    const scrollHandlerFunc = () => {
      scrollHandler(homeScroll, setHomeScroll, time);
    };
    home.addEventListener('scroll', scrollHandlerFunc);

    // remove event listeners
    return () => {
      home.removeEventListener('scroll', scrollHandlerFunc);
    };
  }, [homeScroll]);

  useEffect(() => {
    const home = document.getElementById('home');
    home.scrollTo({
      top: homeScroll,
      behavior: 'auto',
    });
  }, [isLoading]);

  // initial tweets loading
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

  // load new tweets when last tweet is visible
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
    <div id="home">
      <HomeHeader />
      <div className="padded">
        <TweetContainer tweets={homeTweets} isLoading={isLoading} />
      </div>
      {viewportWidth < 500 ? <FeatherButton /> : null}
      <Sidebar />
    </div>
  );
};

const scrollHandler = (lastScrollTop, setScrollTop, time) => {
  // apply class to second row of home header to create scroll animation
  // throttle so it doesn't a lot of times on scroll

  if (time.current + 100 - Date.now() <= 0) {
    const home = document.getElementById('home');
    const homeHeader = document.getElementsByClassName('home-header');
    const st = home.scrollTop;
    if (st > lastScrollTop) {
      // scroll down, so remove 'scrolled' class to hide first row
      // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
      Array.from(homeHeader).forEach((element) => {
        element.classList.add('scrolled');
      });
    } else if (st < lastScrollTop) {
      // scroll up, so add 'scrolled' class to show first row
      Array.from(homeHeader).forEach((element) => {
        element.classList.remove('scrolled');
      });
    }

    // sometimes scroll can be negative on mobile, mitigate it
    // eslint-disable-next-line no-param-reassign
    setScrollTop(st <= 0 ? 0 : st);

    // reset time
    // eslint-disable-next-line no-param-reassign
    time.current = Date.now();
  }
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
    console.log({ querySnapshot });

    const fetchedTweets = await Promise.all(
      querySnapshot.docs.map(async (document) => {
        const tweetData = document.data();

        // get the user who posted the tweet's data
        const userDataRef = tweetData.userId;
        const usersCollectionRef = collection(firestore, 'users');
        const usersQueryRef = query(
          usersCollectionRef,
          where('tag', '==', userDataRef)
        );
        const userDataSnapshot = await getDocs(usersQueryRef);
        const userData = userDataSnapshot.docs[0].data();

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

export default Home;
