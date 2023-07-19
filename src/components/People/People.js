import React from 'react';
import Account from '../Account/Account';

// css
import './People.css';

const People = () => (
  <div id="people">
    <h2>
      <span>Who to follow</span>
    </h2>
    <Account showDescription />
    <Account showDescription />
    <Account showDescription />
  </div>
);

export default People;
