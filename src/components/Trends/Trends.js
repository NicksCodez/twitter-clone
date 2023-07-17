import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Trends.css';

// components
import TrendingItem from '../TrendingItem/TrendingItem';

const Trends = () => (
  <div id="trends">
    <h2>Trends for you</h2>
    <TrendingItem />
    <TrendingItem />
    <TrendingItem />
    <TrendingItem />
    <TrendingItem />
    <Link to="/trends" className="show-more">
      <span>Show more</span>
    </Link>
    <div className="separator-wrapper">
      <div className="separator" />
    </div>
  </div>
);

export default Trends;
