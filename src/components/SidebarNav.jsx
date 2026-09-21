import React from 'react';
import { SlidersHorizontal, Sparkles, Image, Settings, Video } from 'lucide-react';

const navItems = [
  { id: 'filters',     icon: <Sparkles size={20} />,         tooltip: 'Filters' },
  { id: 'adjustments', icon: <SlidersHorizontal size={20} />, tooltip: 'Adjust' },
  { id: 'gallery',     icon: <Image size={20} />,             tooltip: 'Gallery' },
];

export default function SidebarNav({ activeDrawer, onToggleDrawer, onOpenSettings }) {
  return (
    <aside className="sidebar-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${activeDrawer === item.id ? 'active' : ''}`}
          onClick={() => onToggleDrawer(item.id)}
          data-tooltip={item.tooltip}
          title={item.tooltip}
        >
          {item.icon}
        </button>
      ))}

      <div className="nav-spacer" />

      <button
        className="nav-btn"
        onClick={onOpenSettings}
        data-tooltip="Settings"
        title="Settings"
      >
        <Settings size={20} />
      </button>
    </aside>
  );
}
