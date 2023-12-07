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
  onSnapshot,
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
  const timesLoadedRef = useRef(0);

  useEffect(() => {
    timesLoadedRef.current += 1;
  }, []);

  useEffect(() => {
    console.log(homeTweets);
  }, [homeTweets]);

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
      console.log('calling tweets loader bc hometweets length is 0');
      tweetsLoader(setHomeTweets, lastVisibleTweetRef);
    }

    // deleteDuplicateTweets();
    setLoading(false);
  }, []);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      console.log('calling tweets loader bc entries are intersecting');
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
  let unsubscribe;
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
    // test pt snapshot

    unsubscribe = await onSnapshot(queryRef, async (querySnapshotup) => {
      const source = querySnapshotup.docs[0].metadata.hasPendingWrites
        ? 'Local'
        : 'Server';
      console.log(source, ' data: ', querySnapshotup.docs[0].data());

      const fetchedTweets = await Promise.all(
        querySnapshotup.docs.map(async (document) => {
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
      if (querySnapshotup.docs.length > 0) {
        const lastTweet = querySnapshotup.docs[querySnapshotup.docs.length - 1];
        // eslint-disable-next-line no-param-reassign
        lastVisibleTweetRef.current = lastTweet;
      }

      // Check if the tweet is already present in the state and avoid duplication
      setHomeTweets((prevTweets) => {
        // if any fetched tweet has the same ID as any tweet already in homeTweets, update it
        const updatedTweets = prevTweets.map((prevTweet) => {
          const updatedTweet = fetchedTweets.find(
            (fetchedTweet) => fetchedTweet.tweetId === prevTweet.tweetId
          );
          return updatedTweet || prevTweet;
        });

        // append any tweet not already in homeTweets to updatedTweets
        fetchedTweets.forEach((fetchedTweet) => {
          if (
            !prevTweets.some(
              (prevTweet) => prevTweet.tweetId === fetchedTweet.tweetId
            )
          ) {
            updatedTweets.push(fetchedTweet);
          }
        });

        return updatedTweets;
      });
    });
  } catch (error) {
    console.error('Error fetching homeTweets:', error);
  }
  console.log('before returning unsubscribe');
  return unsubscribe;
};

export default Home;
