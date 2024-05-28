import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// firestore
import {
  collection,
  collectionGroup,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { firestore } from '../../../firebase';

// css
import './ProfileContent.css';

// components
import ScrollableElementsLoader from '../../ScrollableElementsLoader/ScrollableElementsLoader';
import Tweet from '../../Tweet/Tweet';
import {
  attachListenersToTweets,
  tweetsLoader,
} from '../../../pages/Home/Home';
import CommonFollowers from '../../CommonFollowers/CommonFollowers';

// context providers
import { useUserContext } from '../../../contextProvider/ContextProvider';

// utils
import svgs from '../../../utils/svgs';
import DefaultProfile from '../../../assets/images/default_profile.png';

// utils
import {
  debounce,
  followClickHandler,
  getInteractionsData,
  getUserData,
  updateTweets,
} from '../../../utils/functions';

const ProfileContent = ({ profileVisited, isOwnProfile, isFollowed, tag }) => {
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const [loaderInfo, setLoaderInfo] = useState({
    queryRef: null,
    attach: false,
  });
  const [isScrollableLoading, setIsScrollableLoading] = useState(true);
  const [tabSelected, setTabSelected] = useState('tweets');
  const navigate = useNavigate();

  // logged in user
  const { user } = useUserContext();

  // refs for scroll functionality
  const seenLastTweetRef = useRef(false);
  const lastRetrievedTweetRef = useRef(null);

  // refs for last follow button click
  const lastFollowButtonClickRef = useRef(Date.now());

  // ref to store unsubscribe functions
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    setTweetsLoading(isScrollableLoading);
  }, [isScrollableLoading]);

  // function to get tweets made by profileVisited user according to category
  const getTweets = async (category) => {
    setTweetsLoading(true);
    setTweets((prevTweets) => []);

    const tweetsCollectionRef = collection(firestore, 'tweets');

    let queryRef;
    switch (category) {
      case 'tweets':
        // reset likes refs so next time likes are clicked everything is restarted
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(25)
        );
        setLoaderInfo((prevLoaderInfo) => ({ ...prevLoaderInfo, queryRef }));
        break;
      case 'replies':
        queryRef = query(
          tweetsCollectionRef,
          where('type', '==', 'reply'),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(25)
        );
        setLoaderInfo((prevLoaderInfo) => ({ ...prevLoaderInfo, queryRef }));
        break;
      case 'media':
        queryRef = query(
          tweetsCollectionRef,
          where('userId', '==', profileVisited.uid),
          where('imageLink', '!=', ''),
          limit(25)
        );
        setLoaderInfo((prevLoaderInfo) => ({ ...prevLoaderInfo, queryRef }));
        break;
      case 'likes':
        getLikesBookmarks(
          'like',
          lastRetrievedTweetRef,
          seenLastTweetRef,
          setTweets,
          profileVisited.uid
        ).then((resolved) => {
          pushUnsubscriber(resolved);
        });
        break;
      default:
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(25)
        );
        setLoaderInfo((prevLoaderInfo) => ({ ...prevLoaderInfo, queryRef }));
    }
  };

  const pushUnsubscriber = (unsubscriber) => {
    unsubscribersRef.current.push(unsubscriber);
  };

  useEffect(() => {
    // reset flags
    lastRetrievedTweetRef.current = null;
    seenLastTweetRef.current = false;

    // tweets loading when tab is switched
    if (profileVisited.uid) {
      getTweets(tabSelected);
    }

    return () => {
      // on unmount and tab switch, unsubscribe from listeners
      // unsubsribersRef is an array, each element in it is an promise returned by tweetsLoader
      // each of these promises resolves to an array returned by attachListeners...
      // each element in this array is a function which unsubscribes from the tweets listener

      unsubscribersRef.current.forEach((unsubbersArray) => {
        unsubbersArray.forEach((unsubber) => {
          unsubber();
        });
      });
    };
  }, [tabSelected]);

  // function to handleIntersection
  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !seenLastTweetRef.current) {
      // construct query to get next 25 tweets after intersection
      const tweetsCollectionRef = collection(firestore, 'tweets');

      let queryRef;
      switch (tabSelected) {
        case 'tweets':
          queryRef = query(
            tweetsCollectionRef,
            where('type', 'in', ['tweet', 'retweet']),
            where('userId', '==', profileVisited.uid),
            orderBy('createdAt', 'desc'),
            startAfter(lastRetrievedTweetRef.current),
            limit(25)
          );
          setLoaderInfo({ queryRef, attach: false });
          break;
        case 'replies':
          queryRef = query(
            tweetsCollectionRef,
            where('type', '==', 'reply'),
            where('userId', '==', profileVisited.uid),
            orderBy('createdAt', 'desc'),
            startAfter(lastRetrievedTweetRef.current),
            limit(25)
          );
          setLoaderInfo({ queryRef, attach: false });
          break;
        case 'media':
          queryRef = query(
            tweetsCollectionRef,
            where('userId', '==', profileVisited.uid),
            where('imageLink', '!=', ''),
            startAfter(lastRetrievedTweetRef.current),
            limit(25)
          );
          setLoaderInfo({ queryRef, attach: false });
          break;
        case 'likes':
          getLikesBookmarks(
            'like',
            lastRetrievedTweetRef,
            seenLastTweetRef,
            setTweets,
            profileVisited.uid
          ).then((resolved) => pushUnsubscriber(resolved));
          break;
        default:
          queryRef = query(
            tweetsCollectionRef,
            where('type', 'in', ['tweet', 'retweet']),
            where('userId', '==', profileVisited.uid),
            orderBy('createdAt', 'desc'),
            limit(200)
          );
          setLoaderInfo({ queryRef, attach: false });
      }
    }
  };

  const buttonClickHandler = (event) => {
    const parent = event.currentTarget.closest('#profile-page-tweet-filters');
    const active = parent.getElementsByClassName('active');
    Array.from(active).forEach((element) => {
      element.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
  };

  return (
    <div id="profile-page-content">
      <div id="profile-page-header-image">
        {profileVisited?.headerImg && (
          <img src={profileVisited.headerImg} alt="profile header" />
        )}
      </div>

      <div id="profile-page-buttons">
        {profileVisited.uid && (
          <div>
            <div className="button-wrapper">
              {!isOwnProfile && (
                <button
                  type="button"
                  className={`u-round ${!isFollowed ? 'unfollowed' : ''}`}
                  onClick={debounce(
                    () => {
                      followClickHandler(user, profileVisited, navigate);
                    },
                    500,
                    lastFollowButtonClickRef.current,
                    (date) => {
                      lastFollowButtonClickRef.current = date;
                    }
                  )}
                >
                  <span>{isFollowed ? 'Following' : 'Follow'}</span>
                </button>
              )}
              {isOwnProfile &&
                (!profileVisited.setup || profileVisited.setup === false) && (
                  <Link to="/i/flow/setup_profile" className="u-round">
                    <span>Set up profile</span>
                  </Link>
                )}
              {isOwnProfile &&
                profileVisited.setup &&
                profileVisited.setup === true && (
                  <Link to="/settings/profile" className="u-round">
                    <span>Edit profile</span>
                  </Link>
                )}
            </div>
          </div>
        )}
        <div className="profile-picture-wrapper u-round">
          <img
            src={profileVisited.profileImg || DefaultProfile}
            alt="profile"
            className="u-round"
          />
        </div>
      </div>
      <div className="wrapper-padded">
        <div>
          <div id="profile-page-name">
            {profileVisited.name ? profileVisited.name : `@${tag}`}
          </div>
          <div id="profile-page-tag">
            {profileVisited.uid && `@${profileVisited.tag}`}
          </div>
        </div>
        {profileVisited.uid ? (
          <div className="wrapper">
            <div id="profile-page-description">
              {profileVisited.bio.length > 0 && profileVisited.bio}
            </div>
            <div id="profile-page-links">
              {profileVisited.location && (
                <div>
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.location} />
                  </svg>
                  <span>{profileVisited.location}</span>
                </div>
              )}
              {profileVisited.externalLink && (
                <div>
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.link} />
                  </svg>
                  <Link to="https://www.google.com" className="blue">
                    {profileVisited.externalLink}
                  </Link>
                </div>
              )}
              <div>
                <svg viewBox="0 0 24 24">
                  <path d={svgs.calendar} />
                </svg>
                <span>Joined {formatTimestamp(profileVisited.createdAt)}</span>
              </div>
            </div>
            <div id="profile-page-follower-details">
              <Link to={`/${tag}/following`}>
                <div className="primary">
                  <span>{profileVisited.following?.length}</span>
                </div>
                <div className="secondary">
                  <span>Following</span>
                </div>
              </Link>
              <Link to={`/${tag}/followers`}>
                <div className="primary">
                  <span>{profileVisited.followers?.length}</span>
                </div>
                <div className="secondary">
                  <span>Followers</span>
                </div>
              </Link>
            </div>
            {!isOwnProfile && (
              <CommonFollowers
                tag={tag}
                profileVisited={{ ref: profileVisited.docRef }}
                user={user}
              />
            )}
            <div id="profile-page-tweet-filters">
              <div className="button-wrapper">
                <button
                  type="button"
                  className="active"
                  onClick={(event) => {
                    buttonClickHandler(event);
                    setTabSelected('tweets');
                  }}
                >
                  <span>Tweets</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button
                  type="button"
                  onClick={(event) => {
                    buttonClickHandler(event);
                    setTabSelected('replies');
                  }}
                >
                  <span>Replies</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button
                  type="button"
                  onClick={(event) => {
                    buttonClickHandler(event);
                    setTabSelected('media');
                  }}
                >
                  <span>Media</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button
                  type="button"
                  onClick={(event) => {
                    buttonClickHandler(event);
                    setTabSelected('likes');
                  }}
                >
                  <span>Likes</span>
                  <div className="underline u-round" />
                </button>
              </div>
            </div>
            {/* <TweetContainer tweets={tweets} isLoading={tweetsLoading} /> */}
            <ScrollableElementsLoader
              elementsLoader={loaderInfo}
              elements={tweets}
              setElements={setTweets}
              loadElements={tweetsLoader}
              attachListenersToElements={attachListenersToTweets}
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
              noQuery={tabSelected === 'like'}
            />
          </div>
        ) : (
          <div className="not-found-wrapper">
            <span className="title">This account doesn&apos;t exist</span>
            <span className="subtitle">Try searching for another.</span>
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.seconds || !timestamp.nanoseconds) {
    return '';
  }

  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
}

export const getLikesBookmarks = async (
  type,
  lastRetrievedTweetRef,
  seenLastTweetRef,
  setTweets,
  uid
) => {
  // type can be 'like' or 'bookmark'
  const unsubscribe = [];
  // if already seen last possible tweet, no need to run
  if (!seenLastTweetRef.current) {
    // make collection group of 'likes' or 'bookmarks' collection
    // const colGroup = collectionGroup(firestore, `${type}s`);
    const colGroup = collectionGroup(firestore, `${type}s`);
    // query for first or following 25 documents
    const colQuery = !lastRetrievedTweetRef.current
      ? query(
          colGroup,
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(25)
        )
      : query(
          colGroup,
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
          startAfter(lastRetrievedTweetRef.current),
          limit(25)
        );
    const colSnapshot = await getDocs(colQuery);
    if (colSnapshot.empty) {
      // no documents, reached end of collection, nothing else to retrieve
      seenLastTweetRef.current = true;
    } else {
      // got documents, get their timestamps
      // these will be used to attach listeners to these specific tweets
      // the reason onSnapshot is not used directly with colQuery is that if tweets are added or deleted it breaks tweet update functionality
      const timestamps = colSnapshot.docs.map(
        (document) => document.data().createdAt
      );
      const listenersQuery = !lastRetrievedTweetRef.current
        ? query(
            colGroup,
            where('userId', '==', uid),
            where('createdAt', 'in', timestamps),
            orderBy('createdAt', 'desc'),
            limit(25)
          )
        : query(
            colGroup,
            where('userId', '==', uid),
            where('createdAt', 'in', timestamps),
            orderBy('createdAt', 'desc'),
            startAfter(lastRetrievedTweetRef.current),
            limit(25)
          );

      const unsubscriber = await onSnapshot(
        listenersQuery,
        async (listenersSnapshot) => {
          // build fetchedTweets array from tweet documents plus information needed from tweeter user
          const [docsToModify, docsToDelete, docsToAdd] = await processTweets(
            listenersSnapshot
          );

          // set tweets
          setTweets((prevTweets) =>
            updateTweets(
              prevTweets,
              docsToModify,
              docsToDelete,
              docsToAdd,
              true
            )
          );

          // set last retrieved tweet
          lastRetrievedTweetRef.current =
            listenersSnapshot.docs[listenersSnapshot.docs.length - 1];
        }
      );
      unsubscribe.push(unsubscriber);
    }
  }
  return unsubscribe;
};

const processTweets = async (querySnapshot) => {
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
        docsToAddIds.push(change.doc.ref.parent.parent.id);
        break;
      case 'modified':
        docsToModifyIds.push(change.doc.ref.parent.parent.id);
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

        // my document is a 'likes' or 'bookmarks' document, I want to get the data from the collection's parent document (the tweet document)
        const { parent } = document.ref.parent;
        const parentSnapshot = await getDoc(parent);
        const tweetData = parentSnapshot.data();
        const reposterData = null;
        const tweetDocRef = parent.id;
        const repostTime = null;
        const originalTweetId = tweetData.tweetId;

        // get the user who posted the tweet's data
        const userDataRef = tweetData.userId;
        const userData = await getUserData(userDataRef);

        if (userData.uid) {
          // get interactions data
          const interactionsData = await getInteractionsData(
            tweetData.tweetId,
            parent
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

          if (docsToAddIds.includes(parent.id)) {
            docsToAdd.push(processedTweetDocument);
          }

          if (docsToModifyIds.includes(parent.id)) {
            docsToModify.push(processedTweetDocument);
          }
        }
      }
      return {};
    })
  );
  return [docsToModify, docsToDeleteIds, docsToAdd];
};

export default ProfileContent;
