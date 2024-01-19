import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// css
import './EditProfile.css';

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

// utils
import svgs from '../../utils/svgs';
import PageHeader from '../../components/PageHeader/PageHeader';

// context providers
// import { useAppContext } from '../../contextProvider/ContextProvider';

// components
import BioInput from '../../components/EditProfileComponents/BioInput/BioInput';
import GeneralInput from '../../components/EditProfileComponents/BioInput/GeneralInput/GeneralInput';

const EditProfile = () => {
  // const { user } = useAppContext();

  const [header, setHeader] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // get user data on page load and set initial values
    const getUser = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(
          usersCollection,
          where('uid', '==', auth?.currentUser?.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        console.log('got user => ', userSnapshot?.docs[0]?.data());
        const userData = userSnapshot?.docs[0]?.data();
        setName(userData.name);
        setBio(userData.bio);
        setLocation(userData.location);
        setHeader(userData.headerImg);
        setProfile(userData.profileImg);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log('something went wrong => ', { error });
      }
    };
    getUser();
  }, []);

  // set states on page load
  useEffect(() => {
    console.log('name => ', { name });
  }, [name]);

  // create previews for header and profile images on change
  useEffect(() => {
    let tmp;
    // make sure image is not already URL
    if (header) {
      if (typeof header !== 'string') {
        // when image is uploaded, create object URL for it to use as preview
        tmp = URL.createObjectURL(header[0]);
        setHeaderPreview(tmp);
      } else {
        setHeaderPreview(header);
      }
    }

    return () => {
      if (tmp) {
        URL.revokeObjectURL(tmp);
      }
    };
  }, [header]);

  useEffect(() => {
    let tmp;
    // make sure image is not already URL
    if (profile) {
      if (typeof profile !== 'string') {
        // when image is uploaded, create object URL for it to use as preview
        tmp = URL.createObjectURL(profile[0]);
        setProfilePreview(tmp);
      } else {
        setProfilePreview(profile);
      }
    }

    return () => {
      if (tmp) {
        URL.revokeObjectURL(tmp);
      }
    };
  }, [profile]);

  const saveButtonClickHandler = async () => {
    // upload profile and header pictures if they exist and save their urls
    let profileURL;
    let headerURL;

    if (profile && typeof profile !== 'string') {
      const profileRef = ref(storage, `users/${auth.currentUser.uid}/profile`);
      await uploadBytes(profileRef, profile[0]);
      profileURL = await getDownloadURL(profileRef);
    }

    if (header && typeof header !== 'string') {
      const headerRef = ref(storage, `users/${auth.currentUser.uid}/header`);
      await uploadBytes(headerRef, header[0]);
      headerURL = await getDownloadURL(headerRef);
    }

    // get reference to user document
    const usersCollectionRef = collection(firestore, 'users');
    const queryRef = query(
      usersCollectionRef,
      where('uid', '==', auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(queryRef);

    // construct data object used to update
    const newData = {
      ...(profileURL && { profileImg: profileURL }),
      ...(headerURL && { headerImg: headerURL }),
      bio,
      location,
      name,
    };

    // update and redirect
    await updateDoc(querySnapshot.docs[0].ref, newData);

    navigate(-1);
  };

  const leftElement = (
    <div>
      <button type="button" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24">
          <path d={svgs.back} />
        </svg>
      </button>
    </div>
  );

  const middleElement = (
    <div>
      <span>Edit profile</span>
    </div>
  );

  const rightElement = (
    <div>
      <button type="button" onClick={async () => saveButtonClickHandler()}>
        <span>Save</span>
      </button>
    </div>
  );
  return (
    !loading && (
      <div id="edit-profile">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
        <div id="edit-profile-header-image">
          <img src={headerPreview} alt="profile header" />
          <label htmlFor="edit-profile-header-upload">
            <input
              id="edit-profile-header-upload"
              name="image-upload"
              type="file"
              accept="image/jpg, image/jpeg, image/png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setHeader(e.target.files);
                }
              }}
            />
            <svg viewBox="0 0 24 24" className="u-round">
              <path d={svgs.camera} />
            </svg>
          </label>
        </div>

        <div id="edit-profile-picture">
          <div className="profile-picture-wrapper u-round">
            {auth.currentUser && (
              <img src={profilePreview} alt="profile" className="u-round" />
            )}
            <label htmlFor="edit-profile-image-upload">
              <input
                id="edit-profile-image-upload"
                name="image-upload"
                type="file"
                accept="image/jpg, image/jpeg, image/png"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setProfile(e.target.files);
                  }
                }}
              />
              <svg viewBox="0 0 24 24" className="u-round">
                <path d={svgs.camera} />
              </svg>
            </label>
          </div>
        </div>
        <div id="edit-profile-text-inputs">
          {auth.currentUser && (
            <GeneralInput
              placeholder="Name"
              maxChars={50}
              text={name || ''}
              setText={setName}
            />
          )}

          <BioInput text={bio || ''} setText={setBio} />
          <GeneralInput
            placeholder="Location"
            maxChars={30}
            text={location || ''}
            setText={setLocation}
          />
        </div>
      </div>
    )
  );
};

export default EditProfile;
