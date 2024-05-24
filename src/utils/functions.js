import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
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

// function to get trends mentioned in a tweet formatted text string
const getTrendsMentioned = (text) => {
  // regular expression that matches hashtags (#...) starting with < and ending with >
  // match this pattern because they are wrapped in <a> tags
  const hashtagRegex = /(>)([#][A-Za-z0-9_]+)(<)/g;
  return (
    text.match(hashtagRegex)?.map((tag) => tag.substring(2, tag.length - 1)) ||
    []
  );
};

// function to get users mentioned in a tweet formatted text string
const getUsersMentioned = (text) => {
  // regular expression that matches users (@...) starting with < and ending with >
  // match this pattern because they are wrapped in <a> tags
  const usersRegex = /(>)([@][A-Za-z0-9_]+)(<)/g;
  return (
    text.match(usersRegex)?.map((user) => user.substring(2, user.length - 1)) ||
    []
  );
};

const chunkArray = (array, chunkSize) => {
  // function to chunk array into multiple arrays of smaller size
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};

const updateTweets = (
  prevTweets,
  docsToModify,
  docsToDelete,
  docsToAdd,
  noSort = false
) => {
  // function to update tweets
  // ! uses key to delete because that is unique in each document, tweetId can be repeated if there are retweeted tweets so tweetId is used for modifying
  // ! best order of operations is delete -> modify -> add

  // clone prevTweets into new array
  let updatedTweets = prevTweets.map((tweet) => tweet);
  console.log('in update > ', { docsToDelete }, { updatedTweets });

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
      docsToModify.map((document) => [document.tweetId, document])
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
          repostTime: tweet?.repostTime,
          reposterId: tweet?.reposterId,
          reposterData: tweet.reposterData,
          originalTweetId: tweet.originalTweetId,
          tweetId: tweet.tweetId,
          type: tweet.type,
          userId: tweet.userId,
          userDocId: tweet.userDocId,
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
        updatedTweets[index] = newTweet;
      }
    });
  }

  // add new tweets
  if (docsToAdd?.length > 0) {
    docsToAdd.forEach((document) => {
      // if document with same key already exists, find it
      const index = updatedTweets.findIndex(
        (updatedTweet) => updatedTweet.key === document.key
      );
      if (index === -1) {
        // no document with same key, can add
        updatedTweets.push(document);
      } else {
        // document with same key, need to replace it
        // ? this can happen when a document is deleted, causing the snapshot to retrieve one document from the following snapshot, which leads to duplication
        const newTweet = {
          createdAt: updatedTweets[index].createdAt,
          docRef: updatedTweets[index].docRef,
          key: updatedTweets[index].key,
          repostTime: updatedTweets[index]?.repostTime,

          reposterId: updatedTweets[index]?.reposterId,
          reposterData: updatedTweets[index].reposterData,
          originalTweetId: updatedTweets[index].originalTweetId,
          tweetId: updatedTweets[index].tweetId,
          type: updatedTweets[index].type,
          userId: updatedTweets[index].userId,
          userDocId: updatedTweets[index].userDocId,
          bookmarksCount: document.bookmarksCount,
          imageLink: document.imageLink,
          isBookmarked: document.isBookmarked,
          isLiked: document.isLiked,
          isRetweeted: document.isRetweeted,
          likesCount: document.likesCount,
          repliesCount: document.repliesCount,
          retweetsCount: document.retweetsCount,
          text: document.text,
          userName: document.userName,
          userProfilePicture: document.userProfilePicture,
          userTag: document.userTag,
        };
        updatedTweets[index] = newTweet;
      }
    });
  }

  if (!noSort) {
    // want to show home tweets in order of createdAt or repostTime
    sortDocsCreatedAtDesc(updatedTweets);
  }
  return updatedTweets;
};

const sortDocsCreatedAtDesc = (docs) => {
  // function to sort documents based on 'createdAt' or 'repostTime' field, which is of type firestore timestamp

  docs.sort((a, b) => {
    const aCreatedAt = a.repostTime || a.createdAt;
    const bCreatedAt = b.repostTime || b.createdAt;

    // Compare seconds first, then nanoseconds if seconds are equal
    if (aCreatedAt.seconds !== bCreatedAt.seconds) {
      return bCreatedAt.seconds - aCreatedAt.seconds;
    }
    return bCreatedAt.nanoseconds - aCreatedAt.nanoseconds;
  });

  return docs;
};

// function to get interaction data between logged in user and tweet
const getInteractionsData = async (tweetUid, ref) => {
  // function to set tweet document interactions data

  const interactionsData = {
    isLiked: false,
    isBookmarked: false,
    isRetweeted: false,
  };

  // find out if tweet is liked
  const likesCollection = collection(ref, 'likes');
  const likesQuery = query(
    likesCollection,
    where('userId', '==', auth.currentUser?.uid || '')
  );
  const likesSnapshot = await getDocs(likesQuery);
  if (!likesSnapshot.empty) {
    interactionsData.isLiked = true;
  }

  // find out if tweet is bookmarked
  const bookmarksCollection = collection(ref, 'bookmarks');
  const bookmarksQuery = query(
    bookmarksCollection,
    where('userId', '==', auth.currentUser?.uid || '')
  );
  const bookmarksSnapshot = await getDocs(bookmarksQuery);
  if (!bookmarksSnapshot.empty) {
    interactionsData.isBookmarked = true;
  }

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

// function to debounce another function
// makes sure function only runs once in delay interval
const debounce =
  (func, delay, lastCalled, setLastCalled) =>
  (...args) => {
    const now = Date.now();
    if (now - lastCalled > delay) {
      setLastCalled(now);
      func(...args);
    }
  };

// function to retrieve a user's data
const getUserData = async (userDataRef) => {
  // function to get a user's data according to tag
  const usersCollectionRef = collection(firestore, 'users');
  const usersQueryRef = query(
    usersCollectionRef,
    where('uid', '==', userDataRef)
  );
  const userDataSnapshot = await getDocs(usersQueryRef);

  return {
    ...userDataSnapshot.docs[0]?.data(),
    userDocId: userDataSnapshot.docs[0]?.id,
  };
};

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

// function to load trending items
const loadTrending = async (setTrends, setTrendsLoading, limitSize) => {
  // set trends state to first 5 most tweeted trends
  const trendsCollection = collection(firestore, 'trends');
  const trendsQuery = query(
    trendsCollection,
    orderBy('totalTweets', 'desc'),
    limit(limitSize)
  );

  const trendsSnapshot = await getDocs(trendsQuery);

  if (trendsSnapshot.empty) {
    // no trends
    setTrends([]);
  } else {
    const trends = trendsSnapshot.docs.map((document) => ({
      id: document.id,
      totalTweets: document.data().totalTweets,
    }));
    setTrends(trends);
  }

  setTrendsLoading(false);
};

// click handler for 'follow button' click
const followClickHandler = async (loggedUser, profileVisited, navigate) => {
  if (auth.currentUser) {
    // only run if user is logged in
    console.log('called follow click handler', { loggedUser });
    // check if loggedUser already follows profileVisited
    // if not, follow profileVisited
    // if yes, unfollowProfileVisited

    // first, get loggedUser doc ref
    const usersCollection = collection(firestore, 'users');
    const userQuery = query(
      usersCollection,
      where('uid', '==', auth.currentUser.uid)
    );
    const userSnapshot = await getDocs(userQuery);
    const userDocRef = userSnapshot.docs[0].ref;

    // define following collection inside user doc
    const followingCollection = collection(userDocRef, 'following');

    if (loggedUser.following.includes(profileVisited.docId)) {
      // to unfollow, delete doc with same id as profileVisited uid
      deleteDoc(doc(followingCollection, profileVisited.docId));
      // also delete follower doc from profileVisited
      deleteDoc(
        doc(
          firestore,
          `users/${profileVisited.docId}/followers/${userSnapshot.docs[0].id}`
        )
      );
    } else {
      console.log(
        'before setDoc ',
        { followingCollection },
        { profileVisited }
      );
      // to follow, create doc with same id as profileVisited uid
      setDoc(doc(followingCollection, profileVisited.docId), {
        createdAt: serverTimestamp(),
      });
      // also create doc in profileVisited followers
      setDoc(
        doc(
          firestore,
          `users/${profileVisited.docId}/followers/${userSnapshot.docs[0].id}`
        ),
        {
          createdAt: serverTimestamp(),
        }
      );
    }
  } else {
    // no user logged in, redirect to log in page
    navigate('/i/flow/login');
  }
};

const formatDate = (date) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedHours}:${formattedMinutes} ${ampm} · ${month} ${day}, ${year}`;
};

const userDataChanged = (dataA, dataB) => {
  if (
    typeof dataA !== 'object' ||
    dataA === null ||
    typeof dataB !== 'object' ||
    dataB === null
  ) {
    return true;
  }

  if (
    dataA.name !== dataB.name ||
    dataA.tag !== dataB.tag ||
    dataA.profileImg !== dataB.profileImg
  ) {
    return true;
  }

  return false;
};

function arraysEqual(arr1, arr2) {
  // Check if both inputs are arrays
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }

  // Check if arrays have same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Compare each element of the arrays
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  // If all elements are equal, return true
  return true;
}

export {
  clickHandlerAccount,
  resizeHandler,
  capitalize,
  processTweetText,
  chunkArray,
  updateTweets,
  getInteractionsData,
  debounce,
  getUserData,
  formatTimeAgo,
  sortDocsCreatedAtDesc,
  getTrendsMentioned,
  getUsersMentioned,
  loadTrending,
  followClickHandler,
  formatDate,
  userDataChanged,
  arraysEqual,
};
