import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Tweet.css';

// firebase
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// utils
import svgs from '../../utils/svgs';

// context providers
import { useAppContext } from '../../contextProvider/ContextProvider';

const Tweet = ({
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
}) => {
  const { user } = useAppContext();

  const likeHandler = async (event) => {
    // on like, update tweet and user documents if user is logged in and didn't already like respective tweet
    if (user.uid) {
      // get reference to tweet document
      const tweetsCollectionRef = collection(firestore, 'tweets');
      const tweetsQueryRef = query(
        tweetsCollectionRef,
        where('tweetId', '==', idProp)
      );

      const tweetsQuerySnapshot = await getDocs(tweetsQueryRef);

      // save old tweet data in case of updating error
      console.log('tweet data => ', tweetsQuerySnapshot.docs[0].data());
      const oldTweetsData = tweetsQuerySnapshot.docs[0].data();
      console.log({ oldTweetsData });

      // get reference to user document
      const usersCollectionRef = collection(firestore, 'users');
      const userQueryRef = query(
        usersCollectionRef,
        where('uid', '==', user.uid)
      );

      const userQuerySnapshot = await getDocs(userQueryRef);

      // save old user data in case of updating error
      const oldUserData = userQuerySnapshot.docs[0].data();

      // if user didn't already like tweet, like it
      if (!user.likedTweets || !user.likedTweets.includes(idProp)) {
        // construct data object used to update tweet document
        const newTweetsData = {
          likesCount: (oldTweetsData.likesCount || 0) + 1,
          likedBy: [...(oldTweetsData.likedBy || []), user.uid],
        };
        console.log({ newTweetsData });

        // construct data object used to update user document
        const newUserData = {
          likedTweets: [...(oldUserData.likedTweets || []), idProp],
        };

        // update both user and tweet document at once to be able to catch errors
        // e.g. if one document is updated but the other is not then change back to original
        const tweetUpdatePromise = updateDoc(
          tweetsQuerySnapshot.docs[0].ref,
          newTweetsData
        );
        const userUpdatePromise = updateDoc(
          userQuerySnapshot.docs[0].ref,
          newUserData
        );

        try {
          await Promise.all([tweetUpdatePromise, userUpdatePromise]);
          console.log('both transactions successful');
        } catch (error) {
          // something went wrong, return both documents to old state and display message to user
          // what if this update also fails tho??????
          console.log('error => ', { error });
          const tweetRevertPromise = updateDoc(
            tweetsQuerySnapshot.docs[0].ref,
            oldTweetsData
          );
          const userRevertPromise = updateDoc(
            userQuerySnapshot.docs[0].ref,
            oldUserData
          );
          try {
            await Promise.all([tweetRevertPromise, userRevertPromise]);
            console.log('both transactions successful');
          } catch (newError) {
            // this also failed, what do we do now chief?
            console.log('error reverting => ', { newError });
          }
        }
      } else {
        // user already liked tweet, so unlike it
        // construct data object used to update tweet document
        const newTweetsData = {
          likesCount: oldTweetsData.likesCount - 1,
          likedBy: oldTweetsData.likedBy.filter((id) => id !== user.uid),
        };
        console.log({ newTweetsData });

        // construct data object used to update user document
        const newUserData = {
          likedTweets: oldUserData.likedTweets.filter((id) => id !== idProp),
        };

        // update both user and tweet document at once to be able to catch errors
        // e.g. if one document is updated but the other is not then change back to original
        const tweetUpdatePromise = updateDoc(
          tweetsQuerySnapshot.docs[0].ref,
          newTweetsData
        );
        const userUpdatePromise = updateDoc(
          userQuerySnapshot.docs[0].ref,
          newUserData
        );

        try {
          await Promise.all([tweetUpdatePromise, userUpdatePromise]);
          console.log('both transactions successful');
        } catch (error) {
          // something went wrong, return both documents to old state and display message to user
          // what if this update also fails tho??????
          console.log('error => ', { error });
          const tweetRevertPromise = updateDoc(
            tweetsQuerySnapshot.docs[0].ref,
            oldTweetsData
          );
          const userRevertPromise = updateDoc(
            userQuerySnapshot.docs[0].ref,
            oldUserData
          );
          try {
            await Promise.all([tweetRevertPromise, userRevertPromise]);
            console.log('both transactions successful');
          } catch (newError) {
            // this also failed, what do we do now chief?
            console.log('error reverting => ', { newError });
          }
        }
      }
    }
  };

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
              <button
                type="button"
                onClick={async (event) => {
                  likeHandler(event);
                }}
              >
                {user.likedTweets && user.likedTweets.includes(idProp) ? (
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
};

export default Tweet;
