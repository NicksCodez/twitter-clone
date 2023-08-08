import React from 'react';

// externals
import { v4 as uuidv4 } from 'uuid';

// css
import './NewTweetMedia.css';

// utils
import svgs from '../../../utils/svgs';

const NewTweetMedia = ({ setFiles }) => {
  // on desktop, could have 2 components shown at the same time, so make sure ids are different
  const uniqueId = uuidv4();

  return (
    <div className="new-tweet-media">
      <label htmlFor={`image-upload${uniqueId}`}>
        <input
          id={`image-upload${uniqueId}`}
          name="image-upload"
          type="file"
          accept="image/jpg, image/jpeg, image/png"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setFiles(e.target.files);
            }
          }}
        />
        <svg viewBox="0 0 24 24">
          <path d={svgs.image} />
        </svg>
      </label>
    </div>
  );
};

export default NewTweetMedia;
