import React from 'react';
import { useNavigate } from 'react-router-dom';

// css
import './Profile.css';

// components
import ProfileContent from '../../components/profileComponents/ProfileContent/ProfileContent';
import PageHeader from '../../components/PageHeader/PageHeader';

// utils
import svgs from '../../utils/svgs';

const Profile = () => {
  const navigate = useNavigate();
  // build left element
  const leftElement = (
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
  );

  // build middle element
  const middleElement = (
    <div className="wrapper-col">
      <span>Profile name</span>
      <span>2,509 Tweets</span>
    </div>
  );

  // right element
  const rightElement = <div className="minW" />;

  return (
    <div id="profile-page">
      <div id="profile-page-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      <ProfileContent />
    </div>
  );
};

export default Profile;
