import React from 'react';

const navItems = [
  { id: 'chat', label: 'Chat', sub: 'Midnight conversation', icon: 'M4 6h16M4 12h11M4 18h8' },
  { id: 'twins', label: 'Digital Twins', sub: 'Simulation sandboxes', icon: 'M6 7l6-3 6 3v10l-6 3-6-3V7zm6 3v10m-6-13l6 3 6-3' },
  { id: 'settings', label: 'Settings', sub: 'Console preferences', icon: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0-5v3m0 11v3m8.66-15l-2.12 2.12M5.46 18.54l-2.12 2.12m17.32 0l-2.12-2.12M5.46 5.46L3.34 3.34' },
];

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export default function Sidebar({ activeView, onNavigate, onClose }) {
  return (
    <aside className="midnight-sidebar open" aria-label="Midnight navigation">
      <div className="sidebar-panel-bracket" />
      <div className="midnight-sidebar-head">
        <div className="sidebar-brand-lockup">
          <span className="panel-label">NEXUS</span>
          <strong>MIDNIGHT</strong>
          <small>Elexit command layer</small>
        </div>
        <button className="sidebar-close" type="button" onClick={onClose} aria-label="Close navigation">X</button>
      </div>
      <nav className="midnight-sidebar-nav">
        {navItems.map((item) => (
          <button
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-icon-shell"><Icon path={item.icon} /></span>
            <span className="sidebar-copy"><span>{item.label}</span><small>{item.sub}</small></span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
