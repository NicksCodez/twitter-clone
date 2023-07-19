// react
import React, { useEffect, useState } from 'react';

// css
import './Explore.css';

// components
import ExploreHeader from '../../components/ExploreHeader/ExploreHeader';
import Sidebar from '../../components/Sidebar/Sidebar';
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Trends from '../../components/Trends/Trends';
import People from '../../components/People/People';

// utils
import { resizeHandler } from '../../utils/functions';

const Explore = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // window event listeners
    const resizeFunc = () => {
      resizeHandler(setWidth);
    };
    window.addEventListener('resize', resizeFunc);

    // remove event listeners
    return () => {
      window.removeEventListener('resize', resizeFunc);
    };
  }, []);

  return (
    <div id="explore">
      <ExploreHeader />
      <Sidebar />
      {width < 500 ? <FeatherButton /> : null}
      <Trends />
      <div className="separator-wrapper">
        <div className="separator" />
      </div>
      <People />
    </div>
  );
};

export default Explore;
