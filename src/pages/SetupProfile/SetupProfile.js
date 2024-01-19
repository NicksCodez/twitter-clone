/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// css
import './SetupProfile.css';

// firebase
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, firestore, storage } from '../../firebase';

// components
import PageHeader from '../../components/PageHeader/PageHeader';
import SetupProfilePicture from '../../components/setupProfileComponents/SetupProfilePicture/SetupProfilePicture';
import SetupProfileHeader from '../../components/setupProfileComponents/SetupProfileHeader/SetupProfileHeader';
import SetupProfileBio from '../../components/setupProfileComponents/setupProfileBio/SetupProfileBio';
import SetupProfileLocation from '../../components/setupProfileComponents/setupProfileLocation/SetupProfileLocation';

// context provider
// import { useAppContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';

const SetupProfile = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profilePic, setProfilePic] = useState(null);
  const [headerPic, setHeaderPic] = useState(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  let leftElement;

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/i/flow/login');
    } else {
      const setUser = async () => {
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(
          usersCollection,
          where('uid', '==', auth.currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        setUserData(userSnapshot.docs[0].data());
      };
      setUser();
    }
  }, [auth.currentUser]);

  const saveButtonClickHandler = async () => {
    // upload profile and header pictures if they exist and save their urls
    let profileURL;
    let headerURL;

    if (profilePic) {
      const profileRef = ref(storage, `users/${userData.uid}/profile`);
      await uploadBytes(profileRef, profilePic[0]);
      profileURL = await getDownloadURL(profileRef);
    }

    if (headerPic) {
      const headerRef = ref(storage, `users/${userData.uid}/header`);
      await uploadBytes(headerRef, headerPic[0]);
      headerURL = await getDownloadURL(headerRef);
    }

    // get reference to userData document
    const usersCollectionRef = collection(firestore, 'users');
    const queryRef = query(
      usersCollectionRef,
      where('uid', '==', userData.uid)
    );

    const querySnapshot = await getDocs(queryRef);

    // construct data object used to update
    // decide if profile was set up
    let setup = false;
    if (profileURL || headerURL || bio !== '' || location !== '') {
      setup = true;
    }
    const newData = {
      ...(profileURL && { profileImg: profileURL }),
      ...(headerURL && { headerImg: headerURL }),
      bio,
      location,
      setup,
    };

    // update and redirect
    await updateDoc(querySnapshot.docs[0].ref, newData);

    navigate(-1);
  };

  if (currentStep !== 0 && currentStep !== 4) {
    leftElement = (
      <button
        type="button"
        className="svg-wrapper"
        onClick={() => {
          setCurrentStep(currentStep - 1);
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d={svgs.back} />
        </svg>
      </button>
    );
  } else if (currentStep === 4) {
    leftElement = (
      <button
        type="button"
        className="svg-wrapper"
        onClick={() => {
          navigate(-1);
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d={svgs.x} />
        </svg>
      </button>
    );
  }

  // build middle element
  const middleElement = currentStep !== 4 && (
    <Link to="/home" className="svg-wrapper">
      <svg viewBox="0 0 24 24">
        <path d={svgs.bird} />
      </svg>
    </Link>
  );

  // build right element
  const rightElement = <div className="fake" />;
  return (
    <div id="setup-profile">
      <PageHeader
        leftElements={[leftElement]}
        middleElements={[middleElement]}
        rightElements={[rightElement]}
      />
      <div className="setup-padded">
        {currentStep === 0 && (
          <SetupProfilePicture
            user={userData}
            file={profilePic}
            setFile={setProfilePic}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 1 && (
          <SetupProfileHeader
            user={userData}
            profileFile={profilePic}
            file={headerPic}
            setFile={setHeaderPic}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 2 && (
          <SetupProfileBio
            text={bio}
            setText={setBio}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            initialValue="test"
          />
        )}
        {currentStep === 3 && (
          <SetupProfileLocation
            text={location}
            setText={setLocation}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 4 && (
          <div className="centered">
            <div>
              <svg viewBox="0 0 24 24">
                <path d={svgs.bird} />
              </svg>
            </div>
            <div className="details">
              <span>Click to save updates</span>
            </div>
            <div>
              <button
                type="button"
                onClick={async () => {
                  await saveButtonClickHandler();
                }}
                className="u-round"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupProfile;
