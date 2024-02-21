import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// css
import './CommonFollowers.css';

// utils
import { v4 as uuidv4 } from 'uuid';
import { getCommonFollowers } from '../../pages/ProfileFollowing/ProfileFollowing';

const CommonFollowers = ({ tag, profileVisited, user }) => {
  const [commonFollowers, setCommonFollowers] = useState([]);
  const [formattedFollowers, setFormattedFollowers] = useState({});

  useEffect(() => {
    getCommonFollowers(
      user,
      profileVisited,
      { current: null },
      setCommonFollowers,
      { current: null }
    );
  }, [tag, user]);

  useEffect(() => {
    // get the names, pics and keys of first max 3 known followers
    const names = [];
    const pics = [];

    for (let i = 0; i < Math.min(commonFollowers.length, 3); i++) {
      names.push(commonFollowers[i].name);
      pics.push(commonFollowers[i].profileImg);
    }

    setFormattedFollowers({ names, pics });
  }, [commonFollowers]);

  return (
    <div id="profile-page-common-followers">
      {formattedFollowers.names?.length > 0 && (
        <Link to={`/${tag}/followers_you_know`}>
          <div>
            {formattedFollowers.pics.map((item) => (
              <img
                key={uuidv4()}
                src={item}
                alt="profile"
                className="u-round"
              />
            ))}
          </div>
          <div>
            <span>
              Followed by {formattedFollowers.names.slice(0).join(', ')}
              {commonFollowers.length > 3
                ? ` and ${commonFollowers.length - 3} others you follow`
                : ''}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default CommonFollowers;
