import React from 'react';
import { Link } from 'react-router-dom';

// css
import './TrendingItem.css';

// utils
import svgs from '../../utils/svgs';

const TrendingItem = () => (
  <div className="trending-item">
    <Link to="/trend">
      <div className="secondary">
        <span>Trending</span>
        <button type="button">
          <svg viewBox="0 0 24 24">
            <path d={svgs.moreNoOutline} />
          </svg>
        </button>
      </div>
      <div className="primary">
        <span>RFK</span>
      </div>
      <div className="secondary">
        <span>8,408 Tweets</span>
      </div>
    </Link>
  </div>
);

export default TrendingItem;
