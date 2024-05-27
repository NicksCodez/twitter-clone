import React from 'react';
import { Link } from 'react-router-dom';

// css
import './FeatherButton.css';

// firebase
import { auth } from '../../firebase';

// utils
import svgs from '../../utils/svgs';

const FeatherButton = () => (
  <div className="u-round" id="feather-button">
    <Link to={auth?.currentUser ? '/compose/tweet' : '/i/flow/login'}>
      <svg viewBox={auth?.currentUser ? '0 0 24 24' : '0 -960 960 960'}>
        <path d={auth?.currentUser ? svgs.tweetFeather : svgs.login} />
      </svg>
    </Link>
  </div>
);

export default FeatherButton;
