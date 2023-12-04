// react
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';

// layouts
import { collection, onSnapshot, query, where } from 'firebase/firestore';
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

// context providers
import { useAppContext } from './contextProvider/ContextProvider';

// utils
import { resizeHandler } from './utils/functions';

const App = () => {
  const { setViewportWidth, setUser } = useAppContext();

  useEffect(() => {
    // window event listeners
    const resizeFunc = () => {
      resizeHandler(setViewportWidth);
    };
    window.addEventListener('resize', resizeFunc);

    // define unsubscribe here to call it in return and free resources
    // set the user in context whenever authentication changes to have easy access
    let unsubscribe = () => null;
    auth.onAuthStateChanged((user) => {
      // use setTimeout because changing the context on e.g. sign up causes a rerender which somehow breaks redirect functionality
      // making the rerender happen at a later point is fine, redirect has already happenned
      // gonna have to check it out in more detail sometime and find a proper fix
      if (user) {
        setTimeout(async () => {
          const usersCollectionRef = collection(firestore, 'users');
          const queryRef = query(
            usersCollectionRef,
            where('uid', '==', user.uid)
          );
          // use onSnapshot to be notified of changes to user data
          unsubscribe = onSnapshot(queryRef, (snapshot) => {
            let userData = {};
            if (snapshot.docs) {
              userData = snapshot.docs[0].data();
            }
            setUser(userData);
          });
        }, 2000);
      } else {
        setUser({});
        // setTimeout(() => {
        //   setUser({});
        // }, 2000);
      }
    });

    // remove event listeners
    return () => {
      window.removeEventListener('resize', resizeFunc);
      unsubscribe();
    };
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<NotFound />}>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/:tag" element={<Profile />} />
          <Route path="/compose/tweet" element={<ComposeTweet />} />
          <Route path="/settings/profile" element={<EditProfile />} />
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
        <Route
          path="/i/flow/setup_profile"
          element={<SetupProfile />}
          // action={signUpFormAction}
        />
        <Route path="/logout" element={<Logout />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
