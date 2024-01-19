import React, { useEffect, useState } from 'react';

// externals
import ContentEditable from 'react-contenteditable';
import sanitizeHtml from 'sanitize-html';
import { v4 as uuidv4 } from 'uuid';

// css
import './NewTweetBody.css';

// utils
import svgs from '../../../utils/svgs';
import { processTweetText } from '../../../utils/functions';

const NewTweetBody = ({
  tweetContent,
  setTweetContent,
  type,
  setCharsLeft,
  files,
  setFiles,
}) => {
  const initialText =
    type === 'tweet' || type === 'quote'
      ? 'What is happening?'
      : 'Tweet your reply!';

  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // when images are uploaded, create object URLS for them and add to previews
    if (!files) return;
    const tmp = [];
    for (let i = 0; i < files.length; i++) {
      tmp.push(URL.createObjectURL(files[i]));
    }
    const objectUrls = tmp;
    setPreviews(objectUrls);

    // free memory
    return () => {
      for (let i = 0; i < objectUrls.length; i++) {
        URL.revokeObjectURL(objectUrls[i]);
      }
    };
  }, [files]);

  const handleTweetTextChange = (evt) => {
    // tweet
    const maxChars = 280;

    const text = evt.currentTarget.textContent;

    setCharsLeft(280 - text.length);

    // process text separately, allowed max chars, then the remaining chars
    let allowedText = text.slice(0, maxChars);

    // process allowed text
    allowedText = processTweetText(allowedText);

    // process remaining text
    let remainingText = text.slice(maxChars);

    remainingText = processTweetText(remainingText);

    // set tweet content to the processed content
    const contentEditableDiv = `${allowedText}${
      remainingText.length > 0
        ? `<span class="red-background">${remainingText}</span>`
        : ''
    }`;

    const sanitizeConf = {
      allowedTags: ['b', 'i', 'a', 'p', 'span', 'img'],
      allowedAttributes: {
        a: ['href', 'class'],
        span: ['class'],
        img: ['alt', 'src', 'style'],
      },
    };

    setTweetContent(sanitizeHtml(contentEditableDiv, sanitizeConf));
  };

  return (
    <div className="new-tweet-body">
      {tweetContent === '' && (
        <div className="new-tweet-placeholder">{initialText}</div>
      )}
      <ContentEditable
        spellCheck="false"
        className="new-tweet-textarea"
        onChange={handleTweetTextChange}
        html={tweetContent}
      />
      <div className="new-tweet-img-wrp">
        {previews &&
          previews.map((pic) => (
            <div key={uuidv4()}>
              <img src={pic} alt="posted" />
              <button
                type="button"
                onClick={() => {
                  // index of preview is index of file, get it and delete file
                  const index = previews.findIndex(
                    (preview) => preview === pic
                  );
                  setFiles((prevFiles) => {
                    const updatedFiles = [...prevFiles];
                    if (index !== -1) {
                      updatedFiles.splice(index, 1);
                    }
                    return updatedFiles;
                  });
                }}
              >
                <svg viewBox="0 0 24 24">
                  <path d={svgs.x} />
                </svg>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NewTweetBody;
