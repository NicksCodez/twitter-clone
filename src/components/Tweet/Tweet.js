import React, { useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// css
import './Tweet.css';

// firebase
import {
  collection,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// utils
import svgs from '../../utils/svgs';

// context providers
// import { useAppContext } from '../../contextProvider/ContextProvider';
import { useUserContext } from '../../contextProvider/ContextProvider';

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
  }) => {
    // const { user } = useAppContext();
    const { user } = useUserContext();
    const navigate = useNavigate();
    // if (idProp === 199) {
    //   console.log(
    //     { profileImg },
    //     { name },
    //     { tag },
    //     { createdAt },
    //     { text },
    //     { replies },
    //     { retweets },
    //     { likes },
    //     { bookmarks },
    //     { idProp },
    //     { tweetImg }
    //   );
    // }

    // Log when the props or user change
    // useEffect(() => {
    //   console.log(
    //     'props changed:',
    //     { profileImg },
    //     { name },
    //     { tag },
    //     { createdAt },
    //     { text },
    //     { replies },
    //     { retweets },
    //     { likes },
    //     { bookmarks },
    //     { idProp },
    //     { tweetImg }
    //   );
    // }, [
    //   profileImg,
    //   name,
    //   tag,
    //   createdAt,
    //   text,
    //   replies,
    //   retweets,
    //   likes,
    //   bookmarks,
    //   idProp,
    //   tweetImg,
    // ]);
    // useEffect(() => {
    //   console.log('user changed:', { user });
    // }, [user]);

    const memoizedLikeHandler = useCallback(
      async () => likeHandler(user, idProp, navigate),
      [user, idProp, navigate]
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
                  {/* {user.likedTweets && user.likedTweets.includes(idProp) ? (
                  <svg viewBox="0 0 24 24" className="active">
                    <path d={svgs.likeActive} />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.like} />
                  </svg>
                )} */}
                  <svg viewBox="0 0 24 24">
                    <path d={svgs.like} />
                  </svg>
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

const likeHandler = async (user, idProp, navigate) => {
  // on like, update tweet and user documents if user is logged in and didn't already like respective tweet
  if (user.uid) {
    // get reference to tweet document
    const tweetsCollectionRef = collection(firestore, 'tweets');
    const tweetsQueryRef = query(
      tweetsCollectionRef,
      where('tweetId', '==', idProp)
    );

    const tweetsQuerySnapshot = await getDocs(tweetsQueryRef);

    // get reference to user document
    const usersCollectionRef = collection(firestore, 'users');
    const userQueryRef = query(
      usersCollectionRef,
      where('uid', '==', user.uid)
    );

    const userQuerySnapshot = await getDocs(userQueryRef);

    // ! quick consecutive clicks on like might lead to errors
    // ! e.g. user.liked tweets context updates too slowly, so tweet is liked or unlicked multiple times
    // ! should use likedTweets from database to ensure consistent behaviour
    if (!user.likedTweets || !user.likedTweets.includes(idProp)) {
      // if user didn't already like tweet, like it

      try {
        await runTransaction(firestore, async (transaction) => {
          // update user document
          transaction.update(userQuerySnapshot.docs[0].ref, {
            likedTweets: [
              ...(userQuerySnapshot.docs[0].data().likedTweets || []),
              idProp,
            ],
          });

          // update tweet document
          transaction.update(tweetsQuerySnapshot.docs[0].ref, {
            likesCount: tweetsQuerySnapshot.docs[0].data().likesCount + 1,
          });
        });
        console.log('transaction successful');
      } catch (error) {
        // something went wrong, log error for now
        console.log('error => ', { error });
      }
    } else {
      // user already liked tweet, so unlike it

      try {
        await runTransaction(firestore, async (transaction) => {
          // update user document
          transaction.update(userQuerySnapshot.docs[0].ref, {
            likedTweets: (
              userQuerySnapshot.docs[0].data().likedTweets || []
            ).filter((id) => id !== idProp),
          });

          // update tweet document
          transaction.update(tweetsQuerySnapshot.docs[0].ref, {
            likesCount: tweetsQuerySnapshot.docs[0].data().likesCount - 1,
          });
        });
        console.log('transaction successful');
      } catch (error) {
        // something went wrong, so log error for now
        console.log('error => ', { error });
      }
    }
  } else {
    console.log('before redirect');
    navigate('/i/flow/login');
  }
};

export default Tweet;
