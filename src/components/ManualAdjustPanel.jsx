import React from 'react';
import { X, RotateCcw, Wand2, ShieldAlert, Cpu, SlidersHorizontal } from 'lucide-react';

export default function ManualAdjustPanel({
  manualControls,
  onChangeControl,
  onReset,
  onClose,
  onApplyAutoMagic,
  onApplyAntiBlowout,
  hardwareControls,
  onChangeHardwareControl
}) {
  const softSliders = [
    { key: 'brightness',  label: 'Brightness',  min: -100, max: 100 },
    { key: 'contrast',    label: 'Contrast',     min: -100, max: 100 },
    { key: 'saturation',  label: 'Saturation',   min: -100, max: 100 },
    { key: 'sharpness',   label: 'Sharpness',    min: 0,    max: 100 },
    { key: 'ringLight',   label: 'Ring Light',   min: 0,    max: 100 },
  ];

  const hwAllowlist = [
    'brightness', 'contrast', 'saturation', 'gain',
    'exposure_time_absolute', 'gamma', 'sharpness',
    'backlight_compensation', 'white_balance_temperature'
  ];

  const formatVal = (key, val) => {
    const signed = ['brightness', 'contrast', 'saturation'];
    if (signed.includes(key) && val > 0) return `+${val}`;
    return `${val}`;
  };

  return (
    <aside className="side-drawer wide">
      <div className="drawer-header">
        <div className="drawer-header-left">
          <SlidersHorizontal size={17} color="var(--accent)" />
          <span>Studio Controls</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" title="Reset All" onClick={onReset}>
            <RotateCcw size={15} />
          </button>
          <button className="icon-btn" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="drawer-body">
        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="action-btn danger"
            onClick={onApplyAntiBlowout}
            title="Lowers sensor exposure to fix blown-out white background"
          >
            <ShieldAlert size={16} />
            Fix Blown-Out Background
          </button>
          <button
            className="action-btn primary"
            onClick={onApplyAutoMagic}
          >
            <Wand2 size={15} />
            Auto HD Clean &amp; Boost
          </button>
        </div>

        <div className="divider" />

        {/* Software Sliders */}
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Software Adjustments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {softSliders.map(({ key, label, min, max }) => (
              <div key={key} className="control-group">
                <div className="control-label">
                  <span>{label}</span>
                  <span>{formatVal(key, manualControls[key] || 0)}{key !== 'ringLight' && key !== 'sharpness' ? '%' : '%'}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={manualControls[key] || 0}
                  onChange={e => onChangeControl(key, parseInt(e.target.value, 10))}
                  className="control-slider"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hardware V4L2 Controls */}
        {hardwareControls && hardwareControls.length > 0 && (
          <>
            <div className="divider" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div className="section-label" style={{ margin: 0 }}>Hardware Sensor</div>
                <span className="hw-tag">V4L2</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hardwareControls
                  .filter(hw => hwAllowlist.includes(hw.key))
                  .map(hw => (
                    <div key={hw.key} className="control-group">
                      <div className="control-label">
                        <span style={{ textTransform: 'capitalize' }}>
                          {hw.key.replace(/_/g, ' ')}
                        </span>
                        <span>{hw.value}</span>
                      </div>
                      <input
                        type="range"
                        min={hw.min}
                        max={hw.max}
                        value={hw.value}
                        onChange={e => onChangeHardwareControl(hw.key, parseInt(e.target.value, 10))}
                        className="control-slider"
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
