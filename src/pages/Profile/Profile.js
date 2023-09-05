import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// firebase
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './Profile.css';

// components
import ProfileContent from '../../components/profileComponents/ProfileContent/ProfileContent';
import PageHeader from '../../components/PageHeader/PageHeader';

// context provider
import { useAppContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { tag } = useParams();
  console.log({ tag }, { user });
  const [profileVisited, setProfileVisited] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    // get profile visited data

    const getProfileVisited = async () => {
      // if profile visited is same as user, don't make useless request, use the data in context
      if (user.tagLowerCase && user.tagLowerCase === tag.toLowerCase()) {
        setProfileVisited(user);
        setIsOwnProfile(true);
        return;
      }
      // if profile visited is different, get the data if profile exists
      const usersCollectionRef = collection(firestore, 'users');
      const queryRef = query(
        usersCollectionRef,
        where('tagLowerCase', '==', tag.toLowerCase())
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        const profileVisitedDoc = querySnapshot.docs[0];
        const profileVisitedData = profileVisitedDoc.data();
        console.log(
          'in functie => ',
          { querySnapshot },
          { profileVisitedDoc },
          { profileVisitedData }
        );
        setProfileVisited(profileVisitedData);
        if (user.following && user.following.includes(profileVisitedData.uid)) {
          setIsFollowed(true);
        }
      }
    };
    getProfileVisited();
  }, [user]);

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
      {!profileVisited && <span>Profile</span>}
      {profileVisited && <span>{profileVisited.name}</span>}
      {profileVisited && <span>{profileVisited.tweetCount} Tweets</span>}
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
      <ProfileContent
        profileVisited={profileVisited}
        isOwnProfile={isOwnProfile}
        isFollowed={isFollowed}
        tag={tag}
      />
    </div>
  );
};

export default Profile;
