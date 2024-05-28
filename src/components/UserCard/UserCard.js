import React, { forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// context provider
import { useUserContext } from '../../contextProvider/ContextProvider';

// css
import './UserCard.css';

// utils
import { followClickHandler } from '../../utils/functions';
import DefaultProfile from '../../assets/images/default_profile.png';

const UserCard = forwardRef(({ element }, ref) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  // destructure element object
  const { profileDocId, tag, name, bio, profileImg, hideFollow } = element;

  return (
    <div className="user-card" ref={ref}>
      <Link to={`/${tag}`}>
        <div className="picture">
          <img src={profileImg || DefaultProfile} alt="profile" />
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
          {!hideFollow && (
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
                {!user.following?.includes(profileDocId)
                  ? 'Follow'
                  : 'Following'}
              </button>
            </div>
          )}
        </div>
        <Link to={`/${tag}`}>
          <div className="details">{bio}</div>
        </Link>
      </div>
    </div>
  );
});

export default UserCard;
