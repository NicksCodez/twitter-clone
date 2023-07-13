/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
import React from 'react';

// css
import './HeaderSubmenu.css';

// utils
import svgs from '../../../utils/svgs';

const HeaderSubmenu = ({ name }) => (
  <button type="button" className="header-submenu" onClick={clickHandler}>
    <div>
      <span>{name}</span>
      <svg viewBox="0 0 24 24">
        <path d={svgs.caret} />
      </svg>
    </div>
  </button>
);

const clickHandler = (event) => {
  event.stopPropagation();

  // find which submenu items to make visible based on clicked submenu text
  const text = event.target.textContent;
  let type;

  switch (text) {
    case 'Creator Studio':
      type = 'creator';
      break;
    case 'Professional Tools':
      type = 'professional';
      break;
    case 'Settings and Support':
      type = 'settings';
      break;
    default:
      type = '';
  }

  // get the submenu items to make visible
  const items = document
    .getElementById('account-info')
    .getElementsByClassName(`${type}-submenu-item`);

  // make submenu items visible or 'none' and change submenu caret class
  if (event.target.firstChild.lastChild.classList.contains('active')) {
    event.target.firstChild.lastChild.classList.remove('active');

    Array.from(items).forEach((item) => {
      item.style.display = 'none';
    });
  } else {
    event.target.firstChild.lastChild.classList.add('active');
    Array.from(items).forEach((item) => {
      item.style.display = 'flex';
    });
  }
};

export default HeaderSubmenu;
