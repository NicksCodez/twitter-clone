import React from 'react';
import { Link } from 'react-router-dom';

// css
import './SidebarMain.css';

// pictures
import DefaultProfile from '../../../assets/images/default_profile.png';

// components
import SidebarSubmenu from '../SidebarSubmenu/SidebarSubmenu';
import SidebarElement from '../SidebarElement/SidebarElement';

// utils
import svgs from '../../../utils/svgs';

const SidebarMain = () => (
  <div id="account" aria-label="account">
    <Link to="/skeedmask">
      <div className="padded-wrapper">
        <div className="account-picture">
          <img src={DefaultProfile} alt="profile" className="u-round" />
          <div>
            <svg viewBox="0 0 24 24" className="u-round">
              <path d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
            </svg>
          </div>
        </div>
        <div className="account-name">
          <div className="primary">Skeedmask</div>
          <div className="secondary">@skeedmask</div>
        </div>
        <div className="account-stats">
          <div>
            <span className="primary">184</span>
            <span className="secondary">Following</span>
          </div>
          <div>
            <span className="primary">184</span>
            <span className="secondary">Followers</span>
          </div>
        </div>
      </div>
    </Link>
    <SidebarElement svg={svgs.profile} name="Profile" link="profile" />
    <SidebarElement
      svg={svgs.blue}
      name="Twitter Blue"
      link="not-implemented"
      svgColor="var(--clr-bg-blue)"
    />
    <SidebarElement svg={svgs.lists} name="Lists" link="not-implemented" />
    <SidebarElement
      svg={svgs.bookmarks}
      name="Bookmarks"
      link="not-implemented"
    />
    <div className="separator-wrapper">
      <div className="separator" />
    </div>
    <SidebarSubmenu name="Creator Studio" />
    <SidebarElement
      svg={svgs.analytics}
      name="Analytics"
      link="not-implemented"
      cls="mini"
      subCls="creator"
    />
    <SidebarSubmenu name="Professional Tools" />
    <SidebarElement
      svg={svgs.professionals}
      name="Twitter for Professionals"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <SidebarElement
      svg={svgs.ads}
      name="Twitter Ads"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <SidebarElement
      svg={svgs.monetization}
      name="Monetization"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <SidebarSubmenu name="Settings and Support" />
    <SidebarElement
      svg={svgs.settings}
      name="Settings and privacy"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <SidebarElement
      svg={svgs.help}
      name="Help Center"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <SidebarElement
      svg={svgs.data}
      name="Data saver"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <SidebarElement
      svg={svgs.display}
      name="Display"
      link="not-implemented"
      cls="mini"
      subCls="settings"
      secondSvg={svgs.displayBrush}
      secondSvgColor="var(--clr-bg-blue)"
    />
    <SidebarElement
      svg={svgs.keyboard}
      name="Keyboard shortcuts"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <SidebarElement
      svg={svgs.logOut}
      name="Log out"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
  </div>
);

export default SidebarMain;
