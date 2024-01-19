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
import { auth, firestore } from '../../firebase';

// css
import './Home.css';

// components
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeHeader from '../../components/HomeHeader/HomeHeader';
import TweetContainer from '../../components/TweetContainer/TweetContainer';

// context providers
// import { useAppContext } from '../../contextProvider/ContextProvider';
import {
  useTweetContext,
  useUserContext,
  useViewportContext,
} from '../../contextProvider/ContextProvider';

const Home = () => {
  // const {
  //   homeScroll,
  //   setHomeScroll,
  //   viewportWidth,
  //   homeTweets,
  //   setHomeTweets,
  //   homeFollowingTweets,
  //   setHomeFollowingTweets,
  //   homeFollowingScroll,
  //   setHomeFollowingScroll,
  //   isForYouSelected,
  //   setIsForYouSelected,
  //   seenLastForYouTweetRef,
  //   seenLastFollowingTweetRef,
  //   lastVisibleForYouTweetRef,
  //   lastVisibleFollowingTweetRef,
  //   user,
  // } = useAppContext();

  const {
    homeScroll,
    setHomeScroll,
    homeTweets,
    setHomeTweets,
    homeFollowingTweets,
    setHomeFollowingTweets,
    homeFollowingScroll,
    setHomeFollowingScroll,
    isForYouSelected,
    setIsForYouSelected,
    seenLastForYouTweetRef,
    seenLastFollowingTweetRef,
    lastVisibleForYouTweetRef,
    lastVisibleFollowingTweetRef,
  } = useTweetContext();

  const { viewportWidth } = useViewportContext();

  const { user } = useUserContext();

  // state to determine if tweets are loading
  const [isLoading, setLoading] = useState(true);
  // states to determine if tabs were switched and cause initial loading of tweets for switched tab
  const [prevIsForYouSelected, setPrevIsForYouSelected] =
    useState(isForYouSelected);
  const [switchedTabs, setSwitchedTabs] = useState(false);
  // ref to keep time for throttling scroll handler
  const time = useRef(Date.now());
  // ref to unsubscriber functions
  const unsubscribersRef = useRef([]);
  // state to set variables used in functions to avoid using too many if else in code
  const [state, setState] = useState(
    isForYouSelected
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
        }
  );

  useEffect(() => {
    // determine if tab was switched
    if (isForYouSelected !== prevIsForYouSelected) {
      setPrevIsForYouSelected(isForYouSelected);
      setSwitchedTabs((prevState) => !prevState);
    }
    // update state every time a variable it depends on changes
    if (isForYouSelected) {
      setState({
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
      });
    } else {
      setState({
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
      });
    }
  }, [
    isForYouSelected,
    homeTweets,
    homeScroll,
    seenLastForYouTweetRef.current,
    lastVisibleForYouTweetRef.current,
    homeFollowingTweets,
    homeFollowingScroll,
    seenLastFollowingTweetRef.current,
    lastVisibleFollowingTweetRef.current,
  ]);

  useEffect(() => {
    // home event listeners
    const home = document.getElementById('home');

    // attach scroll handler to home
    const scrollHandlerFunc = () => {
      scrollHandler(state.scroll, state.setScroll, time);
    };
    home.addEventListener('scroll', scrollHandlerFunc);

    // remove event listeners
    return () => {
      home.removeEventListener('scroll', scrollHandlerFunc);
    };
  }, [state.scroll, isForYouSelected]);

  useEffect(() => {
    // scroll to where user left off in For You or Following tab accordingly
    const home = document.getElementById('home');

    if (!isLoading) {
      home.scrollTo({
        top: state.scroll,
        behavior: 'auto',
      });
    }
  }, [isLoading, isForYouSelected]);

  useEffect(() => {
    // initial tweets loading

    // create query to get tweets
    const tweetsCollectionRef = collection(firestore, 'tweets');
    let queryRef;

    // load For You or Following tweets accordingly
    if (isForYouSelected) {
      queryRef = query(
        tweetsCollectionRef,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('tweetId', 'desc'),
        limit(25)
      );
    } else if (user.following && user.following.length !== 0) {
      // if user has yet to follow anyone, user.following would be empty, throwing an error
      // ! if user is following more than 30 people, this will throw an error as where ... in does not accept arrays with length > 30
      // ! will need to refactor code
      // ! also, no more than 30 DISJUNCTIONS allowed, since the second "where" filter has 2 items in the aray, the first one can have a maximum of 15
      queryRef = query(
        tweetsCollectionRef,
        where('userId', 'in', user.following),
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('tweetId', 'desc'),
        limit(25)
      );
    } else {
      // if user has not followed anyone, make query which finds no documents
      queryRef = query(
        tweetsCollectionRef,
        where('thisFieldDoesNotExist', '==', 'gibberish189413yhurjbnf')
      );
    }

    if (state.tweets.length === 0) {
      // if no tweets, get initial tweets
      const unsubscribe = tweetsLoader(
        queryRef,
        state.setTweets,
        state.setLastVisibleTweetRef,
        state.setSeenLastTweetRef,
        setLoading
      );
      unsubscribersRef.current.push(unsubscribe);
    } else {
      // already have tweets, attach listener to be notified of changes to tweet documents
      const unsubscribers = attachListenersToTweets(
        state.tweets,
        state.setTweets,
        state.setLastVisibleTweetRef,
        setLoading
      );
      unsubscribers.then((result) => {
        // add unsubscriber functions to unsubsribers reference
        result.forEach((unsubscriber) => {
          unsubscribersRef.current.push(unsubscriber);
        });
      });
    }
    return () => {
      // cleanup when unmounting
      // unsubscribe from tweets listeners, if any
      unsubscribersRef.current.forEach((unsubscriber) => {
        if (unsubscriber && typeof unsubscriber.then === 'function') {
          // if unsubscribe is a promise that returns the function to unsubscribe from the listener
          unsubscriber.then((unsubFunc) => {
            if (typeof unsubFunc === 'function') {
              unsubFunc();
            }
          });
        } else if (unsubscriber && typeof unsubscriber === 'function') {
          // if unsubscribe is the function to unsubscribe from the listener
          unsubscriber();
        }
      });
    };
  }, [switchedTabs]);

  useEffect(() => {
    // load new tweets when last tweet is visible

    // function to handleIntersection
    const handleIntersection = async (entries) => {
      const [entry] = entries;
      // if already seen last tweet no need to run
      if (entry.isIntersecting && !state.seenLastTweetRef.current) {
        // construct query to get next 25 tweets after intersection
        const tweetsCollectionRef = collection(firestore, 'tweets');

        let queryRef;
        // load For You or Following tweets accordingly
        if (isForYouSelected) {
          queryRef = query(
            tweetsCollectionRef,
            where('type', 'in', ['tweet', 'retweet']),
            orderBy('tweetId', 'desc'),
            limit(25),
            startAfter(state.lastVisibleTweetRef.current)
          );
        } else {
          queryRef = query(
            tweetsCollectionRef,
            where('userId', 'in', user.following),
            where('type', 'in', ['tweet', 'retweet']),
            orderBy('tweetId', 'desc'),
            limit(25),
            startAfter(state.lastVisibleTweetRef.current)
          );
        }

        // load next 25 tweets and store unsubscriber in ref to use when unmounting component
        const unsubscribePromise = tweetsLoader(
          queryRef,
          state.setTweets,
          state.setLastVisibleTweetRef,
          state.setSeenLastTweetRef,
          setLoading
        );
        unsubscribersRef.current.push(unsubscribePromise);
      }
    };

    // create intersection observer
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });

    if (!isLoading && state.tweets.length > 20) {
      // attach observer to last tweet in DOM
      const lastTweetElement = document.getElementById(
        `tweet-${state.tweets[state.tweets.length - 1].tweetId}`
      );
      if (lastTweetElement) {
        observer.observe(lastTweetElement);
      }
    }

    return () => {
      // cleanup when unmounting or dependencies change
      // disconnect intersection observer
      observer.disconnect();
    };
  }, [state.tweets, state.seenLastTweetRef.current, isLoading]);

  return (
    <div id="home">
      <HomeHeader setIsForYouSelected={setIsForYouSelected} />
      <div className="padded">
        <TweetContainer tweets={state.tweets} isLoading={isLoading} />
      </div>
      {viewportWidth < 500 ? <FeatherButton /> : null}
      <Sidebar />
    </div>
  );
};

const scrollHandler = (lastScrollTop, setScrollTop, time) => {
  // apply class to second row of home header to create scroll animation
  // function is throttled so it doesn't run a lot of times on scroll

  if (time.current + 50 - Date.now() <= 0) {
    const home = document.getElementById('home');
    const homeHeader = document.getElementsByClassName('home-header');
    const st = home.scrollTop;
    if (st > lastScrollTop) {
      // scroll down, so remove 'scrolled' class to hide first row
      // ? final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
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
const tweetsLoader = async (
  queryRef,
  setHomeTweets,
  setLastVisibleTweetRef,
  setSeenLastTweet,
  setLoading
) => {
  // variable to store unsubsribe function
  let unsubscribe;
  try {
    unsubscribe = onSnapshot(queryRef, async (querySnapshot) => {
      // if querySnapshot has no docs, most likely last tweet was seen
      if (!querySnapshot.docs[0]) {
        setSeenLastTweet(true);
        return;
      }

      // build fetchedTweets array from tweet documents plus information needed from twitter user
      const fetchedTweets = await processTweetsQuerySnapshot(querySnapshot);

      // set last visible tweet
      if (querySnapshot.docs.length > 0) {
        const lastTweet = querySnapshot.docs[querySnapshot.docs.length - 1];
        // eslint-disable-next-line no-param-reassign
        setLastVisibleTweetRef(lastTweet);
      }

      // save tweets in state
      // Check if the tweet is already present in the state and avoid duplication done in updateTweets
      setHomeTweets((prevTweets) => {
        // set loading to false only after state update
        setLoading(false);
        return updateTweets(prevTweets, fetchedTweets);
      });
    });
  } catch (error) {
    // ! implement error handling
    console.error('Error fetching homeTweets:', error);
  }
  // returns unsubscriber promise
  return unsubscribe;
};

const attachListenersToTweets = async (
  tweets,
  setTweets,
  setLastVisibleTweetRef,
  setLoading
) => {
  // set loading to true in case it is not already set
  setLoading(true);

  // prepare query for tweets
  const tweetsCollectionRef = collection(firestore, 'tweets');

  // array to store unsubscriber functions
  const unsubscribers = [];

  // make array of tweet ids to attach listeners to
  const tweetIds = tweets.map((tweet) => tweet.tweetId);

  // chunk array into multiple arrays with max length of 30 (firestore limitation)
  const chunks = chunkArray(tweetIds, 30);

  // subcribe to each chunk of tweets separately and add unsubsriber function to unsubsribers array
  const promises = chunks.map(async (chunk) => {
    // looking for specific tweet IDs, so no need for separate queries depending on "isForYouSelected"
    const queryRef = query(
      tweetsCollectionRef,
      where('tweetId', 'in', chunk),
      orderBy('tweetId', 'desc')
    );

    // create listener for tweets and set tweets
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(queryRef, async (querySnapshot) => {
        try {
          if (querySnapshot.docs.length > 0) {
            // build fetchedTweets array from tweet documents plus information needed from tweeter user
            const fetchedTweets = await processTweetsQuerySnapshot(
              querySnapshot
            );

            // set tweets
            setTweets((prevTweets) => {
              // resolve promise
              resolve();
              return updateTweets(prevTweets, fetchedTweets);
            });

            // set last visible tweet ref  in last chunk
            if (chunks.indexOf(chunk) === chunks.length - 1) {
              const lastTweet =
                querySnapshot.docs[querySnapshot.docs.length - 1];
              setLastVisibleTweetRef(lastTweet);
            }
          }
        } catch (error) {
          // ! implement error handling
          console.log('error => ', { error });
          reject(error);
        }
      });
      // add unsubscribe function to unsubsribers
      unsubscribers.push(unsubscribe);
    });
  });

  // wait for all promises to be resolved to assure isLoading set to false only after all tweets loaded
  await Promise.all(promises);

  // set loading to false
  setLoading(false);

  return unsubscribers || null;
};

const updateTweets = (prevTweets, fetchedTweets) => {
  //! urmatoarele comentarii sunt scrise pentru cazul in care se apeleaza din functia attachListenersToTweets
  //! daca nu filtrez astfel incat fetchedtweets sa nu existe deja in prevtweets, apar duplicate
  //! duplicatele apar cand am mai mult de setul initial de 25 de tweeturi incarcate, dar nu toate tweeturile
  //! ex: sunt pe pagina home, dau scroll, incarc inca un set de tweeturi, merg la explore, dupa inapoi la home
  //! eroarea nu apare chiar mereu, dar apare destul de des
  //! eroarea apare sigur daca dupa ce m-am intors la home page se incarca automat inca un set de tweeturi datorita intersectiei, desi nu ar trebui caci nu am dat scroll pana la ultimul tweet
  // update duplicate tweets
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
};

const getUserData = async (userDataRef) => {
  // function to get a user's data according to tag
  const usersCollectionRef = collection(firestore, 'users');
  const usersQueryRef = query(
    usersCollectionRef,
    where('tag', '==', userDataRef)
  );
  const userDataSnapshot = await getDocs(usersQueryRef);

  return userDataSnapshot.docs[0]?.data() || {};
};

const processTweetsQuerySnapshot = async (querySnapshot) => {
  // create fetchedTweets array consisting of objects that have both tweet and user data
  const fetchedTweets = await Promise.all(
    querySnapshot.docs.map(async (document) => {
      // ? try to find a more efficient way to retrieve data
      // ? right now, for each document you execute multiple read operations on the database
      // ? this would cost dollas if this app was real, dollas are expensive

      // ? also, this should be slower than if you could find a way to get batches of data
      // ? e.g. for tweetinteractions do batch queries (where, in, tweetIds)
      // ? no idea for user data right now though

      const tweetData = document.data();

      // get the user who posted the tweet's data
      const userDataRef = tweetData.userId;
      const userData = await getUserData(userDataRef);

      // find out if tweet is liked/bookmarked
      const tweetInteractionsCollection = collection(
        firestore,
        'tweetInteractions'
      );
      const tweetInteractionsQuery = query(
        tweetInteractionsCollection,
        where('userId', '==', auth?.currentUser.uid),
        where('tweetId', '==', tweetData.tweetId),
        where('type', 'in', ['like', 'bookmark', 'retweet'])
      );

      const tweetInteractionsSnapshot = await getDocs(tweetInteractionsQuery);

      // console.log(tweetInteractionsSnapshot.docs);
      const interactionsData = {
        isLiked: false,
        isBookmarked: false,
        isRetweeted: false,
      };

      tweetInteractionsSnapshot.docs.forEach((doc) => {
        switch (doc.data().type) {
          case 'like':
            interactionsData.isLiked = true;
            break;
          case 'bookmark':
            interactionsData.isBookmarked = true;
            break;
          default:
            break;
        }
      });

      // find out if the tweet is retweeted
      const tweetsCollection = collection(firestore, 'tweets');
      const retweetQuery = query(
        tweetsCollection,
        where('type', '==', 'retweet'),
        where('userId', '==', auth.currentUser.uid),
        where('retweetId', '==', tweetData.tweetId)
      );
      const retweetSnapshot = await getDocs(retweetQuery);
      if (!retweetSnapshot.empty) {
        interactionsData.isRetweeted = true;
      }

      // return complete object
      return {
        ...tweetData,
        userName: userData.name,
        userProfilePicture: userData.profileImg,
        ...interactionsData,
      };
    })
  );

  return fetchedTweets;
};

const chunkArray = (array, chunkSize) => {
  // function to chunk array into multiple arrays of smaller size
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

export default Home;
