import React from 'react';

// css
import './PageHeader.css';

// uuid
import { v4 as uuidv4 } from 'uuid';

const PageHeader = ({ leftElements, middleElements, rightElements }) => (
  <div className="page-header">
    <div className="left">
      {leftElements.map((leftElement, index) => (
        <div key={uuidv4()} className={`left-${index}`}>
          {leftElement}
        </div>
      ))}
    </div>
    <div className="middle">
      {middleElements.map((middleElement, index) => (
        <div key={uuidv4()} className={`middle-${index}`}>
          {middleElement}
        </div>
      ))}
    </div>
    <div className="right">
      {rightElements.map((rightElement, index) => (
        <div key={uuidv4()} className={`right-${index}`}>
          {rightElement}
        </div>
      ))}
    </div>
  </div>
);

export default PageHeader;
