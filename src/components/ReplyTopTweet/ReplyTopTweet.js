import React from 'react';
import { Link } from 'react-router-dom';

// firebase
import { auth } from '../../firebase';

// css
import './ReplyTopTweet.css';

// utils
import svgs from '../../utils/svgs';
import { formatTimeAgo } from '../../utils/functions';

const ReplyTopTweet = ({ element }) => {
  const {
    docRef,
    reposterData,
    userProfilePicture: profileImg,
    userName: name,
    userTag: tag,
    userDocId,
    createdAt,
    text,
    repliesCount: replies,
    retweetsCount: retweets,
    likesCount: likes,
    bookmarksCount: bookmarks,
    tweetId: idProp,
    imageLink: tweetImg,
    isLiked,
    isBookmarked,
    isRetweeted,
  } = element;

  return (
    <div className="reply-tweet" id={`reply-tweet-${idProp}`}>
      <div className="reply-tweet-top-separator" />
      {reposterData && (
        <div className="reply-tweet-repost">
          <div>
            <svg viewBox="0 0 24 24">
              <path d={svgs.retweet} />
            </svg>
          </div>
          <span>
            {reposterData.uid === auth.currentUser.uid
              ? 'You'
              : reposterData.name}{' '}
            retweeted
          </span>
        </div>
      )}
      <div className="reply-tweet-wrapper">
        <div className="reply-tweet-profile-picture">
          <div className="profile-picture-wrapper u-round">
            <img src={profileImg} alt="profile" />
          </div>
          <div className="reply-tweet-gray-line" />
        </div>
        <div className="reply-tweet-content">
          <div className="reply-tweet-row">
            <div className="profile-details">
              <div className="profile-name">
                <span>{name}</span>
              </div>
              <div className="profile-tag">
                <span>@{tag}</span>
              </div>
              <div className="separator">
                <span>·</span>
              </div>
              <div className="date-posted">
                <span>{formatTimeAgo(createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="reply-tweet-row">
            <div className="flex-column">
              <div
                className="reply-tweet-text"
                dangerouslySetInnerHTML={{ __html: text }}
              />
              {tweetImg ? (
                <div className="reply-tweet-image-wrapper">{tweetImg}</div>
              ) : null}
            </div>
          </div>
          <div className="reply-tweet-row">
            <span className="reply-tweet-information">
              Replying to <Link to={`/${tag}`}>&nbsp;@{tag}</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyTopTweet;
