// react
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';

// layouts
import RootLayout from './layouts/RootLayout/RootLayout';

// pages, actions and loaders
import NotFound from './pages/NotFound/NotFound';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import ComposeTweet from './pages/ComposeTweet/ComposeTweet';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />}>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/compose/tweet" element={<ComposeTweet />} />
      <Route path="/i/flow/login" element={<Login />} />
      <Route path="/i/flow/signup" element={<SignUp />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
