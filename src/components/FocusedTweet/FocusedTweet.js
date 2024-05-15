import React, { forwardRef, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

// css
import './FocusedTweet.css';

// firebase
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

// utils
import svgs from '../../utils/svgs';
import {
  debounce,
  followClickHandler,
  formatDate,
  formatTimeAgo,
} from '../../utils/functions';
import { useUserContext } from '../../contextProvider/ContextProvider';

const FocusedTweet = forwardRef(({ element }, ref) => {
  const {
    docRef,
    userProfilePicture: profileImg,
    userName: name,
    userTag: tag,
    userDocId,
    createdAt,
    text,
    repliesCount: replies,
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

  // logged in user tag and following, if it exists
  const loggedUserTag = useUserContext().user?.tag;
  const loggedUserFollowing = useUserContext().user?.following;

  // state to show or hide options div
  const [isOptionsDivVisible, setIsOptionsDivVisible] = useState(false);

  // states used to keep track of action in progress
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [bookmarkInProgress, setBookmarkInProgress] = useState(false);
  const [retweetInProgress, setRetweetInProgress] = useState(false);

  // states used for debounce
  // ! change to refs, states don't make sense here
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
    <div className="focused-tweet" id={`focused-tweet-${idProp}`} ref={ref}>
      <div className="focused-tweet-top-separator" />
      <div className="focused-tweet-wrapper">
        <div className="focused-tweet-content">
          <div className="focused-tweet-user-row">
            <div className="focused-tweet-profile-picture">
              <div className="profile-picture-wrapper u-round">
                <Link to={`/${tag}`}>
                  <img src={profileImg} alt="profile" />
                </Link>
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-name">
                <Link to={`/${tag}`}>
                  <span>{name}</span>
                </Link>
              </div>
              <div className="profile-tag">
                <Link to={`/${tag}`}>
                  <span>@{tag}</span>
                </Link>
              </div>
            </div>
            <div className="flex-right">
              <button
                type="button"
                onClick={() => setIsOptionsDivVisible(true)}
              >
                <svg viewBox="0 0 24 24">
                  <path d={svgs.moreNoOutline} />
                </svg>
              </button>
            </div>
          </div>
          <div className="focused-tweet-row">
            <div className="flex-column">
              <div
                className="focused-tweet-text"
                dangerouslySetInnerHTML={{ __html: text }}
              />
              {tweetImg ? (
                <div className="focused-tweet-image-wrapper">
                  <img src={tweetImg} alt="focused-tweet" />
                </div>
              ) : null}
            </div>
          </div>
          <div className="focused-tweet-row time-posted">
            {formatDate(createdAt.toDate())}
          </div>
          <div className="focused-tweet-row focused-tweet-actions">
            <div className="focused-tweet-action">
              <button type="button">
                <svg viewBox="0 0 24 24">
                  <path d={svgs.comment} />
                </svg>
                <span>{replies}</span>
              </button>
            </div>
            <div
              className={`focused-tweet-action retweet ${
                isRetweeted ? 'active' : ''
              }`}
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
            <div
              className={`focused-tweet-action like ${isLiked ? 'active' : ''}`}
            >
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
              className={`focused-tweet-action bookmark ${
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

      {
        // eslint-disable-next-line no-nested-ternary
        isOptionsDivVisible ? (
          auth.currentUser?.uid ? (
            <div className="focused-tweet-options">
              <button
                type="button"
                className="close-options"
                aria-label="close-options"
                onClick={() => setIsOptionsDivVisible(false)}
              />
              <div className="wrapper">
                <div className="buttons">
                  {loggedUserTag && loggedUserTag === tag && (
                    <div>
                      <button
                        type="button"
                        className="delete"
                        onClick={() => deleteClickHandler(docRef)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d={svgs.delete} />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {(!loggedUserTag || loggedUserTag !== tag) && (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          followClickHandler(
                            { following: loggedUserFollowing },
                            { docId: userDocId },
                            navigate
                          )
                        }
                      >
                        <svg viewBox="0 0 24 24">
                          <path d={svgs.follow} />
                        </svg>
                        <span>
                          {`${
                            loggedUserFollowing?.includes(userDocId)
                              ? 'Unfollow'
                              : 'Follow'
                          }`}{' '}
                          @{tag}
                        </span>
                      </button>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      className="cancel"
                      onClick={() => setIsOptionsDivVisible(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/i/flow/login" />
          )
        ) : null
      }
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
  // on like, update tweet and 'likes' or 'bookmars' subcollection tweetInteraction documents if user is logged in and didn't already like respective tweet
  if (auth.currentUser) {
    if (!actionInProgress) {
      setActionInProgress(true);
      // * mock like to make website feel faster
      mockTweetInteraction(event, type);
      // get reference to tweet document
      const tweetsCollectionRef = collection(firestore, 'tweets');
      const tweetDocRef = doc(tweetsCollectionRef, ref);

      if (type === 'like' || type === 'bookmark') {
        // reference to 'likes' or 'bookmarks' collection
        const tweetInteractionsCollectionRef = collection(
          tweetDocRef,
          `${type}s`
        );

        // query for interaction document inside 'likes' or 'bookmarks' subcollection
        const tweetInteractionsQueryRef = query(
          tweetInteractionsCollectionRef,
          where('userId', '==', auth.currentUser.uid)
        );
        // get interaction snapshot
        const interactionSnapshot = await getDocs(tweetInteractionsQueryRef);

        // if interactionSnapshot is empty, then tweet isn't alread liked or bookmarked by current user
        if (interactionSnapshot.empty) {
          // create like or bookmark document
          const newDocRef = doc(tweetInteractionsCollectionRef);
          setDoc(newDocRef, {
            createdAt: serverTimestamp(),
            userId: auth.currentUser.uid,
          });

          // update counter with a transaction to ensure correct update
          // ! this should be done by a cloud function
          runTransaction(firestore, async (transaction) => {
            // get tweet doc
            const tweetDoc = await transaction.get(tweetDocRef);
            // get tweet doc counter data
            const oldCounter = tweetDoc.data()[`${type}sCount`];
            // update tweet doc counter data
            const newCounter = oldCounter + 1;
            await transaction.update(tweetDocRef, {
              [`${type}sCount`]: newCounter,
            });
          });
        } else {
          // delete like or bookmark document
          deleteDoc(interactionSnapshot.docs[0].ref);
          // update counter with a transaction to ensure correct update
          // ! this should be done by a cloud function
          runTransaction(firestore, async (transaction) => {
            // get tweet doc
            const tweetDoc = await transaction.get(tweetDocRef);
            // get tweet doc counter data
            const oldCounter = tweetDoc.data()[`${type}sCount`];
            // update tweet doc counter data
            const newCounter = oldCounter - 1;
            await transaction.update(tweetDocRef, {
              [`${type}sCount`]: newCounter,
            });
          });
        }
      } else if (type === 'retweet') {
        console.log('--------in retweet--------');
        // query for retweet document
        const retweetQuery = query(
          tweetsCollectionRef,
          where('retweetId', '==', idProp),
          where('userId', '==', auth.currentUser.uid)
        );

        // get retweet snapshot
        const retweetSnapshot = await getDocs(retweetQuery);
        console.log('--------dupa snapshot--------');
        // create or delete retweet document based on whether it already exists or not and increment or decrement totalTweets counter in transaction
        if (retweetSnapshot.empty) {
          // document doesn't already exist, create it

          // update total tweets counters and get new tweet id
          const newTweetId = await runTransaction(
            firestore,
            async (transaction) => {
              // reference to general counters doc
              const generalCountersRef = doc(firestore, 'counters', 'general');
              // get general counters doc
              const countersDoc = await transaction.get(generalCountersRef);
              // get general doc total tweets counter data
              const oldCounter = countersDoc.data().totalTweets;
              // update general doc total tweets counter data
              const newCounter = oldCounter + 1;
              await transaction.update(generalCountersRef, {
                totalTweets: newCounter,
              });
              return newCounter;
            }
          );
          console.log('--------dupa prima tranzactie--------');
          // create new tweet in tweets collection
          const retweetDocRef = doc(tweetsCollectionRef);
          const newTweetData = {
            type,
            userId: auth.currentUser.uid,
            tweetId: newTweetId,
            createdAt: serverTimestamp(),
            retweetId: idProp,
          };
          setDoc(retweetDocRef, newTweetData);

          // update tweet retweets counter in transaction
          // ! this should be done by a cloud function
          runTransaction(firestore, async (transaction) => {
            // get tweet doc
            const tweetDoc = await transaction.get(tweetDocRef);
            // get tweet doc counter data
            const oldCounter = tweetDoc.data()[`${type}sCount`];
            // update tweet doc counter data
            const newCounter = oldCounter + 1;
            await transaction.update(tweetDocRef, {
              [`${type}sCount`]: newCounter,
            });
          });
        } else {
          // document already exists, delete it
          deleteDoc(retweetSnapshot.docs[0].ref);

          // ! counter not decremented

          // update tweet retweets counter in transaction
          // ! this should be done by a cloud function
          runTransaction(firestore, async (transaction) => {
            // get tweet doc
            const tweetDoc = await transaction.get(tweetDocRef);
            // get tweet doc counter data
            const oldCounter = tweetDoc.data()[`${type}sCount`];
            // update tweet doc counter data
            const newCounter = oldCounter - 1;
            await transaction.update(tweetDocRef, {
              [`${type}sCount`]: newCounter,
            });
          });
        }
      }
      setActionInProgress(false);
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

const deleteClickHandler = (docRef) => {
  // ? maybe add some visual feedback while doc is deleting
  const docToDelete = doc(firestore, `tweets/${docRef}`);
  deleteDoc(docToDelete);
};

export default FocusedTweet;
