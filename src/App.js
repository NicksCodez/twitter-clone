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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<NotFound />}>
      <Route index element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
    </Route>
  )
);

const App = () => <RouterProvider router={router} />;

export default App;
