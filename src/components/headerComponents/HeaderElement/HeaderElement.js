import React from 'react';
import { Link } from 'react-router-dom';

// css
import './HeaderElement.css';

const HeaderElement = ({
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
    className={`header-element ${cls} ${
      subCls ? `${subCls}-submenu-item` : ''
    }`}
  >
    <Link to={`/${link}`}>
      <div>
        <svg viewBox="0 0 24 24" fill={svgColor}>
          <path d={svg} />
        </svg>
        <svg viewBox="0 0 24 24" fill={secondSvgColor}>
          <path d={secondSvg} />
        </svg>
      </div>
      <span>{name}</span>
    </Link>
  </div>
);

export default HeaderElement;
