// react

import React from 'react';
import { Outlet } from 'react-router-dom';

// css
import './RootLayout.css';

// components
import MobileHeader from '../../components/MobileHeader/MobileHeader';

const RootLayout = () => (
  <div id="rootLayout">
    <MobileHeader />
    <main>
      <Outlet />
    </main>
  </div>
);

export default RootLayout;
