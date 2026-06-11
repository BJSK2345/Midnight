import React from 'react';
const modelTelemetry = {
  quantum: { label: 'QUANTUM', flux: '1.21 GW', node: 'TRUE' },
  vector: { label: 'VECTOR', flux: '840 MW', node: 'TRUE' },
  local: { label: 'OLLAMA', flux: 'LOCAL', node: 'TRUE' },
  gemini: { label: 'GEMINI', flux: 'CLOUD', node: 'TRUE' },
};

export default function Telemetry({ model, isStreaming }) {
  const telemetry = modelTelemetry[model] || modelTelemetry.quantum;

  return (
    <section className="holographic-panel arc-section">
      <div className="panel-bracket-top" />
      <div className="panel-label">CORE TELEMETRY</div>

      <div className={`reactor-container ${isStreaming ? 'reactor-hot' : ''}`} aria-label="Midnight telemetry reactor">
        <div className="outer-ring" />
        <div className="inner-ring" />
        <div className="core-spark" />
      </div>

      <div className="live-data-ticker">
        <div className="ticker-row"><span className="lbl">SYS.STATE:</span><span className="val text-cyan">{isStreaming ? 'THINKING' : 'OPTIMAL'}</span></div>
        <div className="ticker-row"><span className="lbl">FLUX.CAP:</span><span className="val text-cyan">{telemetry.flux}</span></div>
        <div className="ticker-row"><span className="lbl">NODE.LOCK:</span><span className="val text-green">{telemetry.node}</span></div>
        <div className="ticker-row"><span className="lbl">MODEL.CFG:</span><span className="val text-green">{telemetry.label}</span></div>
      </div>
      <div className="panel-bracket-bottom" />
    </section>
  );
}
