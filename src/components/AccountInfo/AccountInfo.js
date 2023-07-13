import React from 'react';
import Account from '../Account/Account';

// css
import './AccountInfo.css';

// utils
import svgs from '../../utils/svgs';

const AccountInfo = () => (
  <div id="account-info">
    <div className="left">
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
      <Account />
    </div>
    {/* greyed out right side */}
    <button
      type="button"
      onClick={clickHandler}
      aria-label="Close Account Info"
    />
  </div>
);

const clickHandler = (event) => {
  event.stopPropagation();
  const accountInfo = document.getElementById('account-info');
  accountInfo.classList.remove('active');
};

export default AccountInfo;
