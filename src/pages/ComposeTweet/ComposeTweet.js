import React, { useEffect, useState } from 'react';

// css
import './ComposeTweet.css';

// components
import { useLocation } from 'react-router-dom';
import Home from '../Home/Home';

// context provider
import { useAppContext } from '../../contextProvider/ContextProvider';

const ComposeTweet = () => {
  const { viewportWidth } = useAppContext();

  const location = useLocation();
  const data = location.state?.homeScroll;
  console.log(data);
  return (
    <div>
      {viewportWidth >= 500 ? <Home /> : null}
      <div id="compose-tweet">sal</div>
    </div>
  );
};

export default ComposeTweet;
