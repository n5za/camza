import React, { useState, useEffect, useRef, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import TopBar from './components/TopBar';
import SidebarNav from './components/SidebarNav';
import ControlBar from './components/ControlBar';
import FilterPanel from './components/FilterPanel';
import ManualAdjustPanel from './components/ManualAdjustPanel';
import SettingsModal from './components/SettingsModal';
import GalleryPanel from './components/GalleryPanel';
import LightboxModal from './components/LightboxModal';
import ToastNotification from './components/ToastNotification';
import CountdownOverlay from './components/CountdownOverlay';
import FlashOverlay from './components/FlashOverlay';
import { soundEffects } from './utils/soundEffects';

// ─── Burst Mode Config ───────────────────────────────────────
const BURST_COUNT = 5;
const BURST_INTERVAL_MS = 400;

export default function App() {
  // ── Camera & Device State ────────────────────────────────
  const [devices, setDevices]                       = useState([]);
  const [selectedDevice, setSelectedDevice]         = useState('');
  const [hardwareCapabilities, setHardwareCapabilities] = useState(null);
  const [hardwareControls, setHardwareControls]     = useState([]);

  // ── Viewport Settings ────────────────────────────────────
  const [resolution, setResolution]   = useState('max');
  const [fps, setFps]                 = useState('max');
  const [fitMode, setFitMode]         = useState('fit');
  const [isMirrored, setIsMirrored]   = useState(false);
  const [zoom, setZoom]               = useState(1.0);
  const [showGrid, setShowGrid]       = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme]             = useState('dark');

  // ── Sound & Storage ─────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [photoDir, setPhotoDir]         = useState('');
  const [videoDir, setVideoDir]         = useState('');

  // ── Filter & Enhancement State ───────────────────────────
  const [filterId, setFilterId]             = useState('normal');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [isProEnhancerActive, setIsProEnhancerActive] = useState(false);
  const [manualControls, setManualControls] = useState({
    brightness: 0, contrast: 0, saturation: 0,
    sharpness: 0,  ringLight: 0, hdrAntiBlowout: false,
    isProEnhancerActive: false
  });

  // ── Capture State ────────────────────────────────────────
  const [mode, setMode]                   = useState('photo'); // 'photo' | 'video'
  const [countdown, setCountdown]         = useState(0);       // 0, 3, 5
  const [activeCountdown, setActiveCountdown] = useState(0);
  const [isRecording, setIsRecording]     = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isFlashing, setIsFlashing]       = useState(false);
  const [burstMode, setBurstMode]         = useState(false);
  const [isBursting, setIsBursting]       = useState(false);

  // ── UI Panel State ───────────────────────────────────────
  const [activeDrawer, setActiveDrawer]   = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [galleryItems, setGalleryItems]   = useState([]);
  const [lightboxItem, setLightboxItem]   = useState(null);
  const [toasts, setToasts]               = useState([]);

  const cameraRef          = useRef(null);
  const recordingTimer     = useRef(null);

  // ── Toast Helper ─────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
  }, []);

  // ── Sound Sync ───────────────────────────────────────────
  useEffect(() => { soundEffects.setSoundEnabled(soundEnabled); }, [soundEnabled]);

  // ── Fullscreen Sync ──────────────────────────────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ── Theme ────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Hardware Controls ────────────────────────────────────
  const fetchHardwareControls = useCallback(async (devPath) => {
    if (devPath && window.camzaAPI?.getV4L2HardwareControls) {
      const res = await window.camzaAPI.getV4L2HardwareControls(devPath);
      if (res.success) setHardwareControls(res.controls);
    }
  }, []);

  const handleSetHardwareControl = async (control, value) => {
    if (selectedDevice && window.camzaAPI?.setV4L2HardwareControl) {
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control, value });
      fetchHardwareControls(selectedDevice);
    }
  };

  // ── Anti-Blowout ─────────────────────────────────────────
  const handleApplyAntiBlowout = async () => {
    setFilterId('hdr_anti_blowout');
    setManualControls(prev => ({
      ...prev, hdrAntiBlowout: true,
      brightness: -15, contrast: 25, sharpness: 50, ringLight: 20
    }));
    if (selectedDevice && window.camzaAPI?.setV4L2HardwareControl) {
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control: 'auto_exposure', value: 1 });
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control: 'exposure_time_absolute', value: 110 });
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control: 'gain', value: 1 });
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control: 'backlight_compensation', value: 1 });
      await window.camzaAPI.setV4L2HardwareControl({ devicePath: selectedDevice, control: 'gamma', value: 130 });
      fetchHardwareControls(selectedDevice);
    }
    addToast('Anti-Blowout Fix Applied!', 'success');
  };

  // ── Pro Enhancer Toggle ──────────────────────────────────
  const handleToggleProEnhancer = () => {
    setIsProEnhancerActive(prev => {
      const next = !prev;
      if (next) {
        setFilterId('pro_clean');
        setManualControls(c => ({ ...c, sharpness: 45, ringLight: 25, contrast: 15, saturation: 10, isProEnhancerActive: true }));
        addToast('Pro HD Camera Enhancer Activated ✨', 'success');
      } else {
        setFilterId('normal');
        setManualControls(c => ({ ...c, sharpness: 0, ringLight: 0, contrast: 0, saturation: 0, hdrAntiBlowout: false, isProEnhancerActive: false }));
        addToast('Pro HD Enhancer Deactivated', 'info');
      }
      return next;
    });
  };

  // ── Auto Magic ───────────────────────────────────────────
  const handleApplyAutoMagic = () => {
    setIsProEnhancerActive(true);
    setFilterId('pro_clean');
    setManualControls({ brightness: 5, contrast: 20, saturation: 15, sharpness: 50, ringLight: 30, hdrAntiBlowout: false, isProEnhancerActive: true });
    addToast('Auto HD Clean & Sharpness Boost Applied! 🪄', 'success');
  };

  // ── Device Discovery ─────────────────────────────────────
  const refreshDevices = useCallback(async () => {
    let devList = [];

    if (window.camzaAPI?.getV4L2Devices) {
      const res = await window.camzaAPI.getV4L2Devices();
      if (res.success && res.devices.length > 0) {
        devList = res.devices.map(d => ({
          deviceId: d.path, label: `${d.name} (${d.path})`, path: d.path
        }));
      }
    }

    if (navigator.mediaDevices?.enumerateDevices) {
      try {
        const mediaDevs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = mediaDevs.filter(d => d.kind === 'videoinput');
        if (devList.length === 0) {
          devList = videoDevs.map((d, i) => ({
            deviceId: d.deviceId, label: d.label || `Camera ${i + 1}`
          }));
        }
      } catch {}
    }

    setDevices(devList);
    if (devList.length > 0 && !selectedDevice) {
      setSelectedDevice(devList[0].deviceId || devList[0].path);
    } else if (devList.length === 0) {
      setSelectedDevice('');
    }
  }, [selectedDevice]);

  // ── Gallery ──────────────────────────────────────────────
  const refreshGallery = useCallback(async (pDir = photoDir, vDir = videoDir) => {
    if (window.camzaAPI?.listGallery) {
      const res = await window.camzaAPI.listGallery({ photoDir: pDir, videoDir: vDir });
      if (res.success) setGalleryItems(res.items);
    }
  }, [photoDir, videoDir]);

  // ── App Init ─────────────────────────────────────────────
  useEffect(() => {
    refreshDevices();
    if (window.camzaAPI?.getPaths) {
      window.camzaAPI.getPaths().then(paths => {
        setPhotoDir(paths.photoDir);
        setVideoDir(paths.videoDir);
        refreshGallery(paths.photoDir, paths.videoDir);
      });
    } else {
      refreshGallery();
    }
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      if (window.camzaAPI?.getV4L2Capabilities) {
        window.camzaAPI.getV4L2Capabilities(selectedDevice).then(res => {
          if (res.success) setHardwareCapabilities(res);
        });
      }
      fetchHardwareControls(selectedDevice);
    }
  }, [selectedDevice, fetchHardwareControls]);

  // ── Countdown ────────────────────────────────────────────
  const cycleCountdown = () => {
    setCountdown(c => c === 0 ? 3 : c === 3 ? 5 : 0);
  };

  // ── Core Capture ─────────────────────────────────────────
  const executePhotoSnap = useCallback(async (silent = false) => {
    if (!cameraRef.current) return;

    soundEffects.playShutterSound();
    if (!silent) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 300);
    }

    const base64Data = cameraRef.current.snapPhoto();
    if (!base64Data) return;

    if (window.camzaAPI?.savePhoto) {
      const res = await window.camzaAPI.savePhoto({ base64Data, customDir: photoDir, format: 'png' });
      if (res.success) {
        addToast(`📷 Saved: ${res.fileName}`, 'success');
        refreshGallery(photoDir, videoDir);
      } else {
        addToast(`Save failed: ${res.error}`, 'warning');
      }
    } else {
      const item = {
        id: `photo_${Date.now()}`, name: `camza_${Date.now()}.png`,
        path: base64Data, type: 'photo', size: Math.round(base64Data.length * 0.75), mtime: Date.now()
      };
      setGalleryItems(prev => [item, ...prev]);
      if (!silent) addToast('Photo captured!', 'success');
    }
  }, [photoDir, videoDir, refreshGallery, addToast]);

  // ── Burst Mode ───────────────────────────────────────────
  const executeBurst = useCallback(async () => {
    if (isBursting) return;
    setIsBursting(true);
    addToast(`Burst mode: ${BURST_COUNT} photos! 📸`, 'info');

    for (let i = 0; i < BURST_COUNT; i++) {
      await executePhotoSnap(i > 0); // only flash on first
      if (i < BURST_COUNT - 1) {
        await new Promise(r => setTimeout(r, BURST_INTERVAL_MS));
      }
    }

    setIsBursting(false);
    addToast(`Burst complete — ${BURST_COUNT} photos saved`, 'success');
  }, [isBursting, executePhotoSnap, addToast]);

  // ── Recording ────────────────────────────────────────────
  const executeStartRecording = () => {
    if (!cameraRef.current) return;
    const started = cameraRef.current.startRecording();
    if (started) {
      soundEffects.playRecordStartSound();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimer.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      addToast('● Video recording started', 'info');
    }
  };

  const executeStopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    clearInterval(recordingTimer.current);
    soundEffects.playRecordStopSound();
    setIsRecording(false);

    const arrayBuffer = await cameraRef.current.stopRecording();
    if (arrayBuffer && window.camzaAPI?.saveVideo) {
      const res = await window.camzaAPI.saveVideo({ arrayBuffer, customDir: videoDir, format: 'webm' });
      if (res.success) {
        addToast(`🎬 Video saved: ${res.fileName}`, 'success');
        refreshGallery(photoDir, videoDir);
      } else {
        addToast(`Save failed: ${res.error}`, 'warning');
      }
    } else if (arrayBuffer) {
      const blob = new Blob([arrayBuffer], { type: 'video/webm' });
      const item = {
        id: `video_${Date.now()}`, name: `camza_${Date.now()}.webm`,
        path: URL.createObjectURL(blob), type: 'video', size: blob.size, mtime: Date.now()
      };
      setGalleryItems(prev => [item, ...prev]);
      addToast('Video recorded!', 'success');
    }
  };

  // ── Main Capture Trigger ─────────────────────────────────
  const handleTriggerCapture = useCallback(() => {
    if (isRecording) {
      executeStopRecording();
      return;
    }

    const doCapture = () => {
      if (mode === 'photo') {
        if (burstMode) executeBurst();
        else executePhotoSnap();
      } else {
        executeStartRecording();
      }
    };

    if (countdown > 0) {
      let current = countdown;
      setActiveCountdown(current);
      soundEffects.playCountdownBeep(false);

      const timer = setInterval(() => {
        current -= 1;
        if (current > 0) {
          setActiveCountdown(current);
          soundEffects.playCountdownBeep(false);
        } else {
          clearInterval(timer);
          setActiveCountdown(0);
          soundEffects.playCountdownBeep(true);
          doCapture();
        }
      }, 1000);
    } else {
      doCapture();
    }
  }, [isRecording, countdown, mode, burstMode, executePhotoSnap, executeBurst]);

  // ── Keyboard Shortcuts ───────────────────────────────────
  useEffect(() => {
    const onKeyDown = e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTriggerCapture();
          break;
        case 'KeyR':
          e.preventDefault();
          if (isRecording) executeStopRecording();
          else { setMode('video'); setTimeout(() => executeStartRecording(), 50); }
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMirrored(p => !p);
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyS':
          e.preventDefault();
          setIsSettingsOpen(p => !p);
          break;
        case 'KeyG':
          e.preventDefault();
          setActiveDrawer(p => p === 'gallery' ? null : 'gallery');
          break;
        case 'KeyB':
          e.preventDefault();
          if (mode === 'photo') setBurstMode(p => !p);
          break;
        case 'Escape':
          setActiveDrawer(null);
          setLightboxItem(null);
          setIsSettingsOpen(false);
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRecording, countdown, mode, burstMode, handleTriggerCapture]);

  // ── Gallery Actions ──────────────────────────────────────
  const handleDeleteItem = async (item) => {
    if (window.camzaAPI?.deleteFile && !item.path.startsWith('data:') && !item.path.startsWith('blob:')) {
      const res = await window.camzaAPI.deleteFile(item.path);
      if (res.success) {
        addToast(`Deleted ${item.name}`, 'info');
        setLightboxItem(null);
        refreshGallery(photoDir, videoDir);
      }
    } else {
      setGalleryItems(prev => prev.filter(i => i.id !== item.id));
      setLightboxItem(null);
      addToast(`Deleted ${item.name}`, 'info');
    }
  };

  const handleOpenFolder = (filePath) => {
    if (window.camzaAPI?.openFolder) window.camzaAPI.openFolder(filePath || photoDir);
  };

  const handleSelectCustomDir = async () => {
    if (window.camzaAPI?.selectDirectory) {
      const res = await window.camzaAPI.selectDirectory();
      if (res.success && res.path) {
        setPhotoDir(res.path);
        setVideoDir(res.path);
        refreshGallery(res.path, res.path);
        addToast(`Save folder: ${res.path}`, 'info');
      }
    }
  };

  // ── Profile Export / Import ──────────────────────────────
  const handleExportProfile = () => {
    const profile = {
      app: 'Camza', version: '4.0.0', resolution, fps, filterId, filterIntensity,
      manualControls, fitMode, isMirrored, soundEnabled, zoom, showGrid, isProEnhancerActive, theme
    };
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement('a');
    a.href = data; a.download = 'camza_profile.json';
    document.body.appendChild(a); a.click(); a.remove();
    addToast('Profile exported as camza_profile.json', 'success');
  };

  const handleImportProfile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const d = JSON.parse(evt.target.result);
          if (d.resolution)               setResolution(d.resolution);
          if (d.fps)                       setFps(d.fps);
          if (d.filterId)                  setFilterId(d.filterId);
          if (d.filterIntensity != null)   setFilterIntensity(d.filterIntensity);
          if (d.manualControls)            setManualControls(d.manualControls);
          if (d.fitMode)                   setFitMode(d.fitMode);
          if (d.isMirrored != null)        setIsMirrored(d.isMirrored);
          if (d.soundEnabled != null)      setSoundEnabled(d.soundEnabled);
          if (d.zoom != null)              setZoom(d.zoom);
          if (d.showGrid != null)          setShowGrid(d.showGrid);
          if (d.isProEnhancerActive != null) setIsProEnhancerActive(d.isProEnhancerActive);
          if (d.theme)                     setTheme(d.theme);
          addToast('Profile imported successfully ✓', 'success');
        } catch {
          addToast('Invalid profile JSON file', 'warning');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={`app-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Top Bar */}
      <TopBar
        devices={devices}
        selectedDevice={selectedDevice}
        onSelectDevice={setSelectedDevice}
        onRefreshDevices={refreshDevices}
        fitMode={fitMode}
        onChangeFitMode={setFitMode}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored(p => !p)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(p => !p)}
        resolution={resolution}
        fps={fps}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(p => !p)}
        zoom={zoom}
        onChangeZoom={setZoom}
        isProEnhancerActive={isProEnhancerActive}
        onToggleProEnhancer={handleToggleProEnhancer}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRecording={isRecording}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Nav */}
        <SidebarNav
          activeDrawer={activeDrawer}
          onToggleDrawer={d => setActiveDrawer(p => p === d ? null : d)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Camera Viewport */}
        <CameraPreview
          ref={cameraRef}
          deviceId={selectedDevice}
          resolution={resolution}
          fps={fps}
          filterId={filterId}
          filterIntensity={filterIntensity}
          manualControls={manualControls}
          fitMode={fitMode}
          isMirrored={isMirrored}
          zoom={zoom}
          showGrid={showGrid}
          onAddToast={addToast}
          onRefreshDevices={refreshDevices}
        />

        {/* Floating Control Bar */}
        <ControlBar
          mode={mode}
          onModeChange={setMode}
          isRecording={isRecording}
          recordingTime={recordingTime}
          onCapture={handleTriggerCapture}
          countdown={countdown}
          onCycleCountdown={cycleCountdown}
          latestMedia={galleryItems[0]}
          onOpenGallery={() => setActiveDrawer('gallery')}
          burstMode={burstMode}
          onToggleBurst={() => setBurstMode(p => !p)}
        />

        {/* Side Drawers */}
        {activeDrawer === 'filters' && (
          <FilterPanel
            activeFilter={filterId}
            onChangeFilter={id => {
              setFilterId(id);
              if (id === 'pro_clean' || id === 'hdr_anti_blowout') setIsProEnhancerActive(true);
            }}
            filterIntensity={filterIntensity}
            onChangeIntensity={setFilterIntensity}
            videoElement={cameraRef.current?.getVideoElement()}
            manualControls={manualControls}
            isMirrored={isMirrored}
            onClose={() => setActiveDrawer(null)}
          />
        )}

        {activeDrawer === 'adjustments' && (
          <ManualAdjustPanel
            manualControls={manualControls}
            onChangeControl={(key, val) => setManualControls(p => ({ ...p, [key]: val }))}
            onReset={() => setManualControls({
              brightness: 0, contrast: 0, saturation: 0,
              sharpness: 0, ringLight: 0, hdrAntiBlowout: false, isProEnhancerActive: false
            })}
            onApplyAutoMagic={handleApplyAutoMagic}
            onApplyAntiBlowout={handleApplyAntiBlowout}
            hardwareControls={hardwareControls}
            onChangeHardwareControl={handleSetHardwareControl}
            onClose={() => setActiveDrawer(null)}
          />
        )}

        {activeDrawer === 'gallery' && (
          <GalleryPanel
            items={galleryItems}
            onSelectItem={setLightboxItem}
            onRefresh={() => refreshGallery(photoDir, videoDir)}
            onOpenFolder={() => handleOpenFolder(photoDir)}
            onClose={() => setActiveDrawer(null)}
          />
        )}

        {/* Burst active badge */}
        {isBursting && (
          <div className="burst-active-badge">📸 Burst Shooting…</div>
        )}

        {/* Countdown Overlay */}
        <CountdownOverlay count={activeCountdown} />

        {/* Flash Overlay */}
        <FlashOverlay active={isFlashing} />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        resolution={resolution}
        onChangeResolution={setResolution}
        fps={fps}
        onChangeFps={setFps}
        photoDir={photoDir}
        videoDir={videoDir}
        onChangeDir={handleSelectCustomDir}
        hardwareCapabilities={hardwareCapabilities}
        onExportProfile={handleExportProfile}
        onImportProfile={handleImportProfile}
      />

      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onDelete={handleDeleteItem}
        onOpenFolder={handleOpenFolder}
        onOpenFile={path => window.camzaAPI?.openFile(path)}
      />

      {/* Toasts */}
      <ToastNotification toasts={toasts} />
    </div>
  );
}
