// react

import React from 'react';
import { Outlet } from 'react-router-dom';

// css
import './RootLayout.css';

// components
import Footer from '../../components/Footer/Footer';

const RootLayout = () => (
  <div id="rootLayout">
    <Footer />
    <main>
      <Outlet />
    </main>
  </div>
);

export default RootLayout;
