import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="picture">
        <img src={profileImg} alt="profile" />
      </div>
      <div className="content">
        <div>
          <div>
            <div className="title">{name}</div>
            <div className="subtitle">@{tag}</div>
          </div>
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
        <div className="details">{bio}</div>
      </div>
    </div>
  );
});

export default UserCard;
