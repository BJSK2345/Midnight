import React from 'react';

function splitMessage(content) {
  const blocks = [];
  const codeFence = /```(\w+)?\n([\s\S]*?)```/g;
  let cursor = 0;
  let match;

  while ((match = codeFence.exec(content)) !== null) {
    if (match.index > cursor) blocks.push({ type: 'text', value: content.slice(cursor, match.index).trim() });
    blocks.push({ type: 'code', language: match[1] || 'SYSTEM_TRACE', value: match[2].trim() });
    cursor = match.index + match[0].length;
  }

  if (cursor < content.length) blocks.push({ type: 'text', value: content.slice(cursor).trim() });
  return blocks.filter((block) => block.value);
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function MarkdownText({ text, isJarvis }) {
  const normalizedText = text.replace(/^(.+)\n={3,}$/gm, '**$1**').replace(/^(.+)\n-{3,}$/gm, '**$1**');
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const elements = [];
  let bullets = [];
  let steps = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    elements.push(
      <ul className="midnight-list" key={`list-${elements.length}`}>
        {bullets.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
      </ul>,
    );
    bullets = [];
  }

  function flushSteps() {
    if (steps.length === 0) return;
    elements.push(
      <ol className="midnight-step-list" key={`steps-${elements.length}`}>
        {steps.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
      </ol>,
    );
    steps = [];
  }

  function flushLists() {
    flushBullets();
    flushSteps();
  }

  lines.forEach((line) => {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\*\*(.+)\*\*:?$/);
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);

    if (headingMatch) {
      flushLists();
      elements.push(<h3 className="midnight-reply-heading" key={`heading-${elements.length}`}>{renderInline(headingMatch[1])}</h3>);
      return;
    }

    if (bulletMatch) {
      flushSteps();
      bullets.push(bulletMatch[1]);
      return;
    }

    if (numberedMatch) {
      flushBullets();
      steps.push(numberedMatch[1]);
      return;
    }

    flushLists();
    elements.push(<p className={isJarvis ? 'typewriter' : undefined} key={`p-${elements.length}`}>{renderInline(line)}</p>);
  });

  flushLists();
  return elements;
}

function getBlueprintParts(source) {
  const text = source.toLowerCase();

  if (/car|vehicle|rover/.test(text)) return ['Chassis rail', 'Drive motor', 'Battery bay', 'Steering servo', 'Wheel hub'];
  if (/robot|arm/.test(text)) return ['Base plate', 'Controller', 'Actuator', 'Sensor mast', 'End effector'];
  if (/bridge|tower|structure/.test(text)) return ['Load deck', 'Truss member', 'Compression brace', 'Anchor point', 'Test weight'];
  if (/boat|submarine/.test(text)) return ['Hull', 'Motor pod', 'Battery seal', 'Rudder', 'Float chamber'];
  if (/drone|airplane|glider/.test(text)) return ['Main frame', 'Propulsion pod', 'Battery bay', 'Control surface', 'Landing skid'];
  if (/rocket|launcher|catapult/.test(text)) return ['Launch rail', 'Energy store', 'Release latch', 'Payload cradle', 'Safety stop'];

  return ['Frame', 'Power module', 'Control node', 'Moving element', 'Fastener points'];
}

function BlueprintCard({ blueprint }) {
  const parts = getBlueprintParts(blueprint.source);

  return (
    <div className="blueprint-card" aria-label={`${blueprint.title} final output blueprint`}>
      <div className="blueprint-header">
        <span>FINAL OUTPUT BLUEPRINT</span>
        <strong>{blueprint.title}</strong>
      </div>
      <svg className="blueprint-svg" viewBox="0 0 760 360" role="img">
        <defs>
          <pattern id={`grid-${blueprint.title}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(120, 226, 255, 0.16)" strokeWidth="1" />
          </pattern>
          <filter id={`glow-${blueprint.title}`}>
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="760" height="360" fill="rgba(0, 32, 58, 0.82)" />
        <rect width="760" height="360" fill={`url(#grid-${blueprint.title})`} />
        <g filter={`url(#glow-${blueprint.title})`} stroke="#8be9ff" strokeWidth="2" fill="none">
          <rect x="150" y="135" width="460" height="105" rx="10" />
          <rect x="220" y="105" width="320" height="48" rx="8" />
          <line x1="188" y1="135" x2="250" y2="92" />
          <line x1="572" y1="135" x2="510" y2="92" />
          <circle cx="205" cy="260" r="42" />
          <circle cx="555" cy="260" r="42" />
          <circle cx="205" cy="260" r="16" />
          <circle cx="555" cy="260" r="16" />
          <rect x="302" y="166" width="156" height="42" rx="6" />
          <path d="M302 188 H252 V226" />
          <path d="M458 188 H508 V226" />
          <path d="M252 226 Q380 272 508 226" strokeDasharray="9 8" />
          <line x1="150" y1="135" x2="610" y2="240" strokeDasharray="8 10" opacity="0.55" />
          <line x1="610" y1="135" x2="150" y2="240" strokeDasharray="8 10" opacity="0.55" />
        </g>
        <g className="blueprint-callouts">
          {parts.map((part, index) => {
            const callouts = [
              { x: 104, y: 92, tx: 188, ty: 138 },
              { x: 584, y: 82, tx: 458, ty: 166 },
              { x: 92, y: 288, tx: 205, ty: 260 },
              { x: 592, y: 302, tx: 555, ty: 260 },
              { x: 322, y: 44, tx: 380, ty: 105 },
            ];
            const c = callouts[index];
            return (
              <g key={part}>
                <line x1={c.x} y1={c.y + 8} x2={c.tx} y2={c.ty} stroke="#00ffaa" strokeWidth="1.4" />
                <circle cx={c.tx} cy={c.ty} r="4" fill="#00ffaa" />
                <text x={c.x} y={c.y} fill="#d8fbff">{part}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function MessageBubble({ message }) {
  const isJarvis = message.type === 'jarvis';
  const blocks = splitMessage(message.content);

  return (
    <article className={`holo-bubble ${isJarvis ? 'jarvis-node' : 'user-node'}`}>
      <div className={`node-header ${isJarvis ? 'text-cyan' : ''}`}>{isJarvis ? 'MIDNIGHT AI // ' : 'SECURE LOG // '}{message.metadata.replace(/^MIDNIGHT AI \/\/ |^SECURE LOG \/\/ /, '')}</div>
      <div className="node-body">
        {message.blueprint && <BlueprintCard blueprint={message.blueprint} />}
        {blocks.map((block, index) => {
          if (block.type === 'code') {
            return (
              <div className="glass-terminal" key={`${message.id}-code-${index}`}>
                <div className="terminal-header">
                  <span>{block.language.toUpperCase()}_STREAM</span>
                  <span className="pulse-dot" />
                </div>
                <pre><code>{block.value}</code></pre>
              </div>
            );
          }

          const isAlert = /CRITICAL|ERROR|FAULT|EXCEEDED|EXCEPTION/i.test(block.value);
          return isAlert ? (
            <div className="alert-strip threat-glow-orange" key={`${message.id}-alert-${index}`}>
              <span className="warning-icon">!</span> {block.value}
            </div>
          ) : (
            <MarkdownText text={block.value} isJarvis={isJarvis} key={`${message.id}-text-${index}`} />
          );
        })}
      </div>
    </article>
  );
}

export default function Workspace({ messages, isStreaming, cascadeEndRef }) {
  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <section className="holographic-panel workspace-section">
      <div className="viewport-corners">
        <div className="c-bracket tl" /><div className="c-bracket tr" />
        <div className="c-bracket bl" /><div className="c-bracket br" />
      </div>

      <div className={`dialogue-cascade ${isEmpty ? 'dialogue-cascade-empty' : ''}`} role="log" aria-live="polite" aria-label="Midnight conversation cascade">
        {isEmpty && <div className="midnight-empty-greeting modern-sleek-text">Hello!</div>}
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {isStreaming && (
          <article className="holo-bubble jarvis-node thinking-node">
            <div className="node-header text-cyan">MIDNIGHT AI // VECTOR_HANDSHAKE</div>
            <div className="node-body">Synchronizing with local inference core<span className="ellipsis-loader">...</span></div>
          </article>
        )}
        <div ref={cascadeEndRef} />
      </div>
    </section>
  );
}
