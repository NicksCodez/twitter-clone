import React from 'react';
import { Link } from 'react-router-dom';

// css
import './SidebarElement.css';

const SidebarElement = ({
  svg,
  name,
  link,
  svgColor = '',
  cls = '',
  subCls = '',
  secondSvg = '',
  secondSvgColor = '',
}) => (
  <div
    className={`sidebar-element ${cls} ${
      subCls ? `${subCls}-submenu-item` : ''
    }`}
  >
    <Link to={link}>
      <div>
        <svg viewBox="0 0 24 24" color={svgColor}>
          <path d={svg} />
        </svg>
        <svg viewBox="0 0 24 24" color={secondSvgColor}>
          <path d={secondSvg} />
        </svg>
      </div>
      <span>{name}</span>
    </Link>
  </div>
);

export default SidebarElement;
