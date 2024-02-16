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

// context providers
// import { useAppContext } from './contextProvider/ContextProvider';
import {
  useUserContext,
  useViewportContext,
} from './contextProvider/ContextProvider';

// utils
import { resizeHandler } from './utils/functions';

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
        const unsubscribe = onSnapshot(queryRef, async (snapshot) => {
          if (snapshot.docs) {
            const userDoc = snapshot.docs[0];
            const data = userDoc.data();

            // * keep only profile pic, tag, display name, following count, followers count as this information is needed more often
            const userData = {
              name: data.name,
              tag: data.tag,
              profileImg: data.profileImg,
            };

            setUser((prevData) => ({
              ...prevData,
              ...userData,
              following: prevData.following || [],
              followers: prevData.followers || [],
            }));
          }
        });
        // add to unsubscribers
        unsubscribersRef.current.push(unsubscribe);

        const userSnapshot = await getDocs(queryRef);
        const userDocRef = userSnapshot.docs[0].ref;
        // prepare user following and followers data queries
        const userFollowingCollection = collection(userDocRef, 'following');
        const userFollowersCollection = collection(userDocRef, 'followers');

        const userFollowingQuery = query(userFollowingCollection);
        const userFollowersQuery = query(userFollowersCollection);

        // attach listeners to user following and followers data
        const followingUnsub = onSnapshot(userFollowingQuery, (snapshot) => {
          const followingIds = snapshot.docs.map((document) => document.id);
          console.log({ followingIds });
          setUser((prevData) => ({ ...prevData, following: followingIds }));
        });

        const followersUnsub = onSnapshot(userFollowersQuery, (snapshot) => {
          const followersIds = snapshot.docs.map((document) => document.id);
          setUser((prevData) => ({ ...prevData, followers: followersIds }));
        });

        // add unsubscribers to unsubbers
        unsubscribersRef.current.push(followingUnsub);
        unsubscribersRef.current.push(followersUnsub);
      } else {
        setUser({});
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
          <Route path="/:tag" element={<Profile />} />
          <Route path="/:tag/:mode" element={<ProfileFollowing />} />
          <Route path="/compose/tweet" element={<ComposeTweet />} />
          <Route path="/settings/profile" element={<EditProfile />} />
          <Route path="/i/bookmarks" element={<Bookmarks />} />
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
