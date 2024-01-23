import React, { useEffect, useRef, useState } from 'react';

// css
import './ScrollableElementsLoader.css';

const ScrollableElementsLoader = ({
  elementsLoader,
  elements,
  setElements,
  loadElements,
  attachListenersToElements,
  setLoadedSignal,
  intersectionHandler,
  ElementComponent,
  setLastRetrievedElement,
  seenLastElement,
  setSeenLastElement,
}) => {
  // reference to last element in array used for intersection observer
  const lastElementRef = useRef(null);

  // flag to know wether to show page or not
  const [isLoading, setIsLoading] = useState(true);

  // ref to unsubscriber functions
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    // signal loading state to parent component
    setLoadedSignal(isLoading);
  }, [isLoading]);

  useEffect(
    () => () => {
      // cleanup when unmounting
      // unsubscribe from tweets listeners, if any
      unsubscribersRef.current.forEach((unsubscriber) => {
        if (unsubscriber && typeof unsubscriber.then === 'function') {
          // if unsubscribe is a promise that returns the function to unsubscribe from the listener
          unsubscriber.then((unsubFunc) => {
            if (typeof unsubFunc === 'function') {
              unsubFunc();
            }
          });
        } else if (unsubscriber && typeof unsubscriber === 'function') {
          // if unsubscribe is the function to unsubscribe from the listener
          unsubscriber();
        }
      });
    },
    []
  );

  useEffect(() => {
    // initial elements loading

    if (!elementsLoader.attach) {
      // if no initial elements, load elements
      const unsubscribe = loadElements(
        elementsLoader.queryRef,
        setElements,
        setLastRetrievedElement,
        setSeenLastElement,
        setIsLoading
      );
      unsubscribersRef.current.push(unsubscribe);
    } else {
      // attach flag set, so attach listeners to tweets
      const unsubscribers = attachListenersToElements(
        elements,
        setElements,
        setLastRetrievedElement,
        setIsLoading
      );
      unsubscribers.then((result) => {
        // add unsubscriber functions to unsubsribers reference
        result.forEach((unsubscriber) => {
          unsubscribersRef.current.push(unsubscriber);
        });
      });
    }
  }, [elementsLoader.queryRef]);

  useEffect(() => {
    // run intersectionHandler when last element appears in viewport
    if (!isLoading && lastElementRef.current && !seenLastElement) {
      // create intersection observer
      const observer = new IntersectionObserver(intersectionHandler, {
        threshold: 0.1,
        root: null,
      });

      if (!isLoading) {
        // attach observer to last element in DOM
        if (lastElementRef) {
          observer.observe(lastElementRef.current);
        }
      }

      return () => {
        // cleanup when unmounting or dependencies change
        // disconnect intersection observer
        observer.disconnect();
      };
    }
    return () => {};
  }, [elements, seenLastElement, isLoading]);

  return (
    <div className="tweet-container">
      {isLoading ? (
        <div> loading </div>
      ) : (
        <div>
          {elements &&
            elements.map((element, index) => (
              <ElementComponent
                element={element}
                key={element.key}
                ref={index === elements.length - 1 ? lastElementRef : null}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ScrollableElementsLoader;
