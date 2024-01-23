import React, { forwardRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// css
import './Tweet.css';

// firebase
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

// utils
import svgs from '../../utils/svgs';
import { debounce, formatTimeAgo } from '../../utils/functions';

const Tweet = forwardRef(({ element }, ref) => {
  const {
    docRef,
    reposterData,
    userProfilePicture: profileImg,
    userName: name,
    userTag: tag,
    createdAt,
    text,
    repliesCounte: replies,
    retweetsCount: retweets,
    likesCount: likes,
    bookmarksCount: bookmarks,
    tweetId: idProp,
    imageLink: tweetImg,
    isLiked,
    isBookmarked,
    isRetweeted,
  } = element;
  const navigate = useNavigate();

  // states used to keep track of action in progress
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [bookmarkInProgress, setBookmarkInProgress] = useState(false);
  const [retweetInProgress, setRetweetInProgress] = useState(false);

  // states used for debounce
  const [lastLikeAction, setLastLikeAction] = useState(Date.now());
  const [lastBookmarkAction, setLastBookmarkAction] = useState(Date.now());
  const [lastRetweetAction, setLastRetweetAction] = useState(Date.now());

  useEffect(() => {
    // only set action as complete if it fails(in like function try catch) or when changes have been propagated
    // this stops double or triple actions
    // e.g. of problem averted: if actionInProgress is set to false in likeHandler, after transaction is run, and if user clicks rapidly on like button, if one click happens in the time period between setting actionInProgress to false and Home noticing the change to isLiked and propagating it, tweet could be liked twice
    setLikeInProgress(false);
  }, [isLiked]);

  useEffect(() => {
    // only set action as complete if it fails(in like function try catch) or when changes have been propagated
    // this stops double or triple actions
    // e.g. of problem averted: if actionInProgress is set to false in likeHandler, after transaction is run, and if user clicks rapidly on like button, if one click happens in the time period between setting actionInProgress to false and Home noticing the change to isLiked and propagating it, tweet could be liked twice
    setBookmarkInProgress(false);
  }, [isBookmarked]);

  useEffect(() => {
    // only set action as complete if it fails(in like function try catch) or when changes have been propagated
    // this stops double or triple actions
    // e.g. of problem averted: if actionInProgress is set to false in likeHandler, after transaction is run, and if user clicks rapidly on like button, if one click happens in the time period between setting actionInProgress to false and Home noticing the change to isLiked and propagating it, tweet could be liked twice
    setRetweetInProgress(false);
  }, [isRetweeted]);

  const debouncedLikeHandler = debounce(
    () => {
      likeHandler(
        event,
        'like',
        idProp,
        navigate,
        likeInProgress,
        setLikeInProgress,
        docRef
      );
    },
    500,
    lastLikeAction,
    setLastLikeAction
  );

  const debouncedBookmarkHandler = debounce(
    () => {
      likeHandler(
        event,
        'bookmark',
        idProp,
        navigate,
        bookmarkInProgress,
        setBookmarkInProgress,
        docRef
      );
    },
    500,
    lastBookmarkAction,
    setLastBookmarkAction
  );

  const debouncedRetweetHandler = debounce(
    () => {
      likeHandler(
        event,
        'retweet',
        idProp,
        navigate,
        retweetInProgress,
        setRetweetInProgress,
        docRef
      );
    },
    500,
    lastRetweetAction,
    setLastRetweetAction
  );

  return (
    <div className="tweet" id={`tweet-${idProp}`} ref={ref}>
      <div className="tweet-top-separator" />
      {reposterData && (
        <div className="tweet-repost">
          <div>
            <svg viewBox="0 0 24 24">
              <path d={svgs.retweet} />
            </svg>
          </div>
          <span>
            {reposterData.uid === auth.currentUser.uid
              ? 'You'
              : reposterData.name}{' '}
            retweeted
          </span>
        </div>
      )}
      <div className="tweet-wrapper">
        <div className="tweet-profile-picture">
          <div className="profile-picture-wrapper u-round">
            <Link to="/profile">
              <img src={profileImg} alt="profile" />
            </Link>
          </div>
          <div className="gray-line">
            <Link to="/status/123" />
          </div>
        </div>
        <div className="tweet-content">
          <div className="tweet-row">
            <div className="profile-details">
              <div className="profile-name">
                <span>{name}</span>
              </div>
              <div className="profile-tag">
                <span>@{tag}</span>
              </div>
              <div className="separator">
                <span>·</span>
              </div>
              <div className="date-posted">
                <span>{formatTimeAgo(createdAt)}</span>
              </div>
            </div>
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.moreNoOutline} />
              </svg>
            </button>
          </div>
          <div className="tweet-row">
            <div className="flex-column">
              <div className="tweet-text">
                <span>{text}</span>
              </div>
              {tweetImg ? (
                <div className="tweet-image-wrapper">
                  <img src={tweetImg} alt="tweet" />
                </div>
              ) : null}
            </div>
          </div>
          <div className="tweet-row tweet-actions">
            <div className="tweet-action">
              <button type="button">
                <svg viewBox="0 0 24 24">
                  <path d={svgs.comment} />
                </svg>
                <span>{replies}</span>
              </button>
            </div>
            <div
              className={`tweet-action retweet ${isRetweeted ? 'active' : ''}`}
            >
              <button
                type="button"
                onClick={(event) => debouncedRetweetHandler(event)}
              >
                <svg viewBox="0 0 24 24">
                  <path d={svgs.retweet} />
                </svg>
                <span>{retweets}</span>
              </button>
            </div>
            <div className={`tweet-action like ${isLiked ? 'active' : ''}`}>
              <button
                type="button"
                onClick={(event) => debouncedLikeHandler(event)}
              >
                {isLiked ? (
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.likeActive} />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.like} />
                  </svg>
                )}
                <span>{likes}</span>
              </button>
            </div>
            <div
              className={`tweet-action bookmark ${
                isBookmarked ? 'active' : ''
              }`}
            >
              <button
                type="button"
                onClick={(event) => debouncedBookmarkHandler(event)}
              >
                {isBookmarked ? (
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.bookmarksActive} />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.bookmarks} />
                  </svg>
                )}
                <span>{bookmarks}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const likeHandler = async (
  event,
  type,
  idProp,
  navigate,
  actionInProgress,
  setActionInProgress,
  ref
) => {
  // on like, update tweet and tweetInteraction documents if user is logged in and didn't already like respective tweet
  if (auth.currentUser) {
    if (!actionInProgress) {
      setActionInProgress(true);
      // * mock like to make website feel faster
      mockTweetInteraction(event, type);
      // get reference to tweet document
      const tweetsCollectionRef = collection(firestore, 'tweets');
      const tweetDocRef = doc(tweetsCollectionRef, ref);
      const tweetDoc = await getDoc(tweetDocRef);

      // get reference to tweetInteractions document
      const tweetInteractionsCollectionRef = collection(
        firestore,
        'tweetInteractions'
      );
      const tweetInteractionsQueryRef = query(
        tweetInteractionsCollectionRef,
        where('tweetId', '==', idProp),
        where('userId', '==', auth.currentUser.uid),
        where('type', '==', type)
      );

      // get reference to retweet document
      const retweetQuery = query(
        tweetsCollectionRef,
        where('retweetId', '==', idProp),
        where('userId', '==', auth.currentUser.uid)
      );

      try {
        // * store like in database
        await runTransaction(firestore, async (transaction) => {
          // set tweet interactions document
          let newDocRef = null;
          let newId = idProp;
          let interactionExists = false;
          let docToDelete = null;
          if (type === 'like' || type === 'bookmark') {
            // first make sure action didn't already happen (tweet wasn't already liked/bookmarked by user)
            const tweetInteractionsQuerySnapshot = await getDocs(
              tweetInteractionsQueryRef
            );
            docToDelete = tweetInteractionsQuerySnapshot?.docs[0]?.ref;
            interactionExists = !tweetInteractionsQuerySnapshot.empty;
            // for likes and bookmarks, want to write new document in tweetInteractions collection
            newDocRef = doc(tweetInteractionsCollectionRef);
          } else if (type === 'retweet') {
            // first make sure action didn't already happen (tweet wasn't already retweeted by user)
            const retweetSnapshot = await getDocs(retweetQuery);
            docToDelete = retweetSnapshot?.docs[0]?.ref;
            interactionExists = !retweetSnapshot.empty;
            // for retweets, want to write new tweet doc in tweets collection
            const countersCollection = collection(firestore, 'counters');
            const countersDoc = doc(countersCollection, 'general');
            const countersData = await transaction.get(countersDoc);
            newId = countersData.data().totalTweets + 1;
            transaction.update(countersDoc, { totalTweets: newId });
            newDocRef = doc(tweetsCollectionRef);
          }

          // only create interaction if it does not already exist
          if (!interactionExists) {
            const newTweetInteractionData = {
              type,
              userId: auth.currentUser.uid,
              tweetId: newId,
              createdAt: serverTimestamp(),
              ...(type === 'retweet' && { retweetId: idProp }),
            };
            await transaction.set(newDocRef, newTweetInteractionData);

            // update tweet document
            const countField = `${type}sCount`;
            await transaction.update(tweetDoc.ref, {
              [countField]: tweetDoc.data()[countField] + 1,
            });
          } else {
            // interaction exists, so delete it
            // delete tweetInteraction document
            await transaction.delete(docToDelete);
            // update tweet document
            const countField = `${type}sCount`;
            await transaction.update(tweetDoc.ref, {
              [countField]: tweetDoc.data()[countField] - 1,
            });
          }

          setActionInProgress(false);
        });
      } catch (error) {
        // something went wrong, log error for now
        console.log('error => ', { error });
        // allow further actions to happen
        setActionInProgress(false);
        // reverse visual changes
        mockTweetInteraction(event, type);
      }
    }
  } else {
    // user isn't logged in, send him to log in
    navigate('/i/flow/login');
  }
};

const mockTweetInteraction = (event, type) => {
  // make tweet visually seem liked/unliked/bookmarked/unbookmarked, etc
  // get DOM elements
  const divElement = event.target.closest('.tweet-action');
  const spanElement = event.target.closest('button').querySelector('span');
  const svgElement = event.target.closest('button').querySelector('svg');
  const svgPath = svgElement.querySelector('path');

  // prepare oldPath and newPath for SVG's
  let oldPath = '';
  let newPath = '';

  switch (type) {
    case 'like':
      oldPath = svgs.like;
      newPath = svgs.likeActive;
      break;
    case 'bookmark':
      oldPath = svgs.bookmarks;
      newPath = svgs.bookmarksActive;
      break;
    case 'retweet':
      oldPath = svgs.retweet;
      newPath = svgs.retweet;
      break;
    default:
      break;
  }
  if (!divElement.classList.contains('active')) {
    divElement.classList.add('active');
    spanElement.textContent = parseInt(spanElement.textContent, 10) + 1;
    svgPath.setAttribute('d', newPath);
  } else {
    divElement.classList.remove('active');
    spanElement.textContent = parseInt(spanElement.textContent, 10) - 1;
    svgPath.setAttribute('d', oldPath);
  }
};

export default Tweet;
