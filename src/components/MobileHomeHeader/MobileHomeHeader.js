import React, { useState } from 'react';

// css
import './HomeHeader.css';

// pictures
import DefaultProfile from '../../assets/images/default_profile.png';

const MobileHomeHeader = () => {
  // keep track of last scrolltop to determine if user scrolls up or down
  const [scrollTop, setScrollTop] = useState(0);
  window.addEventListener('scroll', () =>
    scrollHandler(scrollTop, setScrollTop)
  );

  return (
    <div className="home-header">
      <div>
        <button type="button" className="image-wrapper">
          <img src={DefaultProfile} alt="profile" className="u-round" />
        </button>
        <button type="button" className="svg-wrapper">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="r-1cvl2hr r-4qtqp9 r-yyyyoo r-16y2uox r-lwhw9o r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"
          >
            <g>
              <path
                d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
                fill="var(--clr-bg-blue)"
              />
            </g>
          </svg>
        </button>
        <div className="fake" />
      </div>
      <div className="second-row">
        <div className="active button-wrapper">
          <button type="button" onClick={clickHandler}>
            <div>
              <span>For you</span>
              <div className="blue-underscore u-round" />
            </div>
          </button>
        </div>
        <div className="button-wrapper">
          <button type="button" onClick={clickHandler}>
            <div>
              <span>Following</span>
              <div className="blue-underscore u-round" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const clickHandler = (event) => {
  event.stopPropagation();
  const homeHeader = document.getElementsByClassName('home-header');
  // final design will probably have 2 elements with class 'home-header', one for mobile and one for desktop
  Array.from(homeHeader).forEach((header) => {
    const activeTab = header.getElementsByClassName('active');
    Array.from(activeTab).forEach((element) => {
      element.classList.remove('active');
    });
  });
  event.target.parentElement.classList.add('active');
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

export default MobileHomeHeader;
