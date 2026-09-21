import React from 'react';
import { X, Trash2, FolderOpen, ExternalLink, Download } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaHelper';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LightboxModal({ item, onClose, onDelete, onOpenFolder, onOpenFile }) {
  if (!item) return null;

  const src = getMediaUrl(item.path);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = item.name;
    a.click();
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Escape') onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="modal-card"
        style={{ maxWidth: 760 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
              {item.name}
            </span>
            {item.size > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                · {formatSize(item.size)}
              </span>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Media */}
        <div style={{ display: 'flex', justifyContent: 'center', background: '#000', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          {item.type === 'photo' ? (
            <img src={src} alt={item.name} className="lightbox-media" />
          ) : (
            <video
              src={src}
              controls
              autoPlay
              className="lightbox-media"
            />
          )}
        </div>

        {/* Actions */}
        <div className="lightbox-actions">
          <button className="btn" onClick={handleDownload}>
            <Download size={15} />
            Download
          </button>
          {onOpenFile && !src.startsWith('data:') && !src.startsWith('blob:') && (
            <button className="btn" onClick={() => onOpenFile(item.path)}>
              <ExternalLink size={15} />
              Open
            </button>
          )}
          {onOpenFolder && (
            <button className="btn" onClick={() => onOpenFolder(item.path)}>
              <FolderOpen size={15} />
              Show in Folder
            </button>
          )}
          <button className="btn danger" onClick={() => onDelete(item)}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
