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

const updateTweets = (prevTweets, docsToModify, docsToDelete, docsToAdd) => {
  console.log('-------------in update------------\n');
  // function to update tweets
  // ! uses key to delete because that is unique in each document, tweetId can be repeated if there are retweeted tweets so tweetId is used for modifying
  // ! best order of operations is delete -> modify -> add

  // clone prevTweets into new array
  let updatedTweets = prevTweets.map((tweet) => tweet);
  console.log({ prevTweets }, { updatedTweets });

  // delete tweets
  if (docsToDelete?.length > 0) {
    updatedTweets = updatedTweets.filter(
      (tweet) => !docsToDelete.includes(tweet.key)
    );
  }

  // modify tweets to modify
  if (docsToModify?.length > 0) {
    // make map for faster lookup
    const docsToModifyMap = new Map(
      docsToModify.map((doc) => [doc.tweetId, doc])
    );

    // replace tweets where tweetId matches
    updatedTweets.forEach((tweet, index) => {
      if (docsToModifyMap.has(tweet.tweetId)) {
        const docInMap = docsToModifyMap.get(tweet.tweetId);
        // ! keep data that should not change in place and change only the data that can change
        // ! else retweeted posts do not get updated correctly if both original tweet and retweet post on the same page
        const newTweet = {
          createdAt: tweet.createdAt,
          docRef: tweet.docRef,
          key: tweet.key,
          ...[tweet.repostTime && { repostTime: tweet.repostTime }],
          ...[tweet.reposterId && { reposterId: tweet.reposterId }],
          tweetId: tweet.tweetId,
          type: tweet.type,
          userId: tweet.userId,
          bookmarksCount: docInMap.bookmarksCount,
          imageLink: docInMap.imageLink,
          isBookmarked: docInMap.isBookmarked,
          isLiked: docInMap.isLiked,
          isRetweeted: docInMap.isRetweeted,
          likesCount: docInMap.likesCount,
          repliesCount: docInMap.repliesCount,
          retweetsCount: docInMap.retweetsCount,
          text: docInMap.text,
          userName: docInMap.userName,
          userProfilePicture: docInMap.userProfilePicture,
          userTag: docInMap.userTag,
        };
        // updatedTweets[index] = docsToModifyMap.get(tweet.key);
        updatedTweets[index] = newTweet;
      }
    });
  }

  // add new tweets
  if (docsToAdd?.length > 0) {
    const firstDocTime =
      updatedTweets[0]?.repostTime || updatedTweets[0]?.createdAt;
    docsToAdd.forEach((doc) => {
      const currentDocTime = doc.repostTime || doc.createdAt;
      if (
        currentDocTime.seconds > firstDocTime?.seconds ||
        (currentDocTime.seconds === firstDocTime?.seconds &&
          currentDocTime.nanoseconds > firstDocTime?.nanoseconds)
      ) {
        updatedTweets.splice(0, 0, doc);
      } else {
        updatedTweets.push(doc);
      }
    });
  }

  console.log({ prevTweets }, { updatedTweets });
  console.log('-------------gata update------------\n');
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
