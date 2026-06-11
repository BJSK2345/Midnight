import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Telemetry from './components/Telemetry.jsx';
import Workspace from './components/Workspace.jsx';
import Console from './components/Console.jsx';
import DigitalTwins from './components/DigitalTwins.jsx';

const userMeta = 'SECURE LOG // STARK_ENG_01';
const jarvisMeta = 'MIDNIGHT AI // QUANTUM_CASCADE_STREAM';

const nonPhysicalTerms = /\b(app|website|web app|api|server|database|dashboard|software|program|script|algorithm|code only)\b/i;
const physicalTerms = /\b(build|make|construct|prototype|design|assemble|car|robot|boat|drone|rocket|bridge|tower|launcher|catapult|machine|device|circuit|sensor|motor|chassis|frame|wheel|gear|servo|battery|cardboard|wood|plastic|metal|3d print|arduino|raspberry pi)\b/i;

function titleCase(value) {
  return value
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function blueprintTitleFromPrompt(prompt) {
  const cleaned = prompt
    .replace(/\b(help me|can you|please|build|make|create|design|a|an|the|simple|final|physical|project)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return titleCase(cleaned) || 'Physical Build';
}

function isPhysicalProject(prompt) {
  return physicalTerms.test(prompt) && !nonPhysicalTerms.test(prompt);
}

function createBlueprint(prompt) {
  if (!isPhysicalProject(prompt)) return null;

  return {
    title: blueprintTitleFromPrompt(prompt),
    source: prompt,
  };
}

function SettingsPanel() {
  return (
    <section className="holographic-panel workspace-section settings-view-panel">
      <div className="viewport-corners">
        <div className="c-bracket tl" /><div className="c-bracket tr" />
        <div className="c-bracket bl" /><div className="c-bracket br" />
      </div>
      <div className="settings-lite-shell">
        <div>
          <div className="panel-label">SETTINGS</div>
          <h2>Midnight Console</h2>
          <p>Lightweight controls for the hackathon build. More systems can plug in here without disturbing the chat core.</p>
        </div>
        <div className="settings-lite-grid">
          <label><span>HUD Density</span><select><option>Compact</option><option>Expanded</option></select></label>
          <label><span>Blueprint Style</span><select><option>Technical Cyan</option><option>Lab Whiteprint</option></select></label>
          <label><span>Response Mode</span><select><option>JARVIS Manual</option><option>Quick Assist</option></select></label>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('local');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeView, setActiveView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cascadeEndRef = useRef(null);

  useEffect(() => {
    cascadeEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  async function handleEngage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      metadata: userMeta,
      content: text,
    };
    const blueprint = createBlueprint(text);

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, model, wantsBlueprint: Boolean(blueprint) }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Midnight uplink failed.');
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          type: 'jarvis',
          metadata: payload.metadata || jarvisMeta,
          content: payload.reply || '[NO SIGNAL] Empty response received from local inference core.',
          blueprint,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          type: 'jarvis',
          metadata: 'MIDNIGHT AI // FAULT_ISOLATION',
          content: `Sir, the local inference link is not responding correctly: ${error.message}`,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <>
      <div className="hologram-overlay" />
      <div className="glitch-vignette" />
      {sidebarOpen && (
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className={`stark-hud midnight-shell ${sidebarOpen ? 'sidebar-shifted' : ''}`}>
        <Header isStreaming={isStreaming} onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="hud-matrix-body midnight-matrix-body">
          <Telemetry model={model} isStreaming={isStreaming} />
          {activeView === 'chat' && <Workspace messages={messages} isStreaming={isStreaming} cascadeEndRef={cascadeEndRef} />}
          {activeView === 'twins' && <DigitalTwins />}
          {activeView === 'settings' && <SettingsPanel />}
        </div>
        {activeView === 'chat' && (
          <Console
            input={input}
            model={model}
            isStreaming={isStreaming}
            onInputChange={setInput}
            onModelChange={setModel}
            onEngage={handleEngage}
          />
        )}
      </div>
    </>
  );
}
