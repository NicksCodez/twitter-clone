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
  pushUnsubscriber,
  noQuery = false,
}) => {
  // reference to last element in array used for intersection observer
  const lastElementRef = useRef(null);

  // flag to know wether to show page or not
  const [isLoading, setIsLoading] = useState(true);

  const localUnsubbersRef = useRef([]);

  useEffect(() => {
    // signal loading state to parent component
    setLoadedSignal(isLoading);
  }, [isLoading]);

  useEffect(
    // unsubsribe from listeners
    () => () => {
      localUnsubbersRef.current.forEach((unsubscriber) => {
        unsubscriber.then((unsubbersArray) => {
          unsubbersArray.forEach((unsubber) => {
            unsubber();
          });
        });
      });
    },
    []
  );

  useEffect(() => {
    // initial elements loading
    if (elementsLoader.queryRef && !noQuery) {
      let unsubscriber;
      if (!elementsLoader.attach) {
        // if no initial elements, load elements
        unsubscriber = loadElements(
          elementsLoader.queryRef,
          setElements,
          setLastRetrievedElement,
          setSeenLastElement,
          setIsLoading
        );
      } else {
        // attach flag set, so attach listeners to tweets
        unsubscriber = attachListenersToElements(
          elements,
          setElements,
          setLastRetrievedElement,
          setIsLoading
        );
      }
      localUnsubbersRef.current.push(unsubscriber);
      // add unsubscriber to parent array of unsubscribers
      if (
        unsubscriber instanceof Promise ||
        (unsubscriber && typeof unsubscriber.then === 'function')
      ) {
        unsubscriber.then((r) => {
          pushUnsubscriber(r);
        });
      } else {
        pushUnsubscriber(unsubscriber);
      }
    } else if (noQuery) {
      setIsLoading(false);
    }
  }, [elementsLoader.queryRef]);

  useEffect(() => {
    // run intersectionHandler when last element appears in viewport
    if (
      !isLoading &&
      lastElementRef.current &&
      !seenLastElement.current &&
      intersectionHandler
    ) {
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
  }, [elements, seenLastElement.current, isLoading]);

  return (
    <div className="scrollable-elements-loader">
      <div>
        {!isLoading &&
          elements &&
          elements.map((element, index) => (
            <ElementComponent
              element={element}
              key={element.key}
              ref={index === elements.length - 1 ? lastElementRef : null}
            />
          ))}
      </div>
    </div>
  );
};

export default ScrollableElementsLoader;
