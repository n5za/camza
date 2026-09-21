import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { drawFilteredFrame } from '../utils/filterShaders';
import { CameraOff, RefreshCw } from 'lucide-react';

const CameraPreview = forwardRef(function CameraPreview(
  {
    deviceId,
    resolution,
    fps,
    filterId,
    filterIntensity,
    manualControls,
    fitMode,
    isMirrored,
    zoom = 1.0,
    showGrid = false,
    onAddToast,
    onRefreshDevices
  },
  ref
) {
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const mediaRecRef  = useRef(null);
  const chunksRef    = useRef([]);
  const streamRef    = useRef(null);

  const [errorState, setErrorState] = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);

  // Resolution constraint helper
  const getConstraints = (resStr) => {
    const map = {
      '1080p': [1920, 1080],
      '720p':  [1280, 720],
      '480p':  [848, 480],
      '360p':  [640, 360],
      '240p':  [424, 240],
      '144p':  [160, 120],
    };
    return map[resStr] || [1920, 1080];
  };

  // Start / restart camera stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      setIsLoading(true);
      setErrorState(null);

      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const [w, h] = getConstraints(resolution);
      const targetFps = fps === 'max' ? 60 : parseInt(fps, 10) || 30;

      const videoConstraints = {
        width:     { ideal: w },
        height:    { ideal: h },
        frameRate: { ideal: targetFps }
      };
      if (deviceId) videoConstraints.deviceId = { exact: deviceId };

      const tryGetStream = async (videoOnly = false) => {
        return navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: !videoOnly
        });
      };

      try {
        let mediaStream;
        try {
          mediaStream = await tryGetStream(false);
        } catch {
          // Try without audio
          try {
            mediaStream = await tryGetStream(true);
          } catch {
            // Try bare device
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: deviceId ? { deviceId: { exact: deviceId } } : true,
              audio: false
            });
            if (onAddToast) onAddToast('Camera fallback mode — resolution/FPS constraints relaxed', 'warning');
          }
        }

        if (!active) { mediaStream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => {});
        }
        setIsLoading(false);
      } catch (err) {
        if (!active) return;
        console.error('Camera access failed:', err);
        setErrorState('Cannot access camera. Make sure it is connected and not used by another application.');
        setIsLoading(false);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [deviceId, resolution, fps]);

  // Main render loop
  useEffect(() => {
    let rafId;

    const render = () => {
      if (canvasRef.current && videoRef.current && videoRef.current.readyState >= 2) {
        const video  = videoRef.current;
        const canvas = canvasRef.current;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width  = video.videoWidth  || 1280;
          canvas.height = video.videoHeight || 720;
        }

        drawFilteredFrame(canvas, video, filterId, filterIntensity, manualControls, isMirrored, fitMode, zoom, showGrid);
      }
      rafId = requestAnimationFrame(render);
    };

    render();
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [filterId, filterIntensity, manualControls, isMirrored, fitMode, zoom, showGrid]);

  // Expose imperative API
  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,

    snapPhoto: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png', 1.0);
    },

    startRecording: () => {
      if (!canvasRef.current) return false;
      try {
        const canvasStream = canvasRef.current.captureStream(30);

        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach(t => canvasStream.addTrack(t));
        }

        chunksRef.current = [];
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

        const mr = new MediaRecorder(canvasStream, { mimeType });
        mr.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
        mediaRecRef.current = mr;
        mr.start(100);
        return true;
      } catch (err) {
        console.error('MediaRecorder start failed:', err);
        return false;
      }
    },

    stopRecording: () => new Promise(resolve => {
      if (!mediaRecRef.current) { resolve(null); return; }
      mediaRecRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        resolve(await blob.arrayBuffer());
      };
      mediaRecRef.current.stop();
    })
  }));

  return (
    <div className="viewport-stage">
      {/* Hidden video source */}
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

      {/* Loading Spinner */}
      {isLoading && !errorState && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div className="loading-spinner" />
          <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>Starting camera…</span>
        </div>
      )}

      {/* Canvas */}
      {!errorState && (
        <canvas
          ref={canvasRef}
          className="camera-canvas"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.4s ease',
            transform: 'none'
          }}
        />
      )}

      {/* Error state */}
      {errorState && (
        <div className="camera-error">
          <CameraOff size={52} color="var(--danger)" />
          <h3>Camera Unavailable</h3>
          <p>{errorState}</p>
          <button
            className="action-btn primary"
            style={{ marginTop: 4, maxWidth: 200 }}
            onClick={onRefreshDevices}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
});

export default CameraPreview;
