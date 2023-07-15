import React from 'react';

// css
import './HomeHeader.css';

// components
import FirstRow from '../homeHeaderComponents/FirstRow/FirstRow';
import SecondRow from '../homeHeaderComponents/SecondRow/SecondRow';

const HomeHeader = () => (
  <div className="home-header">
    <FirstRow />
    <SecondRow />
  </div>
);

export default HomeHeader;
