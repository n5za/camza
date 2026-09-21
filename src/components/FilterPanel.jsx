import React, { useEffect, useRef } from 'react';
import { FILTERS, drawFilteredFrame } from '../utils/filterShaders';
import { X, Sparkles } from 'lucide-react';

function LiveFilterThumbnail({ filter, activeFilterId, videoElement, manualControls, isMirrored }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const render = () => {
      if (canvasRef.current && videoElement.readyState >= 2) {
        canvasRef.current.width  = 128;
        canvasRef.current.height = 72;
        drawFilteredFrame(canvasRef.current, videoElement, filter.id, 100, manualControls, false, 'fit', 1.0, false);
      }
      rafRef.current = requestAnimationFrame(render);
    };

    render();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [filter.id, videoElement, manualControls]);

  return (
    <canvas
      ref={canvasRef}
      className="filter-thumbnail-canvas"
      width={128}
      height={72}
    />
  );
}

export default function FilterPanel({
  activeFilter,
  onChangeFilter,
  filterIntensity,
  onChangeIntensity,
  videoElement,
  manualControls,
  isMirrored,
  onClose
}) {
  return (
    <aside className="side-drawer">
      <div className="drawer-header">
        <div className="drawer-header-left">
          <Sparkles size={17} color="var(--accent)" />
          <span>Filters</span>
        </div>
        <button className="icon-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {/* Intensity Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Filter Intensity</span>
            <span>{filterIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filterIntensity}
            onChange={e => onChangeIntensity(Number(e.target.value))}
            className="control-slider"
          />
        </div>

        <div className="divider" />

        {/* Filter Grid */}
        <div className="filter-grid">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              className={`filter-card ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => onChangeFilter(filter.id)}
              title={filter.desc}
            >
              {videoElement ? (
                <LiveFilterThumbnail
                  filter={filter}
                  activeFilterId={activeFilter}
                  videoElement={videoElement}
                  manualControls={manualControls}
                  isMirrored={isMirrored}
                />
              ) : (
                <div className="filter-thumbnail-canvas" style={{ background: '#111' }} />
              )}
              <span className="filter-name">{filter.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
