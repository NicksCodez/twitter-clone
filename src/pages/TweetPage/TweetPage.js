import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// firebase
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';

// css
import './TweetPage.css';

// utils
import svgs from '../../utils/svgs';

// components
import PageHeader from '../../components/PageHeader/PageHeader';
import FocusedTweet from '../../components/FocusedTweet/FocusedTweet';

const TweetPage = () => {
  // id parameter
  const { id } = useParams();

  // navigator function
  const navigate = useNavigate();

  // state to store tweet data
  const [currentTweetData, setCurrentTweetData] = useState(null);

  // get post data
  useEffect(() => {
    console.log({ id });
    // create query to get tweet
    const tweetsCollectionRef = collection(firestore, 'tweets');
    const queryRef = query(
      tweetsCollectionRef,
      where('tweetId', '==', +id),
      limit(1)
    );

    const tweetSnapshot = getDocs(queryRef);
    tweetSnapshot.then((r) => {
      // got tweet data, get user data
      const tweetData = r.docs[0].data();
      const tweetPoster = tweetData.userId;

      const usersCollectionRef = collection(firestore, 'users');
      const userQueryRef = query(
        usersCollectionRef,
        where('uid', '==', tweetPoster)
      );
      const userSnapshot = getDocs(userQueryRef);

      // append user data to tweet data
      userSnapshot.then((t) => {
        const userData = t.docs[0].data();
        const tweetObject = {
          docRef: r.docs[0].id,
          ...tweetData,
          userName: userData.name,
          userTag: userData.tag,
          userProfilePicture: userData.profileImg,
        };

        console.log({ tweetObject });
        setCurrentTweetData(tweetObject);
      });
    });
  }, [id]);

  // debugging purposes
  useEffect(() => {
    console.log({ currentTweetData });
  }, [currentTweetData]);

  // build left element
  const leftElement = (
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

  // build middle element
  const middleElement = (
    <div className="wrapper-col">
      <span>Post</span>
    </div>
  );

  // right element
  const rightElement = <div className="minW" />;

  return (
    <div id="tweet-page">
      <div id="tweet-page-header">
        <PageHeader
          leftElements={[leftElement]}
          middleElements={[middleElement]}
          rightElements={[rightElement]}
        />
      </div>
      {currentTweetData && (
        <FocusedTweet element={currentTweetData} ref={null} />
      )}
    </div>
  );
};

export default TweetPage;
