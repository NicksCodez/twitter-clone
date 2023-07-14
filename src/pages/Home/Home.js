// react
import React from 'react';

// css
import './Home.css';

// components
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeHeader from '../../components/HomeHeader/HomeHeader';

const Home = () => (
  <div id="home">
    <HomeHeader />
    <FeatherButton />
    <Sidebar />
  </div>
);

export default Home;
