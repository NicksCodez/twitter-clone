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

// images
import DefaultProfile from '../../../assets/images/default_profile.png';

const ProfileContent = ({ profileVisited, isOwnProfile, isFollowed, tag }) => {
  console.log({ profileVisited }, { isFollowed }, { isOwnProfile });
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
          where('userId', '==', profileVisited.tag),
          orderBy('tweetId', 'desc'),
          limit(200)
        );
        break;
      case 'replies':
        queryRef = query(
          tweetsCollectionRef,
          where('type', '==', 'reply'),
          where('userId', '==', profileVisited.tag),
          orderBy('tweetId', 'desc'),
          limit(200)
        );
        break;
      case 'media':
        queryRef = query(
          tweetsCollectionRef,
          where('userId', '==', profileVisited.tag),
          orderBy('imageLink'),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        break;
      case 'likes':
        queryRef = query(
          tweetsCollectionRef,
          where('tweetId', 'in', profileVisited.likes || [-1]),
          where('userId', '==', profileVisited.tag),
          orderBy('tweetId', 'desc'),
          limit(200)
        );
        break;
      default:
        queryRef = query(
          tweetsCollectionRef,
          where('type', 'in', ['tweet', 'retweet']),
          where('userId', '==', profileVisited.tag),
          orderBy('tweetId', 'desc'),
          limit(200)
        );
    }
    try {
      const querySnapshot = await getDocs(queryRef);
      console.log('documente => ', querySnapshot.docs);

      const fetchedTweets = await Promise.all(
        querySnapshot.docs.map(async (document) => {
          const tweetData = document.data();

          return {
            tweetId: document.id,
            ...tweetData,
            userName: profileVisited.name,
            userProfilePicture: profileVisited.profileImg,
          };
        })
      );
      setTweets(fetchedTweets);
      setTweetsLoading(false);
    } catch (error) {
      console.error('Error fetching homeTweets:', error);
    }
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
        <img src={profileVisited.headerImg} alt="profile header" />
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
                    getTweets('likes');
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
