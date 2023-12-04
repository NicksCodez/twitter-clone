import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// firebase
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

// css
import './Logout.css';

// utils
import svgs from '../../utils/svgs';

const Logout = () => {
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await signOut(auth);
    navigate('/home');
  };

  return (
    <div id="logout">
      <div className="container">
        <div className="padded">
          <div className="logo">
            <svg viewBox="0 0 24 24">
              <path d={svgs.bird} />
            </svg>
          </div>
          <div className="title">Log out of Tweeter?</div>
          <div className="subtitle">
            You can always log back in at any time.
          </div>
          <div className="btn inverse-background">
            <button type="button" onClick={async () => logoutHandler()}>
              <span>Log out</span>
            </button>
          </div>
          <div className="btn">
            <Link to="/home">
              <span>Cancel</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
