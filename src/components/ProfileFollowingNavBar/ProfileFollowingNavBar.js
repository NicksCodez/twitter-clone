import React from 'react';
import { Link } from 'react-router-dom';

// css
import './ProfileFollowingNavBar.css';

const ProfileFollowingNavBar = ({ tag, mode }) => (
  <div className="profile-following-navbar">
    <div
      className={`${
        mode === 'followers_you_know' ? 'active' : ''
      } button-wrapper`}
    >
      <Link to={`/${tag}/followers_you_know`}>
        <div>
          <span>Followers you know</span>
          <div className="blue-underscore u-round" />
        </div>
      </Link>
    </div>
    <div className={`${mode === 'followers' ? 'active' : ''} button-wrapper`}>
      <Link to={`/${tag}/followers`}>
        <div>
          <span>Followers</span>
          <div className="blue-underscore u-round" />
        </div>
      </Link>
    </div>
    <div className={`${mode === 'following' ? 'active' : ''} button-wrapper`}>
      <Link to={`/${tag}/following`}>
        <div>
          <span>Following</span>
          <div className="blue-underscore u-round" />
        </div>
      </Link>
    </div>
  </div>
);

export default ProfileFollowingNavBar;
