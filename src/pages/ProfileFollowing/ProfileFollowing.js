import React, { useEffect, useRef, useState } from 'react';
import { redirect, useNavigate, useParams } from 'react-router-dom';

// firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

// context
import { useUserContext } from '../../contextProvider/ContextProvider';

// components
import UserCard from '../../components/UserCard/UserCard';
import PageHeader from '../../components/PageHeader/PageHeader';

// utils
import svgs from '../../utils/svgs';

// css
import './ProfileFollowing.css';
import ScrollableElementsLoader from '../../components/ScrollableElementsLoader/ScrollableElementsLoader';
import ProfileFollowingNavBar from '../../components/ProfileFollowingNavBar/ProfileFollowingNavBar';

const ProfileFollowing = () => {
  // navigator
  const navigate = useNavigate();
  // user context
  const { user } = useUserContext();
  // link params
  const { tag, mode } = useParams();
  // state to store profileVisited document reference
  const [profileVisited, setProfileVisited] = useState(null);
  // state to store retrieved user docs
  const [retrievedUsers, setRetrievedUsers] = useState([]);
  // ref to store document reference to last retrieved user
  const lastRetrievedUser = useRef(null);
  // ref to know if last possible document in collection was retrieved
  const wasLastDocRetrieved = useRef(false);

  const [isScrollableLoading, setIsScrollableLoading] = useState(false);
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    // on component load, get the visited profile's document reference
    getProfileVisited(tag, setProfileVisited);
  }, [tag]);

  useEffect(() => {
    console.log('something changed -> ', { tag }, { mode });
    setRetrievedUsers([]);
    lastRetrievedUser.current = null;
    wasLastDocRetrieved.current = false;
    // on profileVisited change, get following or followed users' data
    getUsersData(
      user,
      profileVisited,
      mode,
      lastRetrievedUser,
      setRetrievedUsers,
      wasLastDocRetrieved
    );
  }, [profileVisited, mode]);

  useEffect(() => {
    console.log({ retrievedUsers });
  }, [retrievedUsers]);

  // function to handleIntersection
  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !wasLastDocRetrieved.current) {
      console.log(
        'handling intersection ',
        wasLastDocRetrieved.current,
        lastRetrievedUser.current.id
      );
      getUsersData(
        user,
        profileVisited,
        mode,
        lastRetrievedUser,
        setRetrievedUsers,
        wasLastDocRetrieved
      );
    }
  };

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
      {profileVisited && <span>@{profileVisited.tag}</span>}
    </div>
  );

  // right element
  const rightElement = <div className="minW" />;

  return (
    <div className="profile-following">
      <div className="profile-following-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      <ProfileFollowingNavBar tag={tag} mode={mode} />
      {retrievedUsers && (
        <div className="wrapper">
          <ScrollableElementsLoader
            elements={retrievedUsers}
            elementsLoader={() => null}
            setElements={() => null}
            loadElements={() => null}
            attachListenersToElements={() => null}
            setLoadedSignal={setIsScrollableLoading}
            intersectionHandler={handleIntersection}
            ElementComponent={UserCard}
            setLastRetrievedElement={(val) => {
              lastRetrievedUser.current = val;
            }}
            seenLastElement={wasLastDocRetrieved.current}
            setSeenLastElement={(val) => {
              wasLastDocRetrieved.current = val;
            }}
            pushUnsubscriber={(val) => unsubscribersRef.current.push(val)}
            noQuery
          />
        </div>
      )}
    </div>
  );
};

export default ProfileFollowing;

// function to get visited profile document's reference
const getProfileVisited = async (tag, setProfileVisited) => {
  // get the visited profile's ref
  const usersCollection = collection(firestore, 'users');
  const userQuery = query(
    usersCollection,
    where('tagLowerCase', '==', tag.toLowerCase())
  );
  const userSnapshot = await getDocs(userQuery);
  if (!userSnapshot.empty) {
    setProfileVisited({
      ref: userSnapshot.docs[0].ref,
      id: userSnapshot.docs[0].id,
      name: userSnapshot.docs[0].data().name,
      tag: userSnapshot.docs[0].data().tag,
    });
  } else {
    // ! navigate to an error or not found page
    console.error("couldn't find user", { tag });
  }
};

// function to get followed or following users
const getUsersData = async (
  user,
  profileVisited,
  mode,
  lastRetrievedUser,
  setRetrievedUsers,
  wasLastDocRetrieved
) => {
  console.log('getting users data for -> ', { profileVisited }, { mode });
  // get followed or following users' data
  if (profileVisited !== null && !wasLastDocRetrieved.current) {
    // create collection reference
    let collectionRef;
    if (mode === 'following') {
      collectionRef = collection(profileVisited.ref, 'following');
    } else if (mode === 'followers') {
      collectionRef = collection(profileVisited.ref, 'followers');
    } else if (mode === 'followers_you_know') {
      await getCommonFollowers(
        user,
        profileVisited,
        lastRetrievedUser,
        setRetrievedUsers,
        wasLastDocRetrieved
      );
      return;
    } else {
      // ! navigate to error or not found page
      console.error('bad profile request');
    }

    // create query
    let queryRef;
    if (!lastRetrievedUser.current) {
      queryRef = query(collectionRef, orderBy('createdAt', 'desc'), limit(25));
    } else {
      queryRef = query(
        collectionRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastRetrievedUser.current),
        limit(25)
      );
    }

    // get docs
    const usersSnapshot = await getDocs(queryRef);

    // if snapshot isn't empty, set state docs and lastRetrieved doc ref
    if (!usersSnapshot.empty) {
      const usersDataPromises = usersSnapshot.docs.map(async (document) => {
        // usersSnapshot document ids are references to user documents
        // ned to get the data from those user documents
        const documentRef = doc(firestore, `users/${document.id}`);
        const documentSnapshot = await getDoc(documentRef);

        // let isFollowed = false;
        // // check if logged in user follows account
        // if (auth.currentUser && user.following?.includes(document.id)) {
        //   isFollowed = true;
        // }

        // return only needed data
        const data = documentSnapshot.data();
        const returnData = {
          bio: data.bio,
          name: data.name,
          tag: data.tag,
          profileImg: data.profileImg,
          // isFollowed,
          key: document.id,
          profileDocId: document.id,
        };

        return returnData;
      });
      const usersData = await Promise.all(usersDataPromises);
      // set state docs
      console.log('data retrieved -> ', { usersData });
      setRetrievedUsers((prevUsers) => {
        const newUsers = usersData.filter(
          (userData) =>
            !prevUsers.some((prevUser) => prevUser.key === userData.key)
        );
        return [...prevUsers, ...newUsers];
      });

      // set last retrieved doc
      lastRetrievedUser.current =
        usersSnapshot.docs[usersSnapshot.docs.length - 1];

      // if querySnapshot length is smaller than limit size, then retrieved last doc
      if (usersSnapshot.docs.length < 25) {
        wasLastDocRetrieved.current = true;
      }
    } else {
      // snapshot empty, so set wasLastDocRetrieved
      wasLastDocRetrieved.current = true;
    }
  }
};

export const getCommonFollowers = async (
  user,
  profileVisited,
  lastRetrievedUser,
  setRetrievedUsers,
  wasLastDocRetrieved
) => {
  console.log('ia sa videm => ', { user }, { profileVisited });
  if (user.tag) {
    // get profileVisited followers which user is following
    const collectionRef = collection(profileVisited.ref, 'followers');
    const queryRef = query(collectionRef, orderBy('createdAt', 'desc'));

    const followersSnpashot = await getDocs(queryRef);
    console.log({ followersSnpashot });

    const followersUserFollowsPromises = followersSnpashot.docs.map(
      async (document) => {
        console.log(document.id, { document });
        if (user.following.includes(document.id)) {
          console.log('includes');
          // usersSnapshot document ids are references to user documents
          // ned to get the data from those user documents
          const documentRef = doc(firestore, `users/${document.id}`);
          const documentSnapshot = await getDoc(documentRef);

          // return only needed data
          const data = documentSnapshot.data();
          const returnData = {
            bio: data.bio,
            name: data.name,
            tag: data.tag,
            profileImg: data.profileImg,
            key: document.id,
            profileDocId: document.id,
          };

          return returnData;
        }
        return {};
      }
    );

    const followersUserFollows = await Promise.all(
      followersUserFollowsPromises
    );
    const filteredFollowersUserFollows = followersUserFollows.filter(
      (value) => value.tag
    );
    console.log({ filteredFollowersUserFollows });
    setRetrievedUsers((prevUsers) => {
      const newUsers = filteredFollowersUserFollows.filter(
        (userData) =>
          !prevUsers.some((prevUser) => prevUser.key === userData.key)
      );
      return [...prevUsers, ...newUsers];
    });

    // set last retrieved doc
    lastRetrievedUser.current =
      followersSnpashot.docs[followersSnpashot.docs.length - 1];

    wasLastDocRetrieved.current = true;
  } else {
    redirect('/i/flow/login');
  }
};
