import React from 'react';

// css
import './TitleSubtitle.css';

const TitleSubtitle = ({ title, subtitle }) => (
  <div className="title-subtitle">
    <h1 className="title">{title}</h1>
    <div className="subtitle">{subtitle}</div>
  </div>
);

export default TitleSubtitle;
