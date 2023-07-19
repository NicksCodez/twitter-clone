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

const ProfileContent = () => (
  <div id="profile-page-content">
    <div id="profile-page-header-image">
      <Link to="/profile/header-image">
        {/* <img src='*' alt='profile header' /> */}
      </Link>
    </div>

    <div id="profile-page-buttons">
      <div className="button-wrapper ">
        <button type="button" className="u-round svg-wrapper">
          <svg viewBox="0 0 24 24">
            <path d={svgs.moreNoOutline} />
          </svg>
        </button>
      </div>
      <div className="button-wrapper">
        <button type="button" className="u-round svg-wrapper">
          <svg viewBox="0 0 24 24">
            <path d={svgs.notificationsPlus} />
          </svg>
        </button>
      </div>
      <div className="button-wrapper">
        <button type="button" className="u-round">
          <span>Following</span>
        </button>
      </div>
      <div className="button-wrapper">
        <button type="button" className="u-round hidden">
          <span>Set up profile</span>
        </button>
      </div>
      <div className="profile-picture-wrapper u-round">
        <Link to="/profile/photo">
          <img src={DefaultProfile} alt="profile" className="u-round" />
        </Link>
      </div>
    </div>
    <div className="wrapper-padded">
      <div>
        <div id="profile-page-name">Name</div>
        <div id="profile-page-tag">Tag</div>
      </div>
      <div id="profile-page-description">
        Describing stuff about myself here totally cool and interesting
      </div>
      <div id="profile-page-links">
        <div>
          <svg viewBox="0 0 24 24">
            <path d={svgs.location} />
          </svg>
          <span>Some very interesting details</span>
        </div>
        <div>
          <svg viewBox="0 0 24 24">
            <path d={svgs.link} />
          </svg>
          <Link to="https://www.google.com">Some very interesting details</Link>
        </div>
        <div>
          <svg viewBox="0 0 24 24">
            <path d={svgs.calendar} />
          </svg>
          <span>Some very interesting details</span>
        </div>
      </div>
      <div id="profile-page-follower-details">
        <Link to="/profile/following">
          <div className="primary">
            <span>771</span>
          </div>
          <div className="secondary">
            <span>Following</span>
          </div>
        </Link>
        <Link to="/profile/followers">
          <div className="primary">
            <span>2M</span>
          </div>
          <div className="secondary">
            <span>Followers</span>
          </div>
        </Link>
      </div>
      <div id="profile-page-common-followers">
        <div>
          <img src={DefaultProfile} alt="profile" className="u-round" />
          <img src={DefaultProfile} alt="profile" className="u-round" />
          <img src={DefaultProfile} alt="profile" className="u-round" />
        </div>
        <div>
          <span>Followed by this dude, this dude and 24 others you follow</span>
        </div>
      </div>
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
  </div>
);

export default ProfileContent;
