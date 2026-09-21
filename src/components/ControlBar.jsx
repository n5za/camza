import React from 'react';
import { Camera, Video, Timer, Image, Zap } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaHelper';

export default function ControlBar({
  mode,
  onModeChange,
  isRecording,
  recordingTime,
  onCapture,
  countdown,
  onCycleCountdown,
  latestMedia,
  onOpenGallery,
  burstMode,
  onToggleBurst
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2, '0')}`;
  };

  const latestSrc = latestMedia ? getMediaUrl(latestMedia.path) : null;

  const countdownLabel = countdown === 0 ? '' : `${countdown}s`;

  return (
    <div className="floating-control-bar">
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Gallery Thumb */}
        <button
          className="gallery-thumb-btn"
          title="Open Gallery (G)"
          onClick={onOpenGallery}
        >
          {latestMedia ? (
            latestMedia.type === 'photo' ? (
              <img src={latestSrc} alt="Latest" />
            ) : (
              <video src={latestSrc} muted />
            )
          ) : (
            <Image size={18} color="var(--text-3)" />
          )}
        </button>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'photo' ? 'active' : ''}`}
            onClick={() => onModeChange('photo')}
            disabled={isRecording}
          >
            <Camera size={13} />
            Photo
          </button>
          <button
            className={`mode-btn video ${mode === 'video' ? 'active' : ''}`}
            onClick={() => onModeChange('video')}
            disabled={isRecording}
          >
            <Video size={13} />
            Video
          </button>
        </div>
      </div>

      {/* Center — Main Capture Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button
          className={`capture-btn ${isRecording ? 'recording' : ''}`}
          onClick={onCapture}
          title={isRecording
            ? 'Stop Recording (R)'
            : mode === 'photo'
              ? burstMode ? 'Burst 5 Photos (Space)' : 'Take Photo (Space)'
              : 'Start Recording (R)'
          }
        >
          <div className="capture-btn-inner" />
        </button>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Recording timer OR controls */}
        {isRecording ? (
          <div className="recording-badge">
            <div className="record-dot" />
            <span>{formatTime(recordingTime)}</span>
          </div>
        ) : (
          <>
            {/* Burst Mode (Photo only) */}
            {mode === 'photo' && (
              <button
                className={`icon-btn ${burstMode ? 'active' : ''}`}
                title={burstMode ? 'Burst Mode ON (5 shots)' : 'Enable Burst Mode'}
                onClick={onToggleBurst}
                style={burstMode ? { color: 'var(--accent)' } : {}}
              >
                <Zap size={17} />
                {burstMode && (
                  <span className="countdown-badge">×5</span>
                )}
              </button>
            )}

            {/* Countdown Timer */}
            <button
              className="icon-btn"
              title={`Countdown: ${countdown === 0 ? 'Off' : countdown + 's'}`}
              onClick={onCycleCountdown}
              style={countdown > 0 ? { color: 'var(--accent)' } : {}}
            >
              <Timer size={17} />
              {countdown > 0 && (
                <span className="countdown-badge">{countdownLabel}</span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
