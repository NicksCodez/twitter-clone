import React, { useEffect, useState } from 'react';

// css
import './SetupProfilePicture.css';

// utils
import svgs from '../../../utils/svgs';

// components
import SkipNextButton from '../SkipNextButton/SkipNextButton';
import TitleSubtitle from '../TitleSubtitle/TiteSubtitle';

const SetupProfilePicture = ({
  user,
  file,
  setFile,
  currentStep,
  setCurrentStep,
}) => {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    // when image is uploaded, create object URL for it to use as preview
    if (!file) return;
    const tmp = URL.createObjectURL(file[0]);
    setPreview(tmp);

    // free memory
    return () => {
      URL.revokeObjectURL(tmp);
    };
  }, [file]);
  return (
    <div id="setup-profile-picture">
      <TitleSubtitle
        title="Pick a profile picture"
        subtitle="Have a favourite selfie? Upload it now."
      />
      <div className="input-zone">
        <div className="relative">
          {file ? (
            <img src={preview} alt="user profile" className="u-round" />
          ) : (
            <img src={user.profileImg} alt="user profile" className="u-round" />
          )}

          <div className="absolute-centered">
            <label htmlFor="setup-profile-image-upload">
              <input
                id="setup-profile-image-upload"
                name="image-upload"
                type="file"
                accept="image/jpg, image/jpeg, image/png"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files);
                  }
                }}
              />
              <svg viewBox="0 0 24 24" className="u-round">
                <path d={svgs.camera} />
              </svg>
            </label>
            {file && (
              <button type="button" onClick={() => setFile(null)}>
                <svg viewBox="0 0 24 24" className="u-round">
                  <path d={svgs.x} />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <SkipNextButton
        inputSelected={file}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default SetupProfilePicture;
