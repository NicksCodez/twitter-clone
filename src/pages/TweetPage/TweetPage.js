import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// firebase
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './TweetPage.css';

// utils
import svgs from '../../utils/svgs';
import { attachListenersToTweets, tweetsLoader } from '../Home/Home';

// components
import PageHeader from '../../components/PageHeader/PageHeader';
import FocusedTweet from '../../components/FocusedTweet/FocusedTweet';
import ScrollableElementsLoader from '../../components/ScrollableElementsLoader/ScrollableElementsLoader';
import Tweet from '../../components/Tweet/Tweet';

const TweetPage = () => {
  // id parameter
  const { id } = useParams();

  // navigator function
  const navigate = useNavigate();

  // ref to scroll to component FocusedTweet
  const targetRef = useRef(null);

  // state to store tweet data
  const [currentTweetData, setCurrentTweetData] = useState(null);
  const [parentTweets, setParentTweets] = useState([]);
  const lastParentTweetRef = useRef(null);

  // state to store loader info for ScrollableElementsLoader
  const [loaderInfo, setLoaderInfo] = useState({});
  const [replyTweets, setReplyTweets] = useState([]);
  const seenLastReplyRef = useRef(false);
  const lastVisibleReplyRef = useRef(null);
  const [isScrollableLoading, seIsScrollableLoading] = useState(true);
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    // debugging
    if (targetRef.current) {
      console.log('scrolling');
      targetRef.current.scrollIntoView();
    }
  }, [lastParentTweetRef.current]);

  // get post data
  useEffect(() => {
    console.log({ id });
    // create query to get tweet
    const tweetsCollectionRef = collection(firestore, 'tweets');
    const queryRef = query(
      tweetsCollectionRef,
      where('tweetId', '==', +id),
      limit(1)
    );

    const tweetSnapshot = getDocs(queryRef);
    tweetSnapshot.then((r) => {
      const tweetData = r.docs[0].data();

      // got tweet data, check if it is a reply to another tweet and store whole thread
      const parentTweetRef = tweetData.replyTo;

      getParentTweets(parentTweetRef).then((q) => {
        setParentTweets(q);
      });

      // get user data
      const tweetPoster = tweetData.userId;

      const usersCollectionRef = collection(firestore, 'users');
      const userQueryRef = query(
        usersCollectionRef,
        where('uid', '==', tweetPoster)
      );
      const userSnapshot = getDocs(userQueryRef);

      // append user data to tweet data
      userSnapshot.then((t) => {
        const userData = t.docs[0].data();
        const tweetObject = {
          docRef: r.docs[0].id,
          ...tweetData,
          userName: userData.name,
          userTag: userData.tag,
          userProfilePicture: userData.profileImg,
        };

        console.log({ tweetObject });
        setCurrentTweetData(tweetObject);
      });
    });

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
      // empty replyTweets array
      setReplyTweets([]);
    };
  }, [id]);

  useEffect(() => {
    // once tweet data is loaded, create query for ScrollableElementsLoader
    console.log('docRef changed => ', { currentTweetData });
    if (currentTweetData?.docRef) {
      const tweetsCollectionRef = collection(firestore, 'tweets');
      const queryRef = query(
        tweetsCollectionRef,
        where('replyTo', '==', currentTweetData.docRef),
        orderBy('createdAt', 'desc'),
        limit(25)
      );
      setLoaderInfo({ queryRef });
    }
  }, [currentTweetData?.docRef]);

  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !seenLastReplyRef.current) {
      // construct query to get next 25 tweets after intersection
      const tweetsCollectionRef = collection(firestore, 'tweets');

      const queryRef = query(
        tweetsCollectionRef,
        where('replyTo', '==', currentTweetData.docRef),
        orderBy('createdAt', 'desc'),
        limit(25),
        startAfter(lastVisibleReplyRef.current)
      );

      setLoaderInfo({ queryRef, attach: false });
    }
  };

  const pushUnsubscriber = (unsubscriber) => {
    unsubscribersRef.current.push(unsubscriber);
  };

  // build left element
  const leftElement = (
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

  // build middle element
  const middleElement = (
    <div className="wrapper-col">
      <span>Post</span>
    </div>
  );

  // right element
  const rightElement = <div className="minW" />;

  return (
    <div id="tweet-page">
      <div id="tweet-page-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      {parentTweets &&
        parentTweets
          .slice()
          .reverse()
          .map((tweet, index) => {
            const isLastElement = index === parentTweets.length - 1;
            return (
              <div className="padded" key={tweet.docRef}>
                <Tweet
                  element={tweet}
                  ref={isLastElement ? lastParentTweetRef : null}
                />
              </div>
            );
          })}
      {currentTweetData && (
        <FocusedTweet element={currentTweetData} ref={targetRef} />
      )}
      <div className="padded">
        {loaderInfo.queryRef && (
          <ScrollableElementsLoader
            elementsLoader={loaderInfo}
            elements={replyTweets}
            setElements={setReplyTweets}
            loadElements={tweetsLoader}
            attachListenersToElements={attachListenersToTweets}
            setLoadedSignal={seIsScrollableLoading}
            intersectionHandler={handleIntersection}
            ElementComponent={Tweet}
            setLastRetrievedElement={(curRef) => {
              lastVisibleReplyRef.current = curRef;
            }}
            seenLastElement={seenLastReplyRef}
            setSeenLastElement={(curRef) => {
              seenLastReplyRef.current = curRef;
            }}
            pushUnsubscriber={pushUnsubscriber}
          />
        )}
      </div>
    </div>
  );
};

const getParentTweets = async (tweetRef) => {
  const threadTweets = [];
  let parentTweetRef = tweetRef;
  while (parentTweetRef) {
    console.log({ parentTweetRef });
    const parentTweetDoc = doc(firestore, 'tweets', parentTweetRef);
    const parentTweet = await getDoc(parentTweetDoc);
    const parentTweetData = parentTweet.data();
    // get user data
    const tweetPoster = parentTweetData.userId;

    const usersCollectionRef = collection(firestore, 'users');
    const userQueryRef = query(
      usersCollectionRef,
      where('uid', '==', tweetPoster)
    );
    const userSnapshot = await getDocs(userQueryRef);

    const userData = userSnapshot.docs[0].data();
    const tweetObject = {
      docRef: parentTweetRef,
      ...parentTweetData,
      userName: userData.name,
      userTag: userData.tag,
      userProfilePicture: userData.profileImg,
      activeGrayLine: true,
    };

    // push tweet object to threadTweets array
    threadTweets.push(tweetObject);

    // set new parentTweetRef
    parentTweetRef = parentTweetData.replyTo;
  }

  return threadTweets;
};

export default TweetPage;
