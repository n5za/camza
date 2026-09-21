import React from 'react';
import { Image as ImageIcon, RefreshCw, FolderOpen, X, Trash2, Video } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaHelper';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function GalleryPanel({ items, onSelectItem, onRefresh, onOpenFolder, onClose }) {
  const photos = items.filter(i => i.type === 'photo');
  const videos = items.filter(i => i.type === 'video');

  return (
    <aside className="side-drawer">
      <div className="drawer-header">
        <div className="drawer-header-left">
          <ImageIcon size={17} color="var(--accent)" />
          <span>Gallery</span>
          {items.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, background: 'var(--bg-surface-3)',
              padding: '1px 7px', borderRadius: 'var(--r-full)', color: 'var(--text-2)'
            }}>
              {items.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn" title="Open Folder" onClick={onOpenFolder}>
            <FolderOpen size={15} />
          </button>
          <button className="icon-btn" title="Refresh" onClick={onRefresh}>
            <RefreshCw size={15} />
          </button>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="drawer-body">
        {items.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={36} color="var(--text-3)" />
            <h4>No captures yet</h4>
            <p>Take a photo or record a video to see it here.</p>
          </div>
        ) : (
          <>
            {photos.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>
                  Photos ({photos.length})
                </div>
                <div className="gallery-grid">
                  {photos.map(item => (
                    <GalleryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 8 }}>
                  Videos ({videos.length})
                </div>
                <div className="gallery-grid">
                  {videos.map(item => (
                    <GalleryCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function GalleryCard({ item, onClick }) {
  const src = getMediaUrl(item.path);

  return (
    <div className="gallery-card" onClick={onClick} title={item.name}>
      {item.type === 'photo' ? (
        <img src={src} alt={item.name} loading="lazy" />
      ) : (
        <video src={src} muted preload="metadata" />
      )}
      <div className="gallery-card-overlay">
        <span className="gallery-card-name">{item.name}</span>
      </div>
      <span className="gallery-type-badge">
        {item.type === 'video' ? 'VID' : 'IMG'}
      </span>
    </div>
  );
}
