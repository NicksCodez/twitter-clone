import React from 'react';

// css
import './HomeHeader.css';

// components
import SecondRow from '../homeHeaderComponents/SecondRow/SecondRow';
import HomeNewTweetsButton from '../HomeNewTweetsButton/HomeNewTweetsButton';

// utils
import { clickHandlerAccount } from '../../utils/functions';
import PageHeader from '../PageHeader/PageHeader';

// images
import DefaultProfile from '../../assets/images/default_profile.png';

// context
// import { useAppContext } from '../../contextProvider/ContextProvider';
import { useUserContext } from '../../contextProvider/ContextProvider';
import svgs from '../../utils/svgs';

const HomeHeader = ({ homeLoading, attachListenersToTweets }) => {
  // const { user } = useAppContext();
  const { user } = useUserContext();

  // build left element
  const leftElement = (
    <button
      type="button"
      className="image-wrapper"
      onClick={clickHandlerAccount}
    >
      <img
        src={user && user.profileImg ? user.profileImg : DefaultProfile}
        alt="profile"
        className="u-round"
      />
    </button>
  );

  // build middle element
  const middleElement = (
    <button type="button" className="svg-wrapper">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g>
          <path d={svgs.bird} fill="var(--clr-bg-blue)" />
        </g>
      </svg>
    </button>
  );

  // build right element
  const rightElement = <div className="fake" />;

  return (
    <div className="home-header">
      <PageHeader
        leftElements={[leftElement]}
        middleElements={[middleElement]}
        rightElements={[rightElement]}
      />
      <SecondRow />
      {!homeLoading && (
        <HomeNewTweetsButton
          attachListenersToTweets={attachListenersToTweets}
        />
      )}
    </div>
  );
};

export default HomeHeader;
