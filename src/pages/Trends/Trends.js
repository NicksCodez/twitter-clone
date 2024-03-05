/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';

// css
import './Trends.css';

// components
import { useNavigate } from 'react-router-dom';
import TrendingItem from '../../components/TrendingItem/TrendingItem';

// utils
import { loadTrending } from '../../utils/functions';
import svgs from '../../utils/svgs';
import PageHeader from '../../components/PageHeader/PageHeader';

const Trends = () => {
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // load top 20 trends on component load and set trendsLoading to false
    loadTrending(setTrends, setTrendsLoading, 20);
  }, []);

  // header components
  const leftHeaderComp = (
    <button
      type="button"
      className="minW"
      onClick={() => {
        navigate(-1);
      }}
    >
      <svg viewBox="0 0 24 24">
        <path d={svgs.back} />
      </svg>
    </button>
  );

  const middleHeaderComp = (
    <div className="wrapper-col">
      <span>Trends</span>
    </div>
  );

  const rightHeaderComp = <div className="minW" />;

  return (
    <div id="trends">
      <div id="trends-header">
        <PageHeader
          leftElements={[leftHeaderComp]}
          middleElements={[middleHeaderComp]}
          rightElements={[rightHeaderComp]}
        />
      </div>
      {trendsLoading ? (
        <div>Loading</div>
      ) : trends.length > 0 ? (
        trends.map((trend) => (
          <TrendingItem
            key={trend.id}
            trend={trend.id}
            tweetsNumber={trend.totalTweets}
          />
        ))
      ) : (
        <div>There seem to be no trends yet</div>
      )}
    </div>
  );
};

export default Trends;
