import React from 'react';

// css
import './TweetContainer.css';

// components
import Tweet from '../Tweet/Tweet';

const TweetContainer = ({ tweets, isLoading }) => (
  <div className="tweet-container">
    {isLoading ? (
      <div> loading </div>
    ) : (
      <div>
        {tweets &&
          tweets.map((tweet) => (
            <Tweet
              key={tweet.tweetId}
              profileImg={tweet.userProfilePicture}
              name={tweet.userName}
              tag={tweet.userId}
              createdAt={formatTimeAgo(tweet.createdAt)}
              text={tweet.text}
              replies={tweet.repliesCount}
              likes={tweet.likesCount}
              retweets={tweet.retweetsCount}
              bookmarks={tweet.bookmarksCount}
              idProp={`tweet-${tweet.tweetId}`}
              tweetImg={tweet.imageLink}
            />
          ))}
      </div>
    )}
  </div>
);
// Function to format timestamp
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - timestamp.toDate()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  }
  const options = { month: 'short', day: 'numeric' };
  return timestamp.toDate().toLocaleDateString('en-US', options);
};

export default TweetContainer;
