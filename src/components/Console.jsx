import React from 'react';
const modelOptions = [
  { value: 'quantum', label: 'Midnight 5.0 (Quantum)' },
  { value: 'vector', label: 'Midnight-Light (Vector)' },
  { value: 'local', label: 'Local Ollama Llama3' },
  { value: 'gemini', label: 'Gemini 3.5 Flash' },
];

export default function Console({ input, model, isStreaming, onInputChange, onModelChange, onEngage }) {
  function handleSubmit(event) {
    event.preventDefault();
    onEngage();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onEngage();
    }
  }

  return (
    <footer className="hud-console-dock">
      <form className="hud-input-hull" onSubmit={handleSubmit}>
        <span className="hud-prompt modern-sleek-text text-neon-green">MIDNIGHT &gt;</span>
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Awaiting matrix parameters or raw system layout updates..."
          disabled={isStreaming}
          aria-label="Midnight command input"
        />

        <div className="stark-controls">
          <button className="action-add-btn" type="button" title="Add File or Node" aria-label="Add file or node">+</button>

          <div className="model-select-wrapper">
            <select className="modern-dropdown" value={model} onChange={(event) => onModelChange(event.target.value)} aria-label="Model configuration">
              {modelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <button className="stark-btn glow-cyan" type="button" aria-pressed="false">OVERRIDE</button>
          <button className="stark-btn glow-green active" type="submit" disabled={isStreaming || !input.trim()}>{isStreaming ? 'SYNCING' : 'ENGAGE'}</button>
        </div>
      </form>
      <div className="system-watermark">POWERED BY ELEXIT INTEGRATED LABS // GLOBAL SECURITY MATRIX</div>
    </footer>
  );
}
