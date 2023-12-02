import React, { useEffect, useState } from 'react';

// css
import './SetupProfileHeader.css';

// utils
import svgs from '../../../utils/svgs';

// components
import SkipNextButton from '../SkipNextButton/SkipNextButton';
import TitleSubtitle from '../TitleSubtitle/TiteSubtitle';

const SetupProfileHeader = ({
  user,
  profileFile,
  file,
  setFile,
  currentStep,
  setCurrentStep,
}) => {
  const [profilePreview, setProfilePreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);

  useEffect(() => {
    // when image is uploaded, create object URL for it to use as preview
    if (!profileFile) return;
    console.log({ profileFile });
    const tmp = URL.createObjectURL(profileFile[0]);
    setProfilePreview(tmp);

    // free memory
    return () => {
      URL.revokeObjectURL(tmp);
    };
  }, [profileFile]);

  useEffect(() => {
    // when image is uploaded, create object URL for it to use as preview
    if (!file) return;
    console.log({ file });
    const tmp = URL.createObjectURL(file[0]);
    setHeaderPreview(tmp);

    // free memory
    return () => {
      URL.revokeObjectURL(tmp);
    };
  }, [file]);

  return (
    <div id="setup-profile-header">
      <TitleSubtitle
        title="Pick a header"
        subtitle={
          'People who visit your profile will see it.\nShow your style.'
        }
      />
      <div className="input-zone">
        <div className="relative">
          {file !== null && (
            <img
              src={headerPreview}
              alt="profile header"
              className="user-header"
            />
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
        {profileFile ? (
          <img
            src={profilePreview}
            alt="user profile"
            className="user-profile u-round"
          />
        ) : (
          <img
            src={user.profileImg}
            alt="user profile"
            className="user-profile u-round"
          />
        )}
        <div>
          <div className="profile-name">{user.name}</div>
          <div className="profile-tag">@{user.tag}</div>
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

export default SetupProfileHeader;
