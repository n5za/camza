import React from 'react';

export default function CountdownOverlay({ count }) {
  if (!count || count <= 0) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-number" key={count}>
        {count}
      </div>
      <div className="countdown-label">Get ready…</div>
    </div>
  );
}
