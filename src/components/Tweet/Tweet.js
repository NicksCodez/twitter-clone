import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Tweet.css';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

// utils
import svgs from '../../utils/svgs';

const Tweet = () => (
  <div className="tweet">
    <div className="tweet-wrapper" onClick={console.log('')}>
      <div className="tweet-profile-picture">
        <div className="profile-picture-wrapper u-round">
          <Link to="/profile">
            <img src={DefaultProfile} alt="profile" />
          </Link>
        </div>
      </div>
      <div className="tweet-content">
        <div className="tweet-row">
          <div className="profile-details">
            <div className="profile-name">
              <span>Anon</span>
            </div>
            <div className="profile-tag">
              <span>@Anon</span>
            </div>
            <div className="separator">
              <span>·</span>
            </div>
            <div className="date-posted">
              <span>2h</span>
            </div>
          </div>
          <button type="button">
            <svg viewBox="0 0 24 24">
              <path d={svgs.moreNoOutline} />
            </svg>
          </button>
        </div>
        <div className="tweet-row">
          <div className="tweet-text">
            <span>I am hereby tweeting</span>
          </div>
        </div>
        <div className="tweet-row tweet-actions">
          <div className="tweet-action">
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.comment} />
              </svg>
              <span>1,622</span>
            </button>
          </div>
          <div className="tweet-action">
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.retweet} />
              </svg>
              <span>3,055</span>
            </button>
          </div>
          <div className="tweet-action">
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.like} />
              </svg>
              <span>29.5k</span>
            </button>
          </div>
          <div className="tweet-action">
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.statistics} />
              </svg>
              <span>1M</span>
            </button>
          </div>
          <div className="tweet-action">
            <button type="button">
              <svg viewBox="0 0 24 24">
                <path d={svgs.share} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Tweet;
