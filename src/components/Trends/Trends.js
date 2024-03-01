import React from 'react';
import { Link } from 'react-router-dom';

// css
import './Trends.css';

// components
import TrendingItem from '../TrendingItem/TrendingItem';

const Trends = () => (
  <div id="trends">
    <h2>Trends for you</h2>
    <TrendingItem trend="Music" tweetsNumber="2,403" />
    <TrendingItem trend="Music" tweetsNumber="2,403" />
    <TrendingItem trend="Music" tweetsNumber="2,403" />
    <TrendingItem trend="Music" tweetsNumber="2,403" />
    <TrendingItem trend="Music" tweetsNumber="2,403" />
    <Link to="/trends" className="show-more">
      <span>Show more</span>
    </Link>
  </div>
);

export default Trends;
