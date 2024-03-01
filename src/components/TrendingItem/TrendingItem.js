import React from 'react';
import { Link } from 'react-router-dom';

// css
import './TrendingItem.css';

// utils
import svgs from '../../utils/svgs';

const TrendingItem = ({ trend, tweetsNumber }) => (
  <div className="trending-item">
    <Link to={`/search?q="${trend}"`}>
      <div className="secondary">
        <span>Trending</span>
        <button type="button" style={{ display: 'none' }}>
          <svg viewBox="0 0 24 24">
            <path d={svgs.moreNoOutline} />
          </svg>
        </button>
      </div>
      <div className="primary">
        <span>{trend}</span>
      </div>
      <div className="secondary">
        <span>{tweetsNumber} Tweets</span>
      </div>
    </Link>
  </div>
);

export default TrendingItem;
