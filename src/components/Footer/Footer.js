import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

// css
import './Footer.css';

// utils
import svgs from '../../utils/svgs';
import FeatherButton from '../FeatherButton/FeatherButton';

// default profile pic
import DefaultProfile from '../../assets/images/default_profile.png';

// context
import {
  useUserContext,
  useViewportContext,
} from '../../contextProvider/ContextProvider';

const Footer = () => {
  const { user } = useUserContext();
  const { viewportWidth } = useViewportContext();
  const navigate = useNavigate();
  return (
    <header id="root-navbar">
      <nav>
        <div className="navbar-top-wrapper">
          <div className="navbar-logo">
            <NavLink to="/home" aria-label="home" role="link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="bird-icon">
                <path d={svgs.bird} fill="var(--clr-bg-blue)" />
              </svg>
              <div className="navbar-text" />
            </NavLink>
          </div>
          <div className="navigation-wrapper">
            <NavLink to="/home" aria-label="home" role="link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
                <path d={svgs.home} />
              </svg>
              <div className="navbar-text">Home</div>
            </NavLink>

            <NavLink to="/explore">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="explore-icon"
              >
                <path d={svgs.explore} />
              </svg>
              <div className="navbar-text">Explore</div>
            </NavLink>

            <NavLink to={user?.tag ? '/i/bookmarks' : '/i/flow/login'}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="bookmarks-icon"
              >
                <path d={svgs.bookmarks} />
              </svg>
              <div className="navbar-text">Bookmarks</div>
            </NavLink>
            <NavLink to={user?.tag ? `${user.tag}` : '/i/flow/login'}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="profile-icon"
              >
                <path d={svgs.profile} />
              </svg>
              <div className="navbar-text">Profile</div>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                if (user?.tag) {
                  navigate('/compose/tweet');
                } else {
                  navigate('/i/flow/login');
                }
              }}
              className="tweet-button"
            >
              <span>{user?.tag ? 'Tweet' : 'Sign in'}</span>
            </button>
          </div>
          {viewportWidth > 500 && <FeatherButton />}
        </div>
        {user?.tag && (
          <div className="navbar-account">
            <button
              type="button"
              className="image-wrapper"
              onClick={clickHandlerAccount}
            >
              <img
                src={user && user.profileImg ? user.profileImg : DefaultProfile}
                alt="profile"
                className="u-round"
              />
              <div className="account-details">
                <span className="name">{user.name}</span>
                <span className="tag">@{user.tag}</span>
              </div>
            </button>
            <div id="navbar-account-options">
              <Link to="/logout">Log out @{user.tag}</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Footer;

const clickHandlerAccount = () => {
  const navAccOpts = document.getElementById('navbar-account-options');
  // eslint-disable-next-line no-unused-expressions
  navAccOpts.classList.contains('active')
    ? navAccOpts.classList.remove('active')
    : navAccOpts.classList.add('active');
};
