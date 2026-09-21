// Real-time Canvas Filter & Pro HD Enhancer Engine 3.0 for Camza

export const FILTERS = [
  { id: 'normal', name: 'Normal', icon: 'Sparkles', desc: 'Original raw camera feed' },
  { id: 'hdr_anti_blowout', name: 'HDR Anti-Blowout', icon: 'ShieldAlert', desc: 'Fixes overexposed white walls & harsh lighting' },
  { id: 'pro_clean', name: 'Pro HD Magic', icon: 'Wand2', desc: 'AI Auto-Enhance & Sharpness Clean' },
  { id: 'grayscale', name: 'N & B', icon: 'Moon', desc: 'Classic black & white monochrome' },
  { id: 'sepia', name: 'Sepia', icon: 'Sun', desc: 'Warm nostalgic vintage tones' },
  { id: 'invert', name: 'Invert', icon: 'Contrast', desc: 'Negative color spectrum' },
  { id: 'warm', name: 'Warm', icon: 'Flame', desc: 'Golden amber glow' },
  { id: 'cold', name: 'Cold', icon: 'Snowflake', desc: 'Cool arctic blue mood' },
  { id: 'vintage', name: 'Vintage', icon: 'Film', desc: 'Retro 70s muted film look' },
  { id: 'highcontrast', name: 'Contrast+', icon: 'Zap', desc: 'Deep shadows & punchy highlights' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: 'Radio', desc: 'Neon cyan & magenta futuristic vibe' },
  { id: 'matrix', name: 'Matrix', icon: 'Terminal', desc: 'Hacker green emerald tint' },
  { id: 'noir', name: 'Noir', icon: 'Camera', desc: 'Deep dramatic high-contrast film noir' },
  { id: 'vhs', name: 'VHS Tape', icon: 'Tv', desc: 'Analog 80s tape texture & color bleed' },
  { id: 'thermal', name: 'Thermal', icon: 'Eye', desc: 'Infrared heatmap vision simulation' },
  { id: 'pastel', name: 'Pastel', icon: 'Palette', desc: 'Soft aesthetic dream tones' },
  { id: 'sunset', name: 'Sunset', icon: 'Sunset', desc: 'Warm golden hour dusk' },
  { id: 'duotone', name: 'Duotone', icon: 'Layers', desc: 'Sleek violet & amber contrast' }
];

/**
 * Builds CSS filter string based on selected filter, intensity percentage, and manual adjustment sliders.
 */
export function getCssFilterString(filterId, intensity = 100, manualControls = {}) {
  const normIntensity = Math.max(0, Math.min(100, intensity)) / 100;
  
  // Base manual values
  let manualBrightness = 1 + ((manualControls.brightness || 0) / 100);
  let manualContrast = 1 + ((manualControls.contrast || 0) / 100);
  let manualSaturation = 1 + ((manualControls.saturation || 0) / 100);

  if (filterId === 'hdr_anti_blowout') {
    manualBrightness *= 0.88; // Lower overall luminance to fix white clipping
    manualContrast *= 1.25;
    manualSaturation *= 1.15;
  } else if (filterId === 'pro_clean' || manualControls.isProEnhancerActive) {
    manualContrast *= 1.15;
    manualBrightness *= 1.02;
    manualSaturation *= 1.1;
  }

  let filterStr = `brightness(${manualBrightness}) contrast(${manualContrast}) saturate(${manualSaturation})`;

  if (normIntensity === 0 || filterId === 'normal') {
    return filterStr;
  }

  switch (filterId) {
    case 'hdr_anti_blowout': {
      filterStr += ` contrast(${1 + normIntensity * 0.3}) brightness(${1 - normIntensity * 0.12})`;
      break;
    }
    case 'pro_clean': {
      filterStr += ` contrast(${1 + normIntensity * 0.2}) saturate(${1 + normIntensity * 0.15})`;
      break;
    }
    case 'grayscale': {
      filterStr += ` grayscale(${normIntensity * 100}%)`;
      break;
    }
    case 'sepia': {
      filterStr += ` sepia(${normIntensity * 100}%)`;
      break;
    }
    case 'invert': {
      filterStr += ` invert(${normIntensity * 100}%)`;
      break;
    }
    case 'warm': {
      const sepiaVal = normIntensity * 35;
      const saturateVal = 1 + (normIntensity * 0.4);
      const hueVal = -normIntensity * 15;
      filterStr += ` sepia(${sepiaVal}%) saturate(${saturateVal}) hue-rotate(${hueVal}deg)`;
      break;
    }
    case 'cold': {
      const saturateVal = 1 - (normIntensity * 0.2);
      const hueVal = normIntensity * 35;
      filterStr += ` saturate(${saturateVal}) hue-rotate(${hueVal}deg) brightness(${1 + normIntensity * 0.05})`;
      break;
    }
    case 'vintage': {
      const sepiaVal = normIntensity * 50;
      const contrastVal = 1 - (normIntensity * 0.15);
      const saturateVal = 1 - (normIntensity * 0.25);
      filterStr += ` sepia(${sepiaVal}%) contrast(${contrastVal}) saturate(${saturateVal})`;
      break;
    }
    case 'highcontrast': {
      const contrastVal = 1 + (normIntensity * 0.8);
      const saturateVal = 1 + (normIntensity * 0.3);
      filterStr += ` contrast(${contrastVal}) saturate(${saturateVal})`;
      break;
    }
    case 'cyberpunk': {
      const hueVal = normIntensity * 140;
      const saturateVal = 1 + (normIntensity * 1.2);
      const contrastVal = 1 + (normIntensity * 0.4);
      filterStr += ` hue-rotate(${hueVal}deg) saturate(${saturateVal}) contrast(${contrastVal})`;
      break;
    }
    case 'matrix': {
      const hueVal = normIntensity * 90;
      const saturateVal = 1 + (normIntensity * 0.8);
      const contrastVal = 1 + (normIntensity * 0.5);
      filterStr += ` hue-rotate(${hueVal}deg) saturate(${saturateVal}) contrast(${contrastVal}) sepia(${normIntensity * 40}%)`;
      break;
    }
    case 'noir': {
      const contrastVal = 1 + (normIntensity * 1.5);
      const brightnessVal = 0.9 - (normIntensity * 0.1);
      filterStr += ` grayscale(100%) contrast(${contrastVal}) brightness(${brightnessVal})`;
      break;
    }
    case 'vhs': {
      const hueVal = normIntensity * -30;
      const saturateVal = 1 + (normIntensity * 0.6);
      const contrastVal = 1 + (normIntensity * 0.2);
      filterStr += ` hue-rotate(${hueVal}deg) saturate(${saturateVal}) contrast(${contrastVal})`;
      break;
    }
    case 'thermal': {
      const hueVal = normIntensity * 220;
      const invertVal = normIntensity * 80;
      const contrastVal = 1 + (normIntensity * 0.9);
      filterStr += ` hue-rotate(${hueVal}deg) invert(${invertVal}%) contrast(${contrastVal}) saturate(2)`;
      break;
    }
    case 'pastel': {
      const saturateVal = 1 - (normIntensity * 0.4);
      const brightnessVal = 1 + (normIntensity * 0.15);
      filterStr += ` saturate(${saturateVal}) brightness(${brightnessVal}) sepia(${normIntensity * 20}%)`;
      break;
    }
    case 'sunset': {
      const hueVal = -normIntensity * 25;
      const saturateVal = 1 + (normIntensity * 0.7);
      const sepiaVal = normIntensity * 40;
      filterStr += ` hue-rotate(${hueVal}deg) saturate(${saturateVal}) sepia(${sepiaVal}%)`;
      break;
    }
    case 'duotone': {
      const hueVal = normIntensity * 260;
      const contrastVal = 1 + (normIntensity * 0.7);
      filterStr += ` hue-rotate(${hueVal}deg) contrast(${contrastVal}) saturate(1.8)`;
      break;
    }
    default:
      break;
  }

  return filterStr;
}

/**
 * Real-time HDR Tone Mapping Highlight Compression Shader
 * Compresses blown-out highlights (> 200 brightness) to eliminate harsh white clipping background
 */
function applyHDRHighlightCompression(ctx, w, h) {
  try {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 8) { // step by 2 pixels for 60fps performance
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Highlight compression threshold
      if (lum > 190) {
        const factor = 190 + (lum - 190) * 0.35; // Compress highlight curve non-linearly
        const scale = factor / lum;
        data[i] = Math.min(255, r * scale);
        data[i + 1] = Math.min(255, g * scale);
        data[i + 2] = Math.min(255, b * scale);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    // Graceful fallback if security policy prevents raw buffer access
  }
}

/**
 * Sharpness Convolution Kernel Filter to crisp up webcam frames
 */
function applySharpnessKernel(ctx, w, h, sharpnessAmount) {
  if (sharpnessAmount <= 0) return;

  try {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const copyData = new Uint8ClampedArray(data);

    const k = (sharpnessAmount / 100) * 0.6;
    const centerWeight = 1 + 4 * k;
    const rowBytes = w * 4;

    for (let y = 1; y < h - 1; y += 2) {
      const offsetRow = y * rowBytes;
      for (let x = 1; x < w - 1; x += 2) {
        const i = offsetRow + x * 4;

        for (let c = 0; c < 3; c++) {
          const idx = i + c;
          const val =
            centerWeight * copyData[idx] -
            k * copyData[idx - 4] -
            k * copyData[idx + 4] -
            k * copyData[idx - rowBytes] -
            k * copyData[idx + rowBytes];

          data[idx] = val < 0 ? 0 : val > 255 ? 255 : val;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    // Edge case handling
  }
}

/**
 * Virtual Studio Ring Light Vignette Overlay
 */
function drawRingLightOverlay(ctx, w, h, ringLightIntensity) {
  if (ringLightIntensity <= 0) return;

  const alpha = (ringLightIntensity / 100) * 0.35;
  const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);

  gradient.addColorStop(0, 'rgba(255, 248, 240, 0)');
  gradient.addColorStop(0.6, `rgba(255, 250, 245, ${alpha * 0.5})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Draws frame from video onto Canvas with current filters, HDR tone mapping, sharpening, studio lighting, zoom, and grid.
 */
export function drawFilteredFrame(
  canvas,
  video,
  filterId,
  intensity,
  manualControls = {},
  isMirrored = false,
  fitMode = 'fit',
  zoom = 1.0,
  showGrid = false
) {
  if (!canvas || !video || video.readyState < 2) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Clear canvas
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // Apply Image Smoothing Algorithm for upscaling low-res webcams crisp
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply CSS Filter
  ctx.filter = getCssFilterString(filterId, intensity, manualControls);

  // Handle Horizontal Mirroring
  if (isMirrored) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  // Handle Digital Zoom Scaling
  const vw = video.videoWidth || w;
  const vh = video.videoHeight || h;

  const zoomedWidth = vw / zoom;
  const zoomedHeight = vh / zoom;
  const sx = (vw - zoomedWidth) / 2;
  const sy = (vh - zoomedHeight) / 2;

  if (fitMode === 'stretch') {
    ctx.drawImage(video, sx, sy, zoomedWidth, zoomedHeight, 0, 0, w, h);
  } else if (fitMode === 'fill') {
    const scale = Math.max(w / zoomedWidth, h / zoomedHeight);
    const nw = zoomedWidth * scale;
    const nh = vh * scale;
    const dx = (w - nw) / 2;
    const dy = (h - nh) / 2;
    ctx.drawImage(video, sx, sy, zoomedWidth, zoomedHeight, dx, dy, nw, nh);
  } else {
    // Default 'fit' (contain)
    const scale = Math.min(w / zoomedWidth, h / zoomedHeight);
    const nw = zoomedWidth * scale;
    const nh = zoomedHeight * scale;
    const dx = (w - nw) / 2;
    const dy = (h - nh) / 2;
    
    ctx.fillStyle = '#090a0f';
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(video, sx, sy, zoomedWidth, zoomedHeight, dx, dy, nw, nh);
  }

  ctx.restore();

  // Apply HDR Highlight Compression Shader if anti-blowout active
  if (filterId === 'hdr_anti_blowout' || manualControls.hdrAntiBlowout) {
    applyHDRHighlightCompression(ctx, w, h);
  }

  // Apply Sharpness Enhancement Kernel if configured or in Pro Clean mode
  const effectiveSharpness = manualControls.sharpness || (filterId === 'pro_clean' ? 40 : 0);
  if (effectiveSharpness > 0) {
    applySharpnessKernel(ctx, w, h, effectiveSharpness);
  }

  // Apply Studio Ring Light Fill-light overlay
  const effectiveRingLight = manualControls.ringLight || (filterId === 'pro_clean' ? 25 : 0);
  if (effectiveRingLight > 0) {
    drawRingLightOverlay(ctx, w, h, effectiveRingLight);
  }

  // Draw Rule-of-Thirds Grid Overlay if enabled
  if (showGrid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Vertical Lines
    ctx.beginPath();
    ctx.moveTo(w / 3, 0);
    ctx.lineTo(w / 3, h);
    ctx.moveTo((2 * w) / 3, 0);
    ctx.lineTo((2 * w) / 3, h);

    // Horizontal Lines
    ctx.moveTo(0, h / 3);
    ctx.lineTo(w, h / 3);
    ctx.moveTo(0, (2 * h) / 3);
    ctx.lineTo(w, (2 * h) / 3);

    ctx.stroke();
    ctx.restore();
  }
}
