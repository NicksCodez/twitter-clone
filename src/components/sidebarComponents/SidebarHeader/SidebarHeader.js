import React from 'react';

// css
import './SidebarHeader.css';

// utils
import svgs from '../../../utils/svgs';

const SidebarHeader = () => (
  <div className="heading">
    <h2>Account info</h2>
    <button
      type="button"
      onClick={clickHandler}
      aria-label="Close Account Info"
    >
      <svg viewBox="0 0 24 24">
        <path d={svgs.x} />
      </svg>
    </button>
  </div>
);

const clickHandler = (event) => {
  event.stopPropagation();
  const accountInfo = document.getElementById('sidebar');
  accountInfo.classList.remove('active');
};

export default SidebarHeader;
