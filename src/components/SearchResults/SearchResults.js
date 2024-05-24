import React, { useEffect, useRef, useState } from 'react';

// css
import './SearchResults.css';

// firebase
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from '../../firebase';

// utils

import { getInteractionsData } from '../../utils/functions';

// components
import ScrollableElementsLoader from '../ScrollableElementsLoader/ScrollableElementsLoader';
import UserCard from '../UserCard/UserCard';

import Tweet from '../Tweet/Tweet';
import SearchCategories from '../SearchCategories/SearchCategories';

const SearchResults = ({ searchQuery }) => {
  // state to keep track of selected category
  const [isTweetsSelected, setIsTweetsSelected] = useState(true);

  // state to keep track of SearchResults loading data
  const [isLoading, setIsLoading] = useState(true);

  // needed for ScrollableElementsLoader
  const [loaderInfo, setLoaderInfo] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const seenLastResultRef = useRef(false);
  const lastVisibleResultRef = useRef(null);
  const [isScrollableLoading, setIsScrollableLoading] = useState(true);

  // effects
  useEffect(() => {
    if (!isTweetsSelected) {
      const usersCollectionRef = collection(firestore, 'users');
      const queryRef = query(
        usersCollectionRef,
        where('tagLowerCase', '>=', searchQuery),
        where('tagLowerCase', '<=', `${searchQuery}\uf8ff`),
        limit(25),
        orderBy('tagLowerCase')
      );
      setLoaderInfo({ queryRef, attach: false });
    } else if (isTweetsSelected) {
      loadTweets(searchQuery, setSearchResults, setIsLoading);
    }

    return () => {
      setSearchResults([]);
      setIsLoading(true);
    };
  }, [searchQuery, isTweetsSelected]);

  // functions
  const handleIntersection = (entries) => {
    const [entry] = entries;
    // if already seen last tweet no need to run
    if (entry.isIntersecting && !seenLastResultRef.current) {
      const usersCollectionRef = collection(firestore, 'users');
      const queryRef = query(
        usersCollectionRef,
        where('tagLowerCase', '>=', searchQuery),
        where('tagLowerCase', '<=', `${searchQuery}\uf8ff`),
        orderBy('tagLowerCase'),
        startAfter(lastVisibleResultRef.current),
        limit(25)
      );
      setLoaderInfo({ queryRef, attach: false });
    }
  };

  return (
    <div id="detailed-search-results">
      <div className="categories">
        <SearchCategories
          isTweetsSelected={isTweetsSelected}
          setIsTweetsSelected={setIsTweetsSelected}
        />
      </div>
      {!isTweetsSelected && loaderInfo.queryRef && (
        <ScrollableElementsLoader
          elementsLoader={loaderInfo}
          elements={searchResults}
          setElements={setSearchResults}
          loadElements={loadPeople}
          attachListenersToElements={() => null}
          setLoadedSignal={setIsScrollableLoading}
          ElementComponent={UserCard}
          pushUnsubscriber={() => null}
          setLastRetrievedElement={(element) => {
            lastVisibleResultRef.current = element;
          }}
          seenLastElement={seenLastResultRef}
          setSeenLastElement={(val) => {
            seenLastResultRef.current = val;
          }}
          intersectionHandler={handleIntersection}
          noQuery={false}
        />
      )}
      {isTweetsSelected && !isLoading && (
        <div className="tweets-wrapper">
          {searchResults.map((result) => (
            <Tweet element={result} ref={null} key={uuidv4()} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

const loadPeople = async (
  queryRef,
  setElements,
  setLastRetrievedElement,
  setSeenLastElement,
  setIsLoading
) => {
  const peopleSnapshot = await getDocs(queryRef);
  if (!peopleSnapshot.empty) {
    const peopleData = peopleSnapshot.docs.map((person) => {
      const personData = person.data();
      return {
        profileDocId: person.id,
        tag: personData.tag,
        name: personData.name,
        bio: personData.bio,
        profileImg: personData.profileImg,
        hideFollow: false,
        key: uuidv4(),
      };
    });
    setLastRetrievedElement(
      peopleSnapshot.docs[peopleSnapshot.docs.length - 1]
    );
    setElements((prevElements) => {
      // Combine the previous elements and the new peopleData
      const combinedElements = [...prevElements, ...peopleData];

      // Create a set to track seen tags
      const seenTags = new Set();

      // Filter out duplicates
      const uniqueElements = combinedElements.filter((element) => {
        if (seenTags.has(element.tag)) {
          // If the tag is already seen, filter out the element
          return false;
        }
        // Otherwise, add the tag to the set and keep the element
        seenTags.add(element.tag);
        return true;
      });

      return uniqueElements;
    });
    setIsLoading(false);
  } else {
    setSeenLastElement(true);
    setIsLoading(false);
  }

  return [];
};

const loadTweets = async (searchQuery, setElements, setIsLoading) => {
  //! very inefficient, gets all tweets
  //! works for a small example app but would never work in the real world with lots of tweets
  const tweetsCollection = collection(firestore, 'tweets');
  const tweetsQueryRef = query(tweetsCollection, orderBy('createdAt', 'desc'));
  const tweetsSnapshot = await getDocs(tweetsQueryRef);

  const filteredTweetDocs = tweetsSnapshot.docs.filter(
    (doc) => doc.data().text && doc.data().text.includes(searchQuery)
  );

  // Fetch complete data for each filtered tweet
  const completeTweetsData = await Promise.all(
    filteredTweetDocs.map((tweetDoc) => getCompleteTweetData(tweetDoc))
  );

  // Sort the completeTweetsData by createdAt field in descending order
  completeTweetsData.sort(
    (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
  );

  // Update the state with the complete tweets data
  setElements(completeTweetsData);
  setIsLoading(false);
};

const getCompleteTweetData = async (tweetDoc) => {
  const tweetDocData = tweetDoc.data();
  const tweetDocPoster = tweetDocData.userId;

  const usersCollection = collection(firestore, 'users');
  const userQueryRef = query(
    usersCollection,
    where('uid', '==', tweetDocPoster)
  );
  const userSnapshot = await getDocs(userQueryRef);
  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const interactionsData = await getInteractionsData(
      tweetDocData.tweetId,
      tweetDoc.ref
    );

    return {
      docRef: tweetDoc.id,
      reposterData: null,
      userProfilePicture: userData.profileImg,
      userName: userData.name,
      userTag: userData.tag,
      userDocId: userDoc.id,
      createdAt: tweetDocData.createdAt,
      text: tweetDocData.text,
      repliesCount: tweetDocData.repliesCount,
      retweetsCount: tweetDocData.retweetsCount,
      likesCount: tweetDocData.likesCount,
      bookmarksCount: tweetDocData.bookmarksCount,
      tweetId: tweetDocData.tweetId,
      imageLink: tweetDocData.imageLink,
      isLiked: interactionsData.isLiked,
      isBookmarked: interactionsData.isBookmarked,
      isRetweeted: interactionsData.isRetweeted,
      activeGrayLine: false,
    };
  }

  return {};
};
