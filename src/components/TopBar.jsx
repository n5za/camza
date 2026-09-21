import React from 'react';
import {
  Camera, RefreshCw, FlipHorizontal, Maximize2, Sun, Moon, Settings,
  Volume2, VolumeX, Grid, ZoomIn, Wand2, Maximize, Minimize, ZoomOut
} from 'lucide-react';

export default function TopBar({
  devices,
  selectedDevice,
  onSelectDevice,
  onRefreshDevices,
  fitMode,
  onChangeFitMode,
  isMirrored,
  onToggleMirror,
  soundEnabled,
  onToggleSound,
  resolution,
  fps,
  showGrid,
  onToggleGrid,
  zoom,
  onChangeZoom,
  isProEnhancerActive,
  onToggleProEnhancer,
  isFullscreen,
  onToggleFullscreen,
  theme,
  onToggleTheme,
  onOpenSettings,
  isRecording
}) {
  const fitModes = ['fit', 'fill', 'stretch'];
  const fitLabels = { fit: 'Fit', fill: 'Fill', stretch: '1:1' };
  const zoomSteps = [1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0];

  const cycleZoomUp = () => {
    const idx = zoomSteps.findIndex(z => z >= zoom);
    if (idx < zoomSteps.length - 1) onChangeZoom(zoomSteps[idx + 1]);
    else onChangeZoom(zoomSteps[zoomSteps.length - 1]);
  };

  const cycleZoomDown = () => {
    const idx = zoomSteps.findIndex(z => z >= zoom);
    if (idx > 0) onChangeZoom(zoomSteps[idx - 1]);
    else onChangeZoom(1.0);
  };

  const cycleFit = () => {
    const idx = fitModes.indexOf(fitMode);
    onChangeFitMode(fitModes[(idx + 1) % fitModes.length]);
  };

  return (
    <header className="topbar">
      {/* LEFT */}
      <div className="topbar-left">
        {/* Brand */}
        <div className="app-brand">
          <div className="app-brand-icon">
            <Camera size={16} color="#000" />
          </div>
          <span>Camza</span>
        </div>

        <div className="topbar-divider" />

        {/* Camera Selector */}
        <div className="camera-selector">
          <Camera size={14} color="var(--text-3)" style={{ flexShrink: 0 }} />
          <select
            className="camera-select"
            value={selectedDevice || ''}
            onChange={(e) => onSelectDevice(e.target.value)}
          >
            {devices.length === 0 ? (
              <option value="">No Camera Found</option>
            ) : (
              devices.map((dev) => (
                <option key={dev.deviceId || dev.path} value={dev.deviceId || dev.path}>
                  {dev.label || dev.name || 'Camera Device'}
                </option>
              ))
            )}
          </select>
          <button
            className="icon-btn"
            title="Refresh Camera Devices"
            onClick={onRefreshDevices}
            style={{ width: 26, height: 26 }}
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Pro HD Badge */}
        <button
          className={`pro-badge ${isProEnhancerActive ? 'active' : ''}`}
          onClick={onToggleProEnhancer}
          title="Toggle Pro HD Camera Enhancer"
        >
          <Wand2 size={13} />
          {isProEnhancerActive ? 'Pro HD ✓' : 'Pro HD'}
        </button>
      </div>

      {/* CENTER — Live Status */}
      <div className="topbar-center">
        <div className="status-badge">
          <span className="status-dot" />
          <span>
            {resolution.toUpperCase()} · {fps === 'max' ? 'AUTO FPS' : `${fps}FPS`}
            {zoom > 1.0 && ` · ${zoom.toFixed(1)}×`}
            {fitMode !== 'fit' && ` · ${fitLabels[fitMode]}`}
          </span>
        </div>
        {isRecording && (
          <div className="status-badge" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'rgba(255,69,58,0.08)' }}>
            <span className="record-dot" style={{ width: 5, height: 5, background: 'var(--danger)' }} />
            RECORDING
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="topbar-right">
        {/* Grid */}
        <button
          className={`icon-btn ${showGrid ? 'active' : ''}`}
          title="Rule of Thirds Grid (G)"
          onClick={onToggleGrid}
        >
          <Grid size={17} />
        </button>

        {/* Zoom */}
        {zoom > 1.0 && (
          <button className="icon-btn" title="Zoom Out" onClick={cycleZoomDown}>
            <ZoomOut size={17} />
          </button>
        )}
        <button
          className="icon-btn"
          title={`Digital Zoom: ${zoom.toFixed(1)}×`}
          onClick={cycleZoomUp}
          style={zoom > 1.0 ? { color: 'var(--accent)' } : {}}
        >
          <ZoomIn size={17} />
          {zoom > 1.0 && <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{zoom.toFixed(1)}×</span>}
        </button>

        {/* Fit Mode */}
        <button
          className="icon-btn"
          title={`Aspect Mode: ${fitMode}`}
          onClick={cycleFit}
          style={fitMode !== 'fit' ? { color: 'var(--accent)' } : {}}
        >
          <Maximize2 size={17} />
          {fitMode !== 'fit' && (
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {fitLabels[fitMode]}
            </span>
          )}
        </button>

        {/* Mirror */}
        <button
          className={`icon-btn ${isMirrored ? 'active' : ''}`}
          title="Flip Mirror (M)"
          onClick={onToggleMirror}
        >
          <FlipHorizontal size={17} />
        </button>

        <div className="topbar-divider" />

        {/* Sound */}
        <button
          className="icon-btn"
          title={soundEnabled ? 'Mute' : 'Unmute'}
          onClick={onToggleSound}
        >
          {soundEnabled
            ? <Volume2 size={17} />
            : <VolumeX size={17} color="var(--danger)" />
          }
        </button>

        {/* Theme */}
        <button
          className="icon-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Fullscreen */}
        <button
          className={`icon-btn ${isFullscreen ? 'active' : ''}`}
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </button>

        <div className="topbar-divider" />

        {/* Settings */}
        <button
          className="icon-btn"
          title="Settings (S)"
          onClick={onOpenSettings}
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
