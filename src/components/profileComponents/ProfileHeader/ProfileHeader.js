import React from 'react';

// css
import './ProfileHeader.css';

// utils
import { useNavigate } from 'react-router-dom';
import svgs from '../../../utils/svgs';

const ProfileHeader = () => {
  const navigate = useNavigate();
  return (
    <div id="profile-page-header">
      <button
        type="button"
        className="minW"
        onClick={() => {
          navigate(-1);
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d={svgs.back} />
        </svg>
      </button>
      <div className="wrapper-col">
        <span>Profile name</span>
        <span>2,509 Tweets</span>
      </div>
      <div className="minW" />
    </div>
  );
};

export default ProfileHeader;
