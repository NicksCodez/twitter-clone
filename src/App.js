// react
import React, { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';

// layouts
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import RootLayout from './layouts/RootLayout/RootLayout';

// firebase
import { auth, firestore } from './firebase';

// pages, actions and loaders
import NotFound from './pages/NotFound/NotFound';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import ComposeTweet from './pages/ComposeTweet/ComposeTweet';
import Profile from './pages/Profile/Profile';
import Login, { loginFormAction } from './pages/Login/Login';
import SignUp, { signUpFormAction } from './pages/SignUp/SignUp';
import SetupProfile from './pages/SetupProfile/SetupProfile';
import EditProfile from './pages/EditProfile/EditProfile';
import Logout from './pages/Logout/Logout';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import ProfileFollowing from './pages/ProfileFollowing/ProfileFollowing';
import Trends from './pages/Trends/Trends';
import TweetPage from './pages/TweetPage/TweetPage';

// context providers
// import { useAppContext } from './contextProvider/ContextProvider';
import {
  useUserContext,
  useViewportContext,
} from './contextProvider/ContextProvider';

// utils
import { arraysEqual, resizeHandler, userDataChanged } from './utils/functions';

const App = () => {
  // context
  const { setViewportWidth } = useViewportContext();
  const { setUser } = useUserContext();

  // ref to store unsubscribers
  const unsubscribersRef = useRef([]);

  // state to help with keeping track of changed user
  // tried auth.currentUser but that does not always trigger the useEffect which changes the user context
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // window event listeners
    const resizeFunc = () => {
      resizeHandler(setViewportWidth);
    };
    window.addEventListener('resize', resizeFunc);

    const listener = onAuthStateChanged(auth, async (user) => {
      // change user in state so effect that updates context runs
      //! this breaks sign up redirect for some reason
      setCurrentUser(user);
    });

    // remove event listeners
    return () => {
      window.removeEventListener('resize', resizeFunc);
      listener();
    };
  }, []);

  useEffect(() => {
    // function to set user Context whenever logged in user changes
    const setUserContext = async () => {
      if (auth.currentUser) {
        // prepare user data query
        const usersCollectionRef = collection(firestore, 'users');
        const queryRef = query(
          usersCollectionRef,
          where('uid', '==', auth.currentUser.uid)
        );

        // get user data
        // ! wrap in try catch
        try {
          // Get initial user data
          const userSnapshot = await getDocs(queryRef);
          if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            let userData = userDoc.data();

            // Fetch initial following and followers
            let followingIds = [];
            let followersIds = [];

            const userFollowingCollection = collection(
              userDoc.ref,
              'following'
            );
            const followingSnapshot = await getDocs(userFollowingCollection);
            followingSnapshot.forEach((doc) => {
              followingIds.push(doc.id);
            });

            const userFollowersCollection = collection(
              userDoc.ref,
              'followers'
            );
            const followersSnapshot = await getDocs(userFollowersCollection);
            followersSnapshot.forEach((doc) => {
              followersIds.push(doc.id);
            });

            // Set initial user context
            setUser({
              name: userData.name,
              tag: userData.tag,
              profileImg: userData.profileImg,
              following: followingIds,
              followers: followersIds,
              loaded: true,
            });

            // subscribe to real-time updates
            const unsubscribe = onSnapshot(userDoc.ref, (snapshot) => {
              // const userDoc = snapshot.docs[0];
              const data = snapshot.data();

              // * keep only profile pic, tag, display name, following count, followers count as this information is needed more often
              const newUserData = {
                name: data.name,
                tag: data.tag,
                profileImg: data.profileImg,
              };

              if (userDataChanged(userData, newUserData)) {
                // only set user if data has changed to prevent unnecessary rerenders
                setUser((prevData) => ({
                  ...prevData,
                  ...newUserData,
                  following: prevData.following || [],
                  followers: prevData.followers || [],
                }));
                userData = newUserData;
              }
            });

            const userFollowingQuery = query(userFollowingCollection);
            const userFollowersQuery = query(userFollowersCollection);

            // attach listeners to user following and followers data
            const followingUnsub = onSnapshot(
              userFollowingQuery,
              (snapshot) => {
                const updatedFollowingIds = snapshot.docs.map(
                  (document) => document.id
                );
                if (!arraysEqual(followingIds, updatedFollowingIds)) {
                  // only set user if data has changed to prevent unnecessary rerenders
                  setUser((prevData) => ({
                    ...prevData,
                    following: updatedFollowingIds,
                  }));
                  followingIds = updatedFollowingIds;
                }
              }
            );

            const followersUnsub = onSnapshot(
              userFollowersQuery,
              (snapshot) => {
                const updatedFollowersIds = snapshot.docs.map(
                  (document) => document.id
                );
                if (!arraysEqual(followersIds, updatedFollowersIds)) {
                  // only set user if data has changed to prevent unnecessary rerenders
                  setUser((prevData) => ({
                    ...prevData,
                    followers: updatedFollowersIds,
                  }));
                  followersIds = updatedFollowersIds;
                }
              }
            );

            // add unsubscribers to unsubbers
            unsubscribersRef.current.push(unsubscribe);
            unsubscribersRef.current.push(followingUnsub);
            unsubscribersRef.current.push(followersUnsub);
          }
        } catch (error) {
          //! Handle error
          console.error('Error fetching user data:', error);
          setUser({ loaded: true });
        }
      } else {
        // no logged in user
        setUser({ loaded: true });
      }
    };

    setUserContext();
    return () => {
      unsubscribersRef.current.forEach((unsubscribeFunc) => unsubscribeFunc());
      unsubscribersRef.current = [];
    };
  }, [currentUser]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<NotFound />}>
        <Route path="/" element={<RootLayout />} exact>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Explore />} />
          <Route path="/compose/tweet" element={<ComposeTweet />} />
          <Route path="/settings/profile" element={<EditProfile />} />
          <Route path="/i/bookmarks" element={<Bookmarks />} />
          <Route path="/i/trends" element={<Trends />} />
          <Route path="/status/:id" element={<TweetPage />} />
          <Route path="/:tag" element={<Profile />} />
          <Route path="/:tag/:mode" element={<ProfileFollowing />} />
        </Route>

        <Route
          path="/i/flow/login"
          element={<Login />}
          action={loginFormAction}
        />
        <Route
          path="/i/flow/signup"
          element={<SignUp />}
          action={signUpFormAction}
        />
        <Route path="/i/flow/setup_profile" element={<SetupProfile />} />
        <Route path="/logout" element={<Logout />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
