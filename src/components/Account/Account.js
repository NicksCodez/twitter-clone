import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Account.css';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

const Account = ({ showDescription = false }) => (
  <div className="account">
    <Link to="/profile" className="account-wrapper">
      <div className="account-profile-picture">
        <div className="account-profile-picture-wrapper u-round">
          <img src={DefaultProfile} alt="profile" />
        </div>
      </div>
      <div className="account-content">
        <div className="account-details-wrapper">
          <div className="account-details">
            <div className="account-name">
              <span>Anon</span>
            </div>
            <div className="account-tag">
              <span>@Anon</span>
            </div>
          </div>
          <div className="follow-button-wrapper u-round">
            <button type="button" className="follow-button ">
              <span>Follow</span>
            </button>
          </div>
        </div>

        {showDescription ? (
          <div className="account-description">
            <span>I am hereby accounting</span>
          </div>
        ) : null}
      </div>
    </Link>
  </div>
);

export default Account;
