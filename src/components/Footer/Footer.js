import React from 'react';
import { NavLink } from 'react-router-dom';

// css
import './Footer.css';

// utils
import svgs from '../../utils/svgs';

const Footer = () => (
  <header>
    <nav>
      <NavLink to="/home" aria-label="home" role="link">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d={svgs.home} />
        </svg>
      </NavLink>
      <NavLink to="/explore">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="explore-icon">
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
        <svg viewBox="0 0 24 24" aria-hidden="true" className="messages-icon">
          <path d={svgs.messages} />
        </svg>
      </NavLink>
    </nav>
  </header>
);

export default Footer;
