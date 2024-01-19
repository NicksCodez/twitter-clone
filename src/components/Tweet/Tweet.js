import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// css
import './Tweet.css';

// firebase
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

// utils
import svgs from '../../utils/svgs';

const Tweet = React.memo(
  ({
    profileImg,
    name,
    tag,
    createdAt,
    text,
    replies,
    retweets,
    likes,
    bookmarks,
    idProp,
    tweetImg,
    isLiked,
    isBookmarked,
    isRetweeted,
  }) => {
    const navigate = useNavigate();
    const [likeInProgress, setLikeInProgress] = useState(false);
    const [bookmarkInProgress, setBookmarkInProgress] = useState(false);
    const [retweetInProgress, setRetweetInProgress] = useState(false);

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

    return (
      <div className="tweet" id={`tweet-${idProp}`}>
        <div className="tweet-top-separator" />
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
                  <span>{createdAt}</span>
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
                className={`tweet-action retweet ${
                  isRetweeted ? 'active' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={(event) =>
                    likeHandler(
                      event,
                      'retweet',
                      idProp,
                      navigate,
                      isRetweeted,
                      retweetInProgress,
                      setRetweetInProgress
                    )
                  }
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
                  onClick={(event) =>
                    likeHandler(
                      event,
                      'like',
                      idProp,
                      navigate,
                      isLiked,
                      likeInProgress,
                      setLikeInProgress
                    )
                  }
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
                  onClick={(event) =>
                    likeHandler(
                      event,
                      'bookmark',
                      idProp,
                      navigate,
                      isBookmarked,
                      bookmarkInProgress,
                      setBookmarkInProgress
                    )
                  }
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
  }
);

const likeHandler = async (
  event,
  type,
  idProp,
  navigate,
  isLiked,
  actionInProgress,
  setActionInProgress
) => {
  // on like, update tweet and tweetInteraction documents if user is logged in and didn't already like respective tweet
  if (auth.currentUser) {
    if (!actionInProgress) {
      setActionInProgress(true);
      // * mock like to make website feel faster
      mockTweetInteraction(event, isLiked, type);
      // get reference to tweet document
      const tweetsCollectionRef = collection(firestore, 'tweets');
      const tweetsQueryRef = query(
        tweetsCollectionRef,
        where('tweetId', '==', idProp)
      );

      const tweetsQuerySnapshot = await getDocs(tweetsQueryRef);

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

      let docToDelete = null;
      if (type === 'retweet') {
        const retweetSnapshot = await getDocs(retweetQuery);
        docToDelete = retweetSnapshot?.docs[0]?.ref;
      } else if (type === 'like' || type === 'bookmark') {
        const tweetInteractionsQuerySnapshot = await getDocs(
          tweetInteractionsQueryRef
        );
        docToDelete = tweetInteractionsQuerySnapshot?.docs[0]?.ref;
      }

      if (!isLiked) {
        // if user didn't already like tweet, like it
        try {
          // * store like in database
          await runTransaction(firestore, async (transaction) => {
            // set tweet interactions document
            let newDocRef = null;
            let newId = idProp;
            if (type === 'like' || type === 'bookmark') {
              // for likes and bookmarks, want to write new document in tweetInteractions collection
              newDocRef = doc(tweetInteractionsCollectionRef);
            } else if (type === 'retweet') {
              // for retweets, want to write new tweet doc in tweets collection
              const countersCollection = collection(firestore, 'counters');
              const countersDoc = doc(countersCollection, 'general');
              const countersData = await transaction.get(countersDoc);
              newId = countersData.data().totalTweets + 1;
              transaction.update(countersDoc, { totalTweets: newId });
              newDocRef = doc(tweetsCollectionRef);
            }
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
            await transaction.update(tweetsQuerySnapshot.docs[0].ref, {
              [countField]: tweetsQuerySnapshot.docs[0].data()[countField] + 1,
            });
            setActionInProgress(false);
          });
        } catch (error) {
          // something went wrong, log error for now
          console.log('error => ', { error });
          // allow further actions to happen
          setActionInProgress(false);
          // reverse visual changes
          mockTweetInteraction(event, !isLiked, type);
        }
      } else {
        // user already liked tweet, so unlike it
        try {
          await runTransaction(firestore, async (transaction) => {
            // delete tweetInteraction document
            await transaction.delete(docToDelete);

            // update tweet document
            const countField = `${type}sCount`;
            await transaction.update(tweetsQuerySnapshot.docs[0].ref, {
              [countField]: tweetsQuerySnapshot.docs[0].data()[countField] - 1,
            });
            setActionInProgress(false);
          });
        } catch (error) {
          // something went wrong, so log error for now
          console.log('error => ', { error });
          // allow further actions to happen
          setActionInProgress(false);
          // reverse visual changes
          mockTweetInteraction(event, !isLiked, type);
        }
      }
    }
  } else {
    // user isn't logged in, send him to log in
    navigate('/i/flow/login');
  }
};

const mockTweetInteraction = (event, isActive, type) => {
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
  if (!isActive) {
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
