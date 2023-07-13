import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Account.css';

// pictures
import DefaultProfile from '../../assets/images/default_profile.png';

// components
import HeaderSubmenu from '../headerComponents/HeaderSubmenu/HeaderSubmenu';
import HeaderElement from '../headerComponents/HeaderElement/HeaderElement';

// utils
import svgs from '../../utils/svgs';

const Account = () => (
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
    <HeaderElement svg={svgs.profile} name="Profile" link="profile" />
    <HeaderElement
      svg={svgs.blue}
      name="Twitter Blue"
      link="not-implemented"
      svgColor="var(--clr-bg-blue)"
    />
    <HeaderElement svg={svgs.lists} name="Lists" link="not-implemented" />
    <HeaderElement
      svg={svgs.bookmarks}
      name="Bookmarks"
      link="not-implemented"
    />
    <div className="separator-wrapper">
      <div className="separator" />
    </div>
    <HeaderSubmenu name="Creator Studio" />
    <HeaderElement
      svg={svgs.analytics}
      name="Analytics"
      link="not-implemented"
      cls="mini"
      subCls="creator"
    />
    <HeaderSubmenu name="Professional Tools" />
    <HeaderElement
      svg={svgs.professionals}
      name="Twitter for Professionals"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <HeaderElement
      svg={svgs.ads}
      name="Twitter Ads"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <HeaderElement
      svg={svgs.monetization}
      name="Monetization"
      link="not-implemented"
      cls="mini"
      subCls="professional"
    />
    <HeaderSubmenu name="Settings and Support" />
    <HeaderElement
      svg={svgs.settings}
      name="Settings and privacy"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <HeaderElement
      svg={svgs.help}
      name="Help Center"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <HeaderElement
      svg={svgs.data}
      name="Data saver"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <HeaderElement
      svg={svgs.display}
      name="Display"
      link="not-implemented"
      cls="mini"
      subCls="settings"
      secondSvg={svgs.displayBrush}
      secondSvgColor="var(--clr-bg-blue)"
    />
    <HeaderElement
      svg={svgs.keyboard}
      name="Keyboard shortcuts"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
    <HeaderElement
      svg={svgs.logOut}
      name="Log out"
      link="not-implemented"
      cls="mini"
      subCls="settings"
    />
  </div>
);

export default Account;
