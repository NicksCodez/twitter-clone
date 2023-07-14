import React from 'react';

// css
import './Sidebar.css';

// components
import SidebarMain from '../sidebarComponents/SidebarMain/SidebarMain';
import SidebarHeader from '../sidebarComponents/SidebarHeader/SidebarHeader';

const Sidebar = () => (
  <div id="sidebar">
    <div className="left">
      <SidebarHeader />
      <SidebarMain />
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
  const accountInfo = document.getElementById('sidebar');
  accountInfo.classList.remove('active');
};

export default Sidebar;
