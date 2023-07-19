import React from 'react';

// css
import './Profile.css';

// components
import ProfileContent from '../../components/profileComponents/ProfileContent/ProfileContent';
import ProfileHeader from '../../components/profileComponents/ProfileHeader/ProfileHeader';

const Profile = () => (
  <div id="profile-page">
    <ProfileHeader />
    <ProfileContent />
  </div>
);

export default Profile;
