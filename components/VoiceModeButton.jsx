import { useState } from 'react';

const VoiceModeButton = ({ isVoiceMode, onToggle }) => {
  return (
    <button
      className={`voice-mode-button ${isVoiceMode ? 'active' : ''}`}
      onClick={onToggle}
      aria-label={isVoiceMode ? 'Disable voice mode' : 'Enable voice mode'}
    >
      <span className="material-symbols-rounded">
        {isVoiceMode ? 'volume_up' : 'volume_off'}
      </span>
    </button>
  );
};

export default VoiceModeButton; 
