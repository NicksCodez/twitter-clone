import React, { forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// context provider
import { useUserContext } from '../../contextProvider/ContextProvider';

// css
import './UserCard.css';

// utils
import { followClickHandler } from '../../utils/functions';

const UserCard = forwardRef(({ element }, ref) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  // destructure element object
  const { profileDocId, tag, name, bio, profileImg } = element;

  return (
    <div className="user-card" ref={ref}>
      <Link to={`/${tag}`}>
        <div className="picture">
          <img src={profileImg} alt="profile" />
        </div>
      </Link>
      <div className="content">
        <div>
          <Link to={`/${tag}`}>
            <div>
              <div className="title">{name}</div>
              <div className="subtitle">@{tag}</div>
            </div>
          </Link>
          <div className="action">
            <button
              type="button"
              className={`${
                !user.following?.includes(profileDocId) ? 'unfollowed' : ''
              }`}
              onClick={() =>
                followClickHandler(user, { docId: profileDocId }, navigate)
              }
            >
              {!user.following?.includes(profileDocId) ? 'Follow' : 'Following'}
            </button>
          </div>
        </div>
        <Link to={`/${tag}`}>
          <div className="details">{bio}</div>
        </Link>
      </div>
    </div>
  );
});

export default UserCard;
