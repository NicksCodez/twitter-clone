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
    const [actionInProgress, setActionInProgress] = useState(false);

    useEffect(
      () => {
        // only set action as complete if it fails(in like function try catch) or when changes have been propagated
        // this stops double or triple actions
        // e.g. of problem averted: if actionInProgress is set to false in likeHandler, after transaction is run, and if user clicks rapidly on like button, if one click happens in the time period between setting actionInProgress to false and Home noticing the change to isLiked and propagating it, tweet could be liked twice
        setActionInProgress(false);
      },
      [isLiked],
      [isBookmarked],
      [isRetweeted]
    );

    const memoizedLikeHandler = useCallback(
      async () =>
        likeHandler(
          idProp,
          navigate,
          isLiked,
          actionInProgress,
          setActionInProgress
        ),
      [idProp, navigate, isLiked, actionInProgress, setActionInProgress]
    );

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
              <div className="tweet-action">
                <button type="button">
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.retweet} />
                  </svg>
                  <span>{retweets}</span>
                </button>
              </div>
              <div className="tweet-action like">
                <button type="button" onClick={memoizedLikeHandler}>
                  {isLiked ? (
                    <svg viewBox="0 0 24 24" className="active">
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
              <div className="tweet-action">
                <button type="button">
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.bookmarks} />
                  </svg>
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
        where('type', '==', 'like')
      );

      const tweetInteractionsQuerySnapshot = await getDocs(
        tweetInteractionsQueryRef
      );

      if (!isLiked) {
        // if user didn't already like tweet, like it

        // * mock like to make website feel faster

        try {
          // * the real like
          await runTransaction(firestore, async (transaction) => {
            // set tweet interactions document
            const newTweetInteractionRef = doc(tweetInteractionsCollectionRef);
            const newTweetInteractionData = {
              type: 'like',
              userId: auth.currentUser.uid,
              tweetId: idProp,
              timestamp: serverTimestamp(),
            };
            await transaction.set(
              newTweetInteractionRef,
              newTweetInteractionData
            );

            // update tweet document
            await transaction.update(tweetsQuerySnapshot.docs[0].ref, {
              likesCount: tweetsQuerySnapshot.docs[0].data().likesCount + 1,
            });
          });
        } catch (error) {
          // something went wrong, log error for now
          console.log('error => ', { error });
          setActionInProgress(false);
        }
      } else {
        // user already liked tweet, so unlike it
        try {
          await runTransaction(firestore, async (transaction) => {
            // delete tweetInteraction document
            await transaction.delete(
              tweetInteractionsQuerySnapshot.docs[0].ref
            );

            // update tweet document
            await transaction.update(tweetsQuerySnapshot.docs[0].ref, {
              likesCount: tweetsQuerySnapshot.docs[0].data().likesCount - 1,
            });
          });
        } catch (error) {
          // something went wrong, so log error for now
          console.log('error => ', { error });
          setActionInProgress(false);
        }
      }
    }
  } else {
    // user isn't logged in, send him to log in
    navigate('/i/flow/login');
  }
};

export default Tweet;
