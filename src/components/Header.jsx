import React from 'react';

export default function Header({ isStreaming, onMenuClick }) {
  return (
    <header className="hud-top-bar">
      <button className="sidebar-toggle" type="button" onClick={onMenuClick} aria-label="Open navigation">
        <span />
        <span />
        <span />
      </button>
      <div className="brand-nexus">
        <div className={`core-node-pulse ${isStreaming ? 'active-scan' : ''}`} />
        <span className="hud-title modern-sleek-text">MIDNIGHT</span>
        <span className="hud-sub">// ELEXIT QUANTUM COMPUTING ARCHITECTURE</span>
      </div>
      <div className="hud-status-cluster">
        <span className="status-tag string-glow">NEURAL SYNC: SECURE</span>
        <span className="status-tag orange-glow">SYSTEM STABILITY: OPTIMAL</span>
      </div>
    </header>
  );
}
