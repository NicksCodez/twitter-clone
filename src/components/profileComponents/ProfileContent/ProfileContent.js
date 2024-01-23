import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// firestore
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../../firebase';

// css
import './ProfileContent.css';

// components
import TweetContainer from '../../TweetContainer/TweetContainer';

// utils
import svgs from '../../../utils/svgs';
import {
  chunkArray,
  getInteractionsData,
  getUserData,
} from '../../../utils/functions';

// images
import DefaultProfile from '../../../assets/images/default_profile.png';

const ProfileContent = ({ profileVisited, isOwnProfile, isFollowed, tag }) => {
  const [tweets, setTweets] = useState(null);
  const [tweetsLoading, setTweetsLoading] = useState(true);

  // function to get tweets made by profileVisited user according to category
  const getTweets = async (category) => {
    setTweetsLoading(true);

    const tweetsCollectionRef = collection(firestore, 'tweets');

    let queryRef;
    switch (category) {
      case 'tweets':
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        break;
      case 'replies':
        queryRef = query(
          tweetsCollectionRef,
          where('type', '==', 'reply'),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        break;
      case 'media':
        queryRef = query(
          tweetsCollectionRef,
          where('userId', '==', profileVisited.uid),
          where('imageLink', '!=', ''),
          limit(200)
        );
        break;
      default:
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          where('userId', '==', profileVisited.uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
    }
  };

  const getLikes = async () => {
    // set loading to true
    setTweetsLoading(true);

    // get liked tweets ids
    const tweetInteractionsCollection = collection(
      firestore,
      'tweetInteractions'
    );
    const likesQuery = query(
      tweetInteractionsCollection,
      where('userId', '==', profileVisited.uid),
      where('type', '==', 'like'),
      orderBy('createdAt', 'desc')
    );
    const likesSnapshot = await getDocs(likesQuery);
    const likedTweets =
      likesSnapshot.docs.map((doc) => doc.data().tweetId) || [];
    // prepare query for tweets
    const tweetsCollectionRef = collection(firestore, 'tweets');

    // chunk array into multiple arrays with max length of 30 (firestore limitation)
    const chunks = chunkArray(likedTweets, 30);

    // array to store tweets
    let fetchedLikedTweets = [];

    // get data for chunk of tweets separately
    const promises = chunks.map(async (chunk) => {
      // looking for specific tweet IDs, so no need for separate queries depending on "isForYouSelected"
      const queryRef = query(
        tweetsCollectionRef,
        where('tweetId', 'in', chunk),
        orderBy('createdAt', 'desc')
      );
      // create listener for tweets and set tweets
      try {
        // get tweet data for chunk
        const querySnapshot = await getDocs(queryRef);
        const fetchedTweets = await Promise.all(
          querySnapshot.docs.map(async (document) => {
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

            const interactionsData = await getInteractionsData(
              tweetData.tweetId
            );

            return {
              key: document.id,
              docRef: tweetDocRef,
              ...tweetData,
              ...interactionsData,
              userName: profileVisited.name,
              userProfilePicture: profileVisited.profileImg,
              userTag: profileVisited.tag,
              reposterData,
              repostTime,
              originalTweetId,
            };
          })
        );

        fetchedLikedTweets = fetchedLikedTweets.concat(fetchedTweets);
      } catch (error) {
        // ! implement error handling
        console.log('error => ', { error });
      }
    });

    // wait for all promises to be resolved to assure isLoading set to false only after all tweets loaded
    await Promise.all(promises);
    setTweets(fetchedLikedTweets);
    // set loading to false
    setTweetsLoading(false);
  };

  useEffect(() => {
    if (profileVisited) {
      getTweets('tweets');
    }
  }, []);

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
        {profileVisited && (
          <div>
            <div className="button-wrapper">
              {!isOwnProfile && (
                <button type="button" className="u-round">
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
          {profileVisited && (
            <img
              src={profileVisited.profileImg}
              alt="profile"
              className="u-round"
            />
          )}
        </div>
      </div>
      <div className="wrapper-padded">
        <div>
          <div id="profile-page-name">
            {profileVisited ? profileVisited.name : `@${tag}`}
          </div>
          <div id="profile-page-tag">
            {profileVisited && `@${profileVisited.tag}`}
          </div>
        </div>
        {profileVisited ? (
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
              <Link to="/profile/following">
                <div className="primary">
                  <span>{profileVisited.following.length}</span>
                </div>
                <div className="secondary">
                  <span>Following</span>
                </div>
              </Link>
              <Link to="/profile/followers">
                <div className="primary">
                  <span>{profileVisited.followers.length}</span>
                </div>
                <div className="secondary">
                  <span>Followers</span>
                </div>
              </Link>
            </div>
            {!isOwnProfile && (
              <div id="profile-page-common-followers">
                <div>
                  <img src={DefaultProfile} alt="profile" className="u-round" />
                  <img src={DefaultProfile} alt="profile" className="u-round" />
                  <img src={DefaultProfile} alt="profile" className="u-round" />
                </div>
                <div>
                  <span>
                    Followed by this dude, this dude and 24 others you follow
                  </span>
                </div>
              </div>
            )}
            <div id="profile-page-tweet-filters">
              <div className="button-wrapper">
                <button
                  type="button"
                  className="active"
                  onClick={(event) => {
                    buttonClickHandler(event);
                    getTweets('tweets');
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
                    getTweets('replies');
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
                    getTweets('media');
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
                    getLikes();
                  }}
                >
                  <span>Likes</span>
                  <div className="underline u-round" />
                </button>
              </div>
            </div>
            <TweetContainer tweets={tweets} isLoading={tweetsLoading} />
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

export default ProfileContent;
