// react
import React, { useEffect, useRef, useState } from 'react';

// firebase
import {
  collection,
  limit,
  query,
  where,
  orderBy,
  startAfter,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './Home.css';

// components
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeHeader from '../../components/HomeHeader/HomeHeader';

// context providers
import {
  useTweetContext,
  useUserContext,
  useViewportContext,
} from '../../contextProvider/ContextProvider';
import {
  chunkArray,
  getInteractionsData,
  getUserData,
  updateTweets,
} from '../../utils/functions';
import ScrollableElementsLoader from '../../components/ScrollableElementsLoader/ScrollableElementsLoader';
import Tweet from '../../components/Tweet/Tweet';

const Home = () => {
  const tweetsContext = useTweetContext();

  const { viewportWidth } = useViewportContext();

  const { user } = useUserContext();

  // tweetsContext to determine if tweets are loading
  const [isLoading, setLoading] = useState(true);
  // state to keep query and attach flag
  const [loaderInfo, setLoaderInfo] = useState({
    queryRef: null,
    attach: false,
  });
  // ref to keep time for throttling scroll handler
  const time = useRef(Date.now());
  // ref to unsubscriber functions
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    // home event listeners
    const home = document.getElementById('home');

    // attach scroll handler to home
    const scrollHandlerFunc = () => {
      scrollHandler(tweetsContext.scroll, tweetsContext.setScroll, time);
    };
    home.addEventListener('scroll', scrollHandlerFunc);

    // remove event listeners
    return () => {
      home.removeEventListener('scroll', scrollHandlerFunc);
    };
  }, [tweetsContext.scroll, tweetsContext.isForYouSelected]);

  useEffect(() => {
    // scroll to where user left off in For You or Following tab accordingly
    const home = document.getElementById('home');

    if (!isLoading) {
      home.scrollTo({
        top: tweetsContext.scroll,
        behavior: 'auto',
      });
    }
  }, [isLoading, tweetsContext.isForYouSelected]);

  useEffect(() => {
    // initial tweets loading
    // create query to get tweets
    const tweetsCollectionRef = collection(firestore, 'tweets');
    let queryRef;

    // load For You or Following tweets accordingly
    if (tweetsContext.isForYouSelected) {
      queryRef = query(
        tweetsCollectionRef,
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('createdAt', 'desc'),
        limit(25)
      );
    } else if (user.following && user.following.length !== 0) {
      console.log('before risky query');
      // if user has yet to follow anyone, user.following would be empty, throwing an error
      // ! if user is following more than 30 people, this will throw an error as where ... in does not accept arrays with length > 30
      // ! will need to refactor code
      // ! also, no more than 30 DISJUNCTIONS allowed, since the second "where" filter has 2 items in the aray, the first one can have a maximum of 15
      queryRef = query(
        tweetsCollectionRef,
        where('userId', 'in', user.following),
        where('type', 'in', ['tweet', 'retweet']),
        orderBy('createdAt', 'desc'),
        limit(25)
      );
    } else {
      // if user has not followed anyone, make query which finds no documents
      queryRef = query(
        tweetsCollectionRef,
        where('thisFieldDoesNotExist', '==', 'gibberish189413yhurjbnf')
      );
    }

    // if there are tweets in context, need to attach listeners to them
    // else, need to load
    let attach = false;
    if (tweetsContext.tweets.length > 0) {
      attach = true;
    }
    setLoaderInfo({ queryRef, attach });

    return () => {
      // unsubscribe from tweets listeners
      // unsubsribersRef is an array, each element in it is an promise returned by tweetsLoader
      // each of these promises resolves to an array returned by attachListeners...
      // each element in this array is a function which unsubscribes from the tweets listener

      unsubscribersRef.current.forEach((unsubbersArray) => {
        unsubbersArray.forEach((unsubber) => {
          unsubber();
        });
      });
    };
  }, [tweetsContext.isForYouSelected]);
  // era switched tabs

  const pushUnsubscriber = (unsubscriber) => {
    unsubscribersRef.current.push(unsubscriber);
  };

  // function to handleIntersection
  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !tweetsContext.seenLastTweetRef.current) {
      // construct query to get next 25 tweets after intersection
      const tweetsCollectionRef = collection(firestore, 'tweets');

      let queryRef;
      // load For You or Following tweets accordingly
      if (tweetsContext.isForYouSelected) {
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          orderBy('createdAt', 'desc'),
          limit(25),
          startAfter(tweetsContext.lastVisibleTweetRef.current)
        );
      } else {
        queryRef = query(
          tweetsCollectionRef,
          where('userId', 'in', user.following),
          where('type', 'in', ['tweet', 'retweet']),
          orderBy('createdAt', 'desc'),
          limit(25),
          startAfter(tweetsContext.lastVisibleTweetRef.current)
        );
      }
      setLoaderInfo({ queryRef, attach: false });
    }
  };
  return (
    <div id="home">
      <HomeHeader
        homeLoading={isLoading}
        attachListenersToTweets={attachListenersToTweets}
      />
      <div className="padded">
        {loaderInfo.queryRef && (
          <ScrollableElementsLoader
            elementsLoader={loaderInfo}
            elements={tweetsContext.tweets}
            setElements={tweetsContext.setTweets}
            loadElements={tweetsLoader}
            attachListenersToElements={attachListenersToTweets}
            setLoadedSignal={setLoading}
            intersectionHandler={handleIntersection}
            ElementComponent={Tweet}
            setLastRetrievedElement={tweetsContext.setLastVisibleTweetRef}
            seenLastElement={tweetsContext.seenLastTweetRef}
            setSeenLastElement={tweetsContext.setSeenLastTweetRef}
            pushUnsubscriber={pushUnsubscriber}
          />
        )}
        {isLoading && 'homeLoading'}
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
export const tweetsLoader = async (
  queryRef,
  setHomeTweets,
  setLastVisibleTweetRef,
  setSeenLastTweet,
  setLoading
) => {
  // variable to store unsubsribe function
  let unsubscribe = [];

  // get id's of tweets, then attach listeners to them
  // this prevents tweet duplication, reordering, disappearance that would happen if querySnapshot was used directly with query
  // e.g. a query that gets the first 25 docs will return many changes if one or more of those docs is deleted or if docs are added to the beginning
  try {
    const querySnapshot = await getDocs(queryRef);

    // if querySnapshot has no docs, most likely last tweet was seen
    if (!querySnapshot.docs[0] && setSeenLastTweet) {
      setSeenLastTweet(true);
      return [];
    }

    const tweetIds = querySnapshot.docs.map((doc) => ({
      originalTweetId: doc.data().tweetId,
    }));
    unsubscribe = attachListenersToTweets(
      tweetIds,
      setHomeTweets,
      setLastVisibleTweetRef,
      setLoading
    );
  } catch (error) {
    console.error(error);
  }
  return unsubscribe;
};

export const attachListenersToTweets = async (
  tweets,
  setTweets,
  setLastVisibleTweetRef,
  setLoading
) => {
  // prepare query for tweets
  const tweetsCollectionRef = collection(firestore, 'tweets');

  // array to store unsubscriber functions
  const unsubscribers = [];

  // make array of tweet ids to attach listeners to
  const tweetIds = tweets.map((tweet) => tweet.originalTweetId);

  // chunk array into multiple arrays with max length of 30 (firestore limitation)
  // const chunks = chunkArray(tweetIds, 30);
  const chunks = chunkArray(tweetIds, 30);

  // subcribe to each chunk of tweets separately and add unsubsriber function to unsubsribers array
  const promises = chunks.map(async (chunk) => {
    // looking for specific tweet IDs, so no need for separate queries depending on "isForYouSelected"

    const queryRef = query(
      tweetsCollectionRef,
      where('tweetId', 'in', chunk),
      orderBy('createdAt', 'desc')
    );

    // create listener for tweets and set tweets
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(queryRef, async (querySnapshot) => {
        const logDocs = querySnapshot.docs.map((doc) => doc.data());
        console.log({ logDocs }, { chunk });
        try {
          // build fetchedTweets array from tweet documents plus information needed from tweeter user
          const [docsToModify, docsToDelete, docsToAdd] =
            await processTweetsQuerySnapshot(querySnapshot);

          // set tweets
          setTweets((prevTweets) =>
            updateTweets(prevTweets, docsToModify, docsToDelete, docsToAdd)
          );

          // set last visible tweet ref  in last chunk
          if (chunks.indexOf(chunk) === chunks.length - 1) {
            // Sort the docs based on createdAt (oldest to newest)
            const sortedDocs = querySnapshot.docs.sort((a, b) => {
              const aCreatedAt = a.data().repostTime || a.data().createdAt;
              const bCreatedAt = b.data().repostTime || b.data().createdAt;

              // Compare seconds first, then nanoseconds if seconds are equal
              if (aCreatedAt.seconds !== bCreatedAt.seconds) {
                return aCreatedAt.seconds - bCreatedAt.seconds;
              }
              return aCreatedAt.nanoseconds - bCreatedAt.nanoseconds;
            });

            if (querySnapshot.docs.length > 0) {
              // Select the first document (oldest)
              const lastTweet = sortedDocs[0];

              // eslint-disable-next-line no-param-reassign
              if (setLastVisibleTweetRef) {
                setLastVisibleTweetRef(lastTweet);
              }
            }
          }
          resolve();
        } catch (error) {
          // ! implement error handling
          console.error('error => ', { error });
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
  if (setLoading) {
    setLoading(false);
  }
  return unsubscribers;
};

const processTweetsQuerySnapshot = async (querySnapshot) => {
  // make array of docs to delete if any docs were removed from the querySnapshot
  const docsToDeleteIds = [];
  const docsToModifyIds = [];
  const docsToAddIds = [];
  querySnapshot.docChanges().forEach((change) => {
    switch (change.type) {
      case 'removed':
        docsToDeleteIds.push(change.doc.id);
        break;
      case 'added':
        docsToAddIds.push(change.doc.id);
        break;
      case 'modified':
        docsToModifyIds.push(change.doc.id);
        break;
      default:
        break;
    }
  });
  // create arrays for modified and added documents
  const docsToAdd = [];
  const docsToModify = [];
  await Promise.all(
    querySnapshot.docs.map(async (document) => {
      // ? try to find a more efficient way to retrieve data
      // ? right now, for each document you execute multiple read operations on the database
      // ? this would cost dollas if this app was real, dollas are expensive

      // ? also, this should be slower than if you could find a way to get batches of data
      // ? e.g. for tweetinteractions do batch queries (where, in, tweetIds)
      // ? no idea for user data right now though

      if (!docsToDeleteIds?.includes(document.id)) {
        // if doc has to be deleted, no point in getting data for it
        let tweetData = document.data();
        let reposterData = null;
        let tweetDocRef = document.id;
        let docRef = document.ref;
        let repostTime = null;
        const originalTweetId = tweetData.tweetId;

        if (tweetData.type === 'retweet') {
          // if retweet, get original tweet data and set reposterId, repostTime and tweetDocRef
          // ! this step creates multiple objects with the same tweetId in context, not in the database
          if (!tweetData.retweetId) {
            // error in tweet data so return empty object
            return {};
          }

          reposterData = await getUserData(tweetData.userId);
          repostTime = tweetData.createdAt;

          const tweetsCollection = collection(firestore, 'tweets');
          const tweetQuery = query(
            tweetsCollection,
            where('tweetId', '==', tweetData.retweetId)
          );
          const tweetSnapshot = await getDocs(tweetQuery);
          tweetData = tweetSnapshot.docs[0]?.data() || {};
          tweetDocRef = tweetSnapshot.docs[0].id;
          docRef = tweetSnapshot.docs[0].ref;
        }
        // get the user who posted the tweet's data
        const userDataRef = tweetData.userId;
        const userData = await getUserData(userDataRef);

        if (userData.uid) {
          // get interactions data
          const interactionsData = await getInteractionsData(
            tweetData.tweetId,
            docRef
          );

          // return complete object
          const processedTweetDocument = {
            key: document.id,
            docRef: tweetDocRef,
            ...tweetData,
            userName: userData.name,
            userProfilePicture: userData.profileImg,
            userTag: userData.tag,
            ...interactionsData,
            reposterData,
            repostTime,
            originalTweetId,
          };

          if (docsToAddIds.includes(document.id)) {
            docsToAdd.push(processedTweetDocument);
          }

          if (docsToModifyIds.includes(document.id)) {
            docsToModify.push(processedTweetDocument);
          }
        }
      }
      return {};
    })
  );
  return [docsToModify, docsToDeleteIds, docsToAdd];
};

export default Home;
