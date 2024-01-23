import React, { useEffect, useRef, useState } from 'react';

// firebase
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './TweetContainer.css';

// components
import Tweet from '../Tweet/Tweet';

// utils
import {
  chunkArray,
  formatTimeAgo,
  getInteractionsData,
  getUserData,
  updateTweets,
} from '../../utils/functions';

const TweetContainer = ({
  loaderInfo,
  tweets,
  setTweets,
  setParentLoading,
  setLastVisibleTweetRef,
  setSeenLastTweetRef,
}) => {
  // flag to know wether to show page or not
  const [isLoading, setIsLoading] = useState(false);

  // ref to unsubscriber functions
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    setParentLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    // initial tweets loading

    if (!loaderInfo.attach) {
      // if no attach flag, load tweets
      const unsubscribe = tweetsLoader(
        loaderInfo.queryRef,
        setTweets,
        setLastVisibleTweetRef,
        setSeenLastTweetRef,
        setIsLoading
      );
      unsubscribersRef.current.push(unsubscribe);
    } else {
      // attach flag set, so attach listeners to tweets
      const unsubscribers = attachListenersToTweets(
        tweets,
        setTweets,
        setLastVisibleTweetRef,
        setIsLoading
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
  }, [loaderInfo.queryRef]);

  return (
    <div className="tweet-container">
      {isLoading ? (
        <div> loading </div>
      ) : (
        <div>
          {tweets &&
            tweets
              .filter((tweet) => tweet.tweetId)
              .map((tweet) => (
                <Tweet
                  key={tweet.key}
                  docRef={tweet.docRef}
                  reposterData={tweet.reposterData}
                  profileImg={tweet.userProfilePicture}
                  name={tweet.userName}
                  tag={tweet.userTag}
                  // createdAt={formatTimeAgo(tweet.createdAt)}
                  createdAt={tweet.createdAt}
                  text={tweet.text}
                  replies={tweet.repliesCount}
                  likes={tweet.likesCount}
                  retweets={tweet.retweetsCount}
                  bookmarks={tweet.bookmarksCount}
                  idProp={tweet.tweetId}
                  tweetImg={tweet.imageLink}
                  isLiked={tweet.isLiked}
                  isBookmarked={tweet.isBookmarked}
                  isRetweeted={tweet.isRetweeted}
                />
              ))}
        </div>
      )}
    </div>
  );
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
    unsubscribe = await onSnapshot(queryRef, async (querySnapshot) => {
      // if querySnapshot has no docs, most likely last tweet was seen
      if (!querySnapshot.docs[0] && setSeenLastTweet) {
        setSeenLastTweet(true);
        return;
      }

      // build fetchedTweets array from tweet documents plus information needed from twitter user
      const [docsToModify, docsToDelete, docsToAdd] =
        await processTweetsQuerySnapshot(querySnapshot);

      // set last visible tweet
      if (querySnapshot.docs.length > 0) {
        // Sort the docs based on createdAt (oldest to newest)
        const sortedDocs = querySnapshot.docs.sort((a, b) => {
          const aCreatedAt = a.data().createdAt;
          const bCreatedAt = b.data().createdAt;

          // Compare seconds first, then nanoseconds if seconds are equal
          if (aCreatedAt.seconds !== bCreatedAt.seconds) {
            return aCreatedAt.seconds - bCreatedAt.seconds;
          }
          return aCreatedAt.nanoseconds - bCreatedAt.nanoseconds;
        });

        // Select the first document (oldest)
        const lastTweet = sortedDocs[0];

        // eslint-disable-next-line no-param-reassign
        if (setLastVisibleTweetRef) {
          setLastVisibleTweetRef(lastTweet);
        }
      }

      // save tweets in context
      // Check if the tweet is already present in the context and avoid duplication done in updateTweets
      setHomeTweets((prevTweets) =>
        updateTweets(prevTweets, docsToModify, docsToDelete, docsToAdd)
      );
    });
    setLoading(false);
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
  const tweetIds = tweets.map((tweet) => tweet.originalTweetId);

  // chunk array into multiple arrays with max length of 30 (firestore limitation)
  // const chunks = chunkArray(tweetIds, 30);
  const chunks = chunkArray(tweetIds, 30);

  // delete old tweets from context to avoid duplicating them
  const tweetKeys = tweets.map((tweet) => tweet.key);
  setTweets((prevTweets) => updateTweets(prevTweets, [], tweetKeys, []));

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
        try {
          if (querySnapshot.docs.length > 0) {
            // build fetchedTweets array from tweet documents plus information needed from tweeter user
            const [docsToModify, docsToDelete, docsToAdd] =
              await processTweetsQuerySnapshot(querySnapshot);

            // set tweets
            setTweets((prevTweets) =>
              // resolve promise

              updateTweets(prevTweets, docsToModify, docsToDelete, docsToAdd)
            );

            // set last visible tweet ref  in last chunk
            if (chunks.indexOf(chunk) === chunks.length - 1) {
              // Sort the docs based on createdAt (oldest to newest)
              const sortedDocs = querySnapshot.docs.sort((a, b) => {
                const aCreatedAt = a.data().createdAt;
                const bCreatedAt = b.data().createdAt;

                // Compare seconds first, then nanoseconds if seconds are equal
                if (aCreatedAt.seconds !== bCreatedAt.seconds) {
                  return aCreatedAt.seconds - bCreatedAt.seconds;
                }
                return aCreatedAt.nanoseconds - bCreatedAt.nanoseconds;
              });

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
        }
        // get the user who posted the tweet's data
        const userDataRef = tweetData.userId;
        const userData = await getUserData(userDataRef);

        if (userData.uid) {
          // get interactions data
          const interactionsData = await getInteractionsData(tweetData.tweetId);

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

export default TweetContainer;
