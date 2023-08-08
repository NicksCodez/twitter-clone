import React from 'react';

// utils
import svgs from '../../../utils/svgs';

// css
import './NewTweetActions.css';

const NewTweetActions = ({ charsLeft, progressColor, progressSecondColor }) => (
  <div className="new-tweet-actions">
    {charsLeft < 280 ? (
      <div>
        <div
          className="circular-progress"
          style={{
            background: `conic-gradient(${progressColor} ${
              charsLeft > 0 ? (280 - charsLeft) * 1.285 : 360
            }deg, ${progressSecondColor} 0deg)`,
          }}
        >
          {charsLeft <= 20 ? (
            <span
              className="circular-progress-characters-left"
              style={{
                color: `${
                  charsLeft <= 0
                    ? 'rgb(244, 33, 46)'
                    : 'var(--clr-font-secondary)'
                }`,
              }}
            >
              {charsLeft}
            </span>
          ) : null}
        </div>
        <div className="vertical-separator" />
        <div className="new-tweet-add">
          <button type="button">
            <svg viewBox="0 0 24 24">
              <path d={svgs.plus} />
            </svg>
          </button>
        </div>
      </div>
    ) : null}
  </div>
);

export default NewTweetActions;
