import React from 'react';

export default function FlashOverlay({ active }) {
  if (!active) return null;
  return <div className="flash-screen" />;
}
