import React from 'react';
import {
  X, Settings, FolderOpen, Monitor, Zap, RotateCcw,
  Upload, Download, HardDrive, Info
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  resolution,
  onChangeResolution,
  fps,
  onChangeFps,
  photoDir,
  videoDir,
  onChangeDir,
  hardwareCapabilities,
  onExportProfile,
  onImportProfile
}) {
  if (!isOpen) return null;

  const resolutionOptions = [
    { value: 'max',  label: 'Max (Auto)' },
    { value: '1080p', label: '1080p (Full HD)' },
    { value: '720p',  label: '720p (HD)' },
    { value: '480p',  label: '480p (SD)' },
    { value: '360p',  label: '360p' },
    { value: '240p',  label: '240p' },
    { value: '144p',  label: '144p (Low)' },
  ];

  const fpsOptions = [
    { value: 'max', label: 'Auto (Max)' },
    { value: '60',  label: '60 FPS' },
    { value: '30',  label: '30 FPS' },
    { value: '24',  label: '24 FPS (Cinema)' },
    { value: '15',  label: '15 FPS' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={18} color="var(--accent)" />
            Settings
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Capture Quality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div className="section-label">Capture Quality</div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Resolution</span>
              <small>Higher = better quality, more CPU</small>
            </div>
            <select
              className="settings-select"
              value={resolution}
              onChange={e => onChangeResolution(e.target.value)}
            >
              {resolutionOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Frame Rate</span>
              <small>Frames per second for video</small>
            </div>
            <select
              className="settings-select"
              value={fps}
              onChange={e => onChangeFps(e.target.value)}
            >
              {fpsOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 16 }} />

        {/* Save Locations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div className="section-label">Save Location</div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Photos &amp; Videos Folder</span>
              <small style={{ wordBreak: 'break-all', maxWidth: 220 }}>{photoDir || 'Auto (~/Pictures/Camza)'}</small>
            </div>
            <button className="btn" onClick={onChangeDir}>
              <FolderOpen size={14} />
              Change
            </button>
          </div>
          {videoDir && videoDir !== photoDir && (
            <div className="settings-row">
              <div className="settings-row-label">
                <span>Videos Folder</span>
                <small style={{ wordBreak: 'break-all', maxWidth: 220 }}>{videoDir}</small>
              </div>
            </div>
          )}
        </div>

        {/* Hardware Info */}
        {hardwareCapabilities && hardwareCapabilities.resolutions?.length > 0 && (
          <>
            <div className="divider" style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="section-label" style={{ margin: 0 }}>Hardware Capabilities</div>
                <span className="hw-tag">V4L2</span>
              </div>
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {hardwareCapabilities.resolutions.slice(0, 8).map(r => (
                    <span key={r} style={{
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: 'var(--bg-surface-3)', color: 'var(--text-2)',
                      border: '1px solid var(--border)'
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Supported FPS: {hardwareCapabilities.fpsList?.join(', ')} fps
                </div>
              </div>
            </div>
          </>
        )}

        <div className="divider" style={{ marginBottom: 16 }} />

        {/* Profile Export/Import */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="section-label">Profile</div>
          <div className="action-row">
            <button className="action-btn secondary" onClick={onExportProfile}>
              <Upload size={14} />
              Export Profile
            </button>
            <button className="action-btn secondary" onClick={onImportProfile}>
              <Download size={14} />
              Import Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
