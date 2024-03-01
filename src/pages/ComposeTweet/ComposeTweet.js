import React, { useEffect, useRef, useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';

// css
import './ComposeTweet.css';

// firebase
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, firestore, storage } from '../../firebase';

// components
import Home from '../Home/Home';
import PageHeader from '../../components/PageHeader/PageHeader';
import NewTweetBody from '../../components/NewTweetComponents/NewTweetBody/NewTweetBody';
import NewTweetMedia from '../../components/NewTweetComponents/NewTweetMedia/NewTweetMedia';
import NewTweetActions from '../../components/NewTweetComponents/NewTweetCounters/NewTweetActions';

// context provider
// import { useAppContext } from '../../contextProvider/ContextProvider';
import { useViewportContext } from '../../contextProvider/ContextProvider';

// utils
import svgs from '../../utils/svgs';
import {
  capitalize,
  getTrendsMentioned,
  getUsersMentioned,
} from '../../utils/functions';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

const ComposeTweet = ({ type = 'tweet' }) => {
  const navigate = useNavigate();

  // const { viewportWidth } = useAppContext();
  const { viewportWidth } = useViewportContext();
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
  if (auth.currentUser) {
    // prevent default redirect
    event.preventDefault();
    let url;

    if (files.length > 0) {
      // tweet image ref
      const fileRef = ref(storage, `tweets/${files[0].name}${uuidv4()}`);
      await uploadBytes(fileRef, files[0]);
      url = await getDownloadURL(fileRef);
    }

    // add trends and users mentioned to the tweet document
    console.log({ tweetContent });
    const trendsMentioned = getTrendsMentioned(tweetContent);
    const usersMentioned = getUsersMentioned(tweetContent);

    // tweets collection
    const tweetsCollectionRef = collection(firestore, 'tweets');
    try {
      await runTransaction(firestore, async (transaction) => {
        // get total tweets
        const countersCollection = collection(firestore, 'counters');
        const generalCounters = doc(countersCollection, 'general');
        const countersData = await transaction.get(generalCounters);
        const newId = countersData.data().totalTweets + 1;

        // build tweet object
        const tweet = {
          tweetId: newId,
          likesCount: 0,
          retweetsCount: 0,
          bookmarksCount: 0,
          createdAt: serverTimestamp(),
          repliesCount: 0,
          text: `${tweetContent}`,
          type: 'tweet',
          userId: auth.currentUser.uid,
          imageLink: `${url || ''}`,
          trendsMentioned,
          usersMentioned,
        };

        // update total tweets
        transaction.update(generalCounters, { totalTweets: newId });

        // write tweet document
        const newTweetDocRef = doc(tweetsCollectionRef);
        transaction.set(newTweetDocRef, tweet);
      });

      if (trendsMentioned.length > 0) {
        // if there are trends, set docs in 'trends' collection
        await updateTrends(trendsMentioned);
      }

      // update user total tweets
      updateTotalTweets();
    } catch (error) {
      console.error(error);
    }

    return navigate('/home');
  }
  return navigate('/i/flow/login');
};

const updateTrends = async (trendsMentioned) => {
  // array of promises
  const promises = trendsMentioned.map((trendMentioned) => {
    // reference to trend document
    const trendDocRef = doc(firestore, `trends/${trendMentioned}`);

    return new Promise((resolve, reject) => {
      try {
        runTransaction(firestore, async (transaction) => {
          // get the trend doc data
          const trendDoc = await transaction.get(trendDocRef);

          if (!trendDoc.exists()) {
            // no doc, make new one
            transaction.set(trendDocRef, {
              totalTweets: 1,
              lastTweeted: serverTimestamp(),
            });
          } else {
            // doc exists, get its data and update
            const newTotalTweets = trendDoc.data().totalTweets + 1;
            transaction.update(trendDocRef, {
              totalTweets: newTotalTweets,
              lastTweeted: serverTimestamp(),
            });
          }
        }).then((resolved) => {
          resolve();
        });
      } catch (error) {
        console.error({ error });
        reject();
      }
    });
  });

  await Promise.all(promises);
};

const updateTotalTweets = async () => {
  // get ref to user doc
  const { uid } = auth.currentUser;

  const usersCollection = collection(firestore, 'users');
  const userQueryRef = query(usersCollection, where('uid', '==', uid));
  const userDocSnap = await getDocs(userQueryRef);
  const userDocRef = userDocSnap.docs[0].ref;

  // update user total tweets in transaction
  await runTransaction(firestore, async (transaction) => {
    const userDoc = await transaction.get(userDocRef);
    const userData = userDoc.data();
    const { tweetCount } = userData;

    await transaction.update(userDocRef, { tweetCount: tweetCount + 1 });
  });
};

export default ComposeTweet;
