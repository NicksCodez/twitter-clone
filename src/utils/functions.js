import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

// function to set width to viewport width
const resizeHandler = (setWidth) => {
  setWidth(window.innerWidth);
};

// function to make sidebar visible
const clickHandlerAccount = (event) => {
  event.stopPropagation();
  const accountInfo = document.getElementById('sidebar');
  accountInfo.classList.add('active');
};

// function to capitalize string
const capitalize = (string) =>
  string.charAt(0).toLocaleUpperCase() + string.slice(1);

// function to process tweet text
const processTweetText = (text) => {
  // regular expression that matches links
  const linkRegex = /(?:https?:\/\/|ftp:\/\/|www\.)\S+/g;

  // regular expression that matches mentions or hashtags (@... or #...)
  const mentionHashtagRegex = /(^|\s)([@#][A-Za-z0-9_]+)/g;

  let processedText = text;

  // wrap links with <a> tags
  processedText = processedText.replace(
    linkRegex,
    (match) => `<a href="${match}" class="blue-text">${match}</a>`
  );

  // wrap mentions and hashtags with <a> tags
  processedText = processedText.replace(
    mentionHashtagRegex,
    (match, whitespace, word) => {
      const link =
        word[0] === '@' ? `/${word.slice(1)}` : `/search?q=${word.slice(1)}`;
      return `${whitespace}<a href="${link}" class="blue-text">${word}</a>`;
    }
  );

  return processedText;
};

const chunkArray = (array, chunkSize) => {
  // function to chunk array into multiple arrays of smaller size
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

const updateTweets = (prevTweets, fetchedTweets) => {
  // function to update tweets
  //! urmatoarele comentarii sunt scrise pentru cazul in care se apeleaza din functia attachListenersToTweets
  //! daca nu filtrez astfel incat fetchedtweets sa nu existe deja in prevtweets, apar duplicate
  //! duplicatele apar cand am mai mult de setul initial de 25 de tweeturi incarcate, dar nu toate tweeturile
  //! ex: sunt pe pagina home, dau scroll, incarc inca un set de tweeturi, merg la explore, dupa inapoi la home
  //! eroarea nu apare chiar mereu, dar apare destul de des
  //! eroarea apare sigur daca dupa ce m-am intors la home page se incarca automat inca un set de tweeturi datorita intersectiei, desi nu ar trebui caci nu am dat scroll pana la ultimul tweet
  const filteredFetchedTweets = fetchedTweets.filter((tweet) => tweet.userName);
  // update duplicate tweets
  const updatedTweets = prevTweets.map((prevTweet) => {
    const updatedTweet = filteredFetchedTweets.find(
      (fetchedTweet) => fetchedTweet.tweetId === prevTweet.tweetId
    );
    return updatedTweet || prevTweet;
  });

  // append any tweet not already in homeTweets to updatedTweets
  filteredFetchedTweets.forEach((fetchedTweet) => {
    if (
      !prevTweets.some(
        (prevTweet) => prevTweet.tweetId === fetchedTweet.tweetId
      )
    ) {
      updatedTweets.push(fetchedTweet);
    }
  });

  return updatedTweets;
};

// function to get interaction data between logged in user and tweet
const getInteractionsData = async (tweetUid) => {
  // find out if tweet is liked/bookmarked
  const tweetInteractionsCollection = collection(
    firestore,
    'tweetInteractions'
  );
  const tweetInteractionsQuery = query(
    tweetInteractionsCollection,
    where('userId', '==', auth.currentUser?.uid || ''),
    where('tweetId', '==', tweetUid),
    where('type', 'in', ['like', 'bookmark', 'retweet'])
  );

  const tweetInteractionsSnapshot = await getDocs(tweetInteractionsQuery);

  // console.log(tweetInteractionsSnapshot.docs);
  const interactionsData = {
    isLiked: false,
    isBookmarked: false,
    isRetweeted: false,
  };

  tweetInteractionsSnapshot.docs.forEach((doc) => {
    switch (doc.data().type) {
      case 'like':
        interactionsData.isLiked = true;
        break;
      case 'bookmark':
        interactionsData.isBookmarked = true;
        break;
      default:
        break;
    }
  });

  // find out if the tweet is retweeted
  const tweetsCollection = collection(firestore, 'tweets');
  const retweetQuery = query(
    tweetsCollection,
    where('type', '==', 'retweet'),
    where('userId', '==', auth.currentUser?.uid || ''),
    where('retweetId', '==', tweetUid)
  );
  const retweetSnapshot = await getDocs(retweetQuery);
  if (!retweetSnapshot.empty) {
    interactionsData.isRetweeted = true;
  }
  return interactionsData;
};

export {
  clickHandlerAccount,
  resizeHandler,
  capitalize,
  processTweetText,
  chunkArray,
  updateTweets,
  getInteractionsData,
};
