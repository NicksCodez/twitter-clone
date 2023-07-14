import React, { useState } from 'react';

// css
import './HomeHeader.css';

// components
import FirstRow from '../homeHeaderComponents/FirstRow/FirstRow';
import SecondRow from '../homeHeaderComponents/SecondRow/SecondRow';

const HomeHeader = () => {
  // keep track of last scrolltop to determine if user scrolls up or down
  const [scrollTop, setScrollTop] = useState(0);
  window.addEventListener('scroll', () =>
    scrollHandler(scrollTop, setScrollTop)
  );

  return (
    <div className="home-header">
      <FirstRow />
      <SecondRow />
    </div>
  );
};

const scrollHandler = (lastScrollTop, setScroll) => {
  // apply class to second row of home header to create scroll animation
  const homeHeader = document.getElementsByClassName('home-header');
  const st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScrollTop) {
    // scroll down, so add 'scrolled' class to hide first row
    // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
    Array.from(homeHeader).forEach((element) => {
      element.classList.add('scrolled');
    });
  } else if (st < lastScrollTop) {
    // scroll up, so revmoe 'scrolled' class to show first row
    Array.from(homeHeader).forEach((element) => {
      element.classList.remove('scrolled');
    });
  }
  // sometimes scroll can be negative on mobile, mitigate it
  setScroll(st <= 0 ? 0 : st);
};

export default HomeHeader;
