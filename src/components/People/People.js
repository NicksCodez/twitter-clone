/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';

// css
import './People.css';

// firestore
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, firestore } from '../../firebase';

// context
import { useUserContext } from '../../contextProvider/ContextProvider';
import UserCard from '../UserCard/UserCard';

const People = () => {
  const [recommendedAccounts, setRecommendedAccounts] = useState([]);
  const [areRecAccLoading, setAreRecAccLoading] = useState(true);

  // ref to know if rec accs were loaded for user
  const gotRecsForUser = useRef(auth.currentUser);

  const { user } = useUserContext();

  useEffect(() => {
    loadRecAccs(setRecommendedAccounts, setAreRecAccLoading, user.following);
  }, [gotRecsForUser.current]);

  useEffect(() => {
    gotRecsForUser.current = user.tag;
  }, [user]);

  return (
    <div id="people">
      <h2>
        <span>Who to follow</span>
      </h2>
      {areRecAccLoading ? (
        <span>Loading</span>
      ) : recommendedAccounts.length > 0 ? (
        recommendedAccounts.map((element) => (
          <UserCard element={element} key={element.profileDocId} />
        ))
      ) : (
        <span>Nothing to recommend</span>
      )}
    </div>
  );
};

const loadRecAccs = async (
  setRecAccs,
  setAreRecAccsLoading,
  currentlyFollowing
) => {
  // function to load recommended acounts
  //! function is not optimal, gets all user accounts which would be awful in an app with lots of users
  //! function also lacks a good algorithm to select which accounts to follow, just shows 3 random ones
  //! accounts selection should probably be done on the backend and only selected accounts data served to client

  // get all users which are not logged user
  const usersColl = collection(firestore, 'users');
  const usersQuery = query(
    usersColl,
    where('uid', '!=', auth.currentUser?.uid || '')
  );
  const usersSnapshot = await getDocs(usersQuery);

  // array to store selected users
  const recUsers = [];

  if (!usersSnapshot.empty) {
    // found user docs

    if (usersSnapshot.docs.length <= 3) {
      // maximum of 3 users, set rec accounts
      usersSnapshot.docs.forEach((document) => {
        recUsers.push({
          profileDocId: document.id,
          tag: document.data().tag,
          name: document.data().name,
          biot: document.data().bio,
          profileImg: document.data().profileImg,
        });
      });
    } else {
      // store documents already added to recUsers by id
      const addedDocs = [];

      // variable to store unfollowed user docs
      let unfollowedUsers;

      if (currentlyFollowing && currentlyFollowing.length > 0) {
        // user is logged in and followes some users so select only accounts which are not already followed
        // user logged in and follows some accounts, only select accounts which user does not follow already
        unfollowedUsers = usersSnapshot.docs.filter(
          (document) => !currentlyFollowing.includes(document.id)
        );
      } else {
        // user is not logged in or does not follow anybody
        unfollowedUsers = usersSnapshot.docs;
      }

      if (unfollowedUsers.length < 4) {
        unfollowedUsers.forEach((document) => {
          recUsers.push({
            profileDocId: document.id,
            tag: document.data().tag,
            name: document.data().name,
            biot: document.data().bio,
            profileImg: document.data().profileImg,
          });
        });
      } else {
        while (recUsers.length < 3) {
          // select a random doc, check that it wasn't already selected and add its data to recUsers
          const selectedDoc = Math.floor(
            Math.random() * (unfollowedUsers.length - 1)
          );
          if (!addedDocs.includes(selectedDoc)) {
            addedDocs.push(selectedDoc);
            const document = unfollowedUsers[selectedDoc];
            recUsers.push({
              profileDocId: document.id,
              tag: document.data().tag,
              name: document.data().name,
              biot: document.data().bio,
              profileImg: document.data().profileImg,
            });
          }
        }
      }
    }
  }

  // no user docs found
  setRecAccs(recUsers);
  setAreRecAccsLoading(false);
};
export default People;
