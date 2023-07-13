// react
import React from 'react';

// css
import './Home.css';

// components
import MobileHomeHeader from '../../components/MobileHomeHeader/MobileHomeHeader';
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import AccountInfo from '../../components/AccountInfo/AccountInfo';

const Home = () => (
  <div id="home">
    <MobileHomeHeader />
    <FeatherButton />
    <AccountInfo />
  </div>
);

export default Home;
