// react
import React from 'react';

// css
import './Home.css';

// components
import MobileHomeHeader from '../../components/MobileHomeHeader/MobileHomeHeader';
import FeatherButton from '../../components/FeatherButton/FeatherButton';

const Home = () => (
  <div id="home">
    <MobileHomeHeader />
    <FeatherButton />
  </div>
);

export default Home;
