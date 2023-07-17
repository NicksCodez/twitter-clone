// react
import React, { useEffect, useRef, useState } from 'react';

// css
import './Home.css';

// components
import FeatherButton from '../../components/FeatherButton/FeatherButton';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeHeader from '../../components/HomeHeader/HomeHeader';
import TweetContainer from '../../components/TweetContainer/TweetContainer';

// utils
import { resizeHandler } from '../../utils/functions';

const Home = () => {
  const scrollTop = useRef(0);
  const [width, setWidth] = useState(window.innerWidth);
  const time = useRef(Date.now());

  useEffect(() => {
    // home event listeners
    const home = document.getElementById('home');
    const scrollHandlerFunc = () => {
      scrollHandler(scrollTop, time);
    };
    home.addEventListener('scroll', scrollHandlerFunc);

    // window event listeners
    const resizeFunc = () => {
      resizeHandler(setWidth);
    };
    window.addEventListener('resize', resizeFunc);

    // remove event listeners
    return () => {
      window.removeEventListener('resize', resizeFunc);
      home.removeEventListener('scroll', scrollHandlerFunc);
    };
  }, []);

  return (
    <div id="home">
      <HomeHeader />
      <TweetContainer />
      {width < 500 ? <FeatherButton /> : null}
      <Sidebar />
    </div>
  );
};

const scrollHandler = (lastScrollTop, time) => {
  // apply class to second row of home header to create scroll animation
  // throttle so it doesn't a lot of times on scroll

  if (time.current + 100 - Date.now() <= 0) {
    const home = document.getElementById('home');
    const homeHeader = document.getElementsByClassName('home-header');
    const st = home.scrollTop;
    if (st > lastScrollTop.current) {
      // scroll down, so remove 'scrolled' class to hide first row
      // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
      Array.from(homeHeader).forEach((element) => {
        element.classList.add('scrolled');
      });
    } else if (st < lastScrollTop.current) {
      // scroll up, so add 'scrolled' class to show first row
      Array.from(homeHeader).forEach((element) => {
        element.classList.remove('scrolled');
      });
    }

    // sometimes scroll can be negative on mobile, mitigate it
    // eslint-disable-next-line no-param-reassign
    lastScrollTop.current = st <= 0 ? 0 : st;

    // reset time
    // eslint-disable-next-line no-param-reassign
    time.current = Date.now();
  }
};

export default Home;
