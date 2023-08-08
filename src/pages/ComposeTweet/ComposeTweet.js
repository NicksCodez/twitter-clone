import React, { useEffect, useRef, useState } from 'react';
import { Form, redirect, useNavigate } from 'react-router-dom';

// css
import './ComposeTweet.css';

// firebase
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';

// components
import Home from '../Home/Home';
import PageHeader from '../../components/PageHeader/PageHeader';
import NewTweetBody from '../../components/NewTweetComponents/NewTweetBody/NewTweetBody';
import NewTweetMedia from '../../components/NewTweetComponents/NewTweetMedia/NewTweetMedia';
import NewTweetActions from '../../components/NewTweetComponents/NewTweetCounters/NewTweetActions';

// context provider
import { useAppContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';
import { capitalize } from '../../utils/functions';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

const ComposeTweet = ({ type = 'tweet' }) => {
  const navigate = useNavigate();

  const { viewportWidth } = useAppContext();
  const [buttonText, setButtonText] = useState(type); // gonna have to get me from the location and make default type tweet if nothing in location state
  const [previews, setPreviews] = useState([]);
  const [charsLeft, setCharsLeft] = useState(280);
  const [progressColor, setProgressColor] = useState('var(--clr-bg-blue)');
  const [progressSecondColor, setProgressSecondColor] = useState('#ededed');
  const [files, setFiles] = useState([]);

  const [tweetContent, setTweetContent] = useState('');

  const loading = useRef(true);

  useEffect(() => {
    loading.current = false;
  }, []);

  useEffect(() => {
    // style form differently based on chars left
    if (charsLeft <= -10) {
      setProgressColor('var(--clr-bg-base)');
      setProgressSecondColor('var(--clr-bg-base)');
    } else if (charsLeft <= 0) {
      setProgressColor('rgb(244, 33, 46)');
      setProgressSecondColor('#ededed');
    } else if (charsLeft <= 20) {
      setProgressColor('rgb(255, 212, 0)');
      setProgressSecondColor('#ededed');
    } else if (charsLeft <= 280) {
      setProgressColor('var(--clr-bg-blue)');
      setProgressSecondColor('#ededed');
    }
  }, [charsLeft]);

  const leftElement = (
    <button type="button" onClick={() => navigate(-1)}>
      <svg viewBox="0 0 24 24">
        <path d={svgs.back} />
      </svg>
    </button>
  );

  const middleElement = <div />;

  const rightElement = (
    <button
      type="submit"
      className="u-round"
      disabled={(charsLeft === 280 && files.length === 0) || charsLeft < 0}
      onClick={() => handleTweetUpload(event, navigate, tweetContent, files)}
    >
      {capitalize(buttonText)}
    </button>
  );

  return (
    <div>
      {viewportWidth >= 688 ? <Home /> : null}
      <div id="compose-tweet">
        <Form method="post" action="/compose/tweet">
          <PageHeader
            leftElements={[leftElement]}
            middleElements={[middleElement]}
            rightElements={[rightElement]}
          />
          {previews.length > 0 ? <div id="compose-tweet-previews" /> : null}
          <div id="compose-tweet-body">
            <div>
              <div id="compose-tweet-body-profile">
                <img src={DefaultProfile} alt="profile" className="u-round" />
              </div>
              <NewTweetBody
                type={type}
                setCharsLeft={setCharsLeft}
                files={files}
                setFiles={setFiles}
                tweetContent={tweetContent}
                setTweetContent={setTweetContent}
              />
            </div>
            <div className="separator" />
            <div>
              <NewTweetMedia setFiles={setFiles} />
              <NewTweetActions
                charsLeft={charsLeft}
                progressColor={progressColor}
                progressSecondColor={progressSecondColor}
              />
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

const handleTweetUpload = async (event, navigate, tweetContent, files) => {
  // prevent default redirect
  event.preventDefault();
  let url;

  if (files.length > 0) {
    // tweet image ref
    const fileRef = ref(storage, `tweets/${files[0].name}${uuidv4()}`);
    await uploadBytes(fileRef, files[0]);
    url = await getDownloadURL(fileRef);
    console.log({ url });
  }

  // tweets collection
  const tweetsCollectionRef = collection(firestore, 'tweets');
  try {
    const tweet = {
      tweetId: Math.floor(Math.random() * 10000) + 10000,
      likesCount: 0,
      retweetsCount: 0,
      bookmarksCount: 0,
      createdAt: serverTimestamp(),
      repliesCount: 0,
      text: `${tweetContent}`,
      type: 'tweet',
      userId: 'NickTag',
      imageLink: `${url || ''}`,
    };

    await addDoc(tweetsCollectionRef, tweet);
  } catch (error) {
    console.error(error);
  }

  return navigate('/home');
};

export default ComposeTweet;
