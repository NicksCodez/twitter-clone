import React, { useEffect, useState } from 'react';

// firebase
import {
  collection,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './TweetContainer.css';

// components
import Tweet from '../Tweet/Tweet';

{
  /* <img
      src="http://localhost:9199/twitter-clone-6ebd5.appspot.com/avatar-g7ef2c1a5f_1280.png
      "
      alt="profile"
    /> */
}
const TweetContainer = () => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    tweetsLoader(setTweets);
  }, []);

  return (
    <div className="tweet-container">
      {tweets.map((tweet) => (
        <Tweet
          key={tweet.tweetId}
          img={tweet.userProfilePicture}
          name={tweet.userName}
          tag={tweet.userId}
          createdAt={formatTimeAgo(tweet.createdAt)}
          text={tweet.text}
          replies={tweet.repliesCount}
          likes={tweet.likesCount}
          retweets={tweet.retweetsCount}
          bookmarks={tweet.bookmarksCount}
        />
      ))}
    </div>
  );
};

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

const tweetsLoader = async (setTweets) => {
  const tweetsCollectionRef = collection(firestore, 'tweets');

  try {
    const querySnapshot = await getDocs(
      query(
        tweetsCollectionRef,
        where('type', 'in', ['tweet', 'retweet']),
        limit(25)
      )
    );

    const fetchedTweets = await Promise.all(
      querySnapshot.docs.map(async (document) => {
        const tweetData = document.data();

        // Get the document reference to the user using the tweet's userId
        const userDataRef = tweetData.userId;
        const userRef = doc(firestore, 'users', userDataRef);
        const userDataSnapshot = await getDoc(userRef);
        const userData = userDataSnapshot.data();

        return {
          tweetId: document.id,
          ...tweetData,
          userName: userData.name,
          userProfilePicture: userData.profileImg,
        };
      })
    );

    setTweets(fetchedTweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
  }
};

export default TweetContainer;
