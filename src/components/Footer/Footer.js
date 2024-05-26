import React from 'react';
import { Link, NavLink } from 'react-router-dom';

// css
import './Footer.css';

// utils
import svgs from '../../utils/svgs';
import FeatherButton from '../FeatherButton/FeatherButton';

// default profile pic
import DefaultProfile from '../../assets/images/default_profile.png';

// context
import { useUserContext } from '../../contextProvider/ContextProvider';

const Footer = () => {
  const { user } = useUserContext();
  return (
    <header id="root-navbar">
      <nav>
        <div className="navbar-top-wrapper">
          <div className="navbar-logo">
            <NavLink to="/home" aria-label="home" role="link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="bird-icon">
                <path d={svgs.bird} fill="var(--clr-bg-blue)" />
              </svg>
            </NavLink>
          </div>
          <div className="navigation-wrapper">
            <NavLink to="/home" aria-label="home" role="link">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
                <path d={svgs.home} />
              </svg>
            </NavLink>
            <NavLink to="/explore">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="explore-icon"
              >
                <path d={svgs.explore} />
              </svg>
            </NavLink>
            <NavLink to="/notifications">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="notifications-icon"
              >
                <path d={svgs.notifications} />
              </svg>
            </NavLink>
            <NavLink to="/messages">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="messages-icon"
              >
                <path d={svgs.messages} />
              </svg>
            </NavLink>
          </div>
          <FeatherButton />
        </div>
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
          </button>
          <div id="navbar-account-options">
            <Link to="/logout">Log out @{user.tag}</Link>
          </div>
        </div>
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
