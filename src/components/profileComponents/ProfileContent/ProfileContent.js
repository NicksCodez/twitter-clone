import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div id="profile-page-content">
      <div id="profile-page-header-image">
        {/* <img src='*' alt='profile header' /> */}
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
              {isOwnProfile && (
                <button type="button" className="u-round">
                  <span>Set up profile</span>
                </button>
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
                <button type="button" className="active">
                  <span>Tweets</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button type="button">
                  <span>Replies</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button type="button">
                  <span>Media</span>
                  <div className="underline u-round" />
                </button>
              </div>
              <div className="button-wrapper">
                <button type="button">
                  <span>Likes</span>
                  <div className="underline u-round" />
                </button>
              </div>
            </div>
            <TweetContainer />
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
