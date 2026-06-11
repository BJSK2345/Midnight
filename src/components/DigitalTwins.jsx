import React, { useMemo, useState } from 'react';

const instructionHelp = [
  'SET A 5  -> put 5 into register A',
  'MOV A B  -> copy A into B',
  'ADD A B  -> A + B, store in B',
  'SUB A B  -> A - B, store in B',
  'MUL A B  -> A * B, store in B',
  'DIV A B  -> A / B, store in B',
  'INC A    -> add 1 to A',
  'DEC A    -> subtract 1 from A',
  'SWAP A B -> exchange A and B',
  'CLR A    -> set A to 0',
];

const starterProgram = `SET A 4
SET B 7
ADD A B
MUL B A
DEC A`;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const regs = ['A', 'B', 'C', 'D'];

function ComputerTwin() {
  const [registers, setRegisters] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [program, setProgram] = useState(starterProgram);
  const [pointer, setPointer] = useState(0);
  const [log, setLog] = useState(['CPU online. One core ready.']);

  const lines = useMemo(() => program.split('\n').map((line) => line.trim()).filter(Boolean), [program]);

  function reset() {
    setRegisters({ A: 0, B: 0, C: 0, D: 0 });
    setPointer(0);
    setLog(['CPU reset. Registers cleared.']);
  }

  function parseRegister(value) {
    const key = value?.toUpperCase();
    return regs.includes(key) ? key : null;
  }

  function valueOf(token, state) {
    const reg = parseRegister(token);
    if (reg) return state[reg];
    const num = Number(token);
    return Number.isFinite(num) ? num : null;
  }

  function execute(raw, state) {
    const [opRaw, firstRaw, secondRaw] = raw.split(/\s+/);
    const op = opRaw?.toUpperCase();
    const first = parseRegister(firstRaw);
    const second = parseRegister(secondRaw);
    const next = { ...state };

    if (op === 'SET' && first) {
      const value = valueOf(secondRaw, state);
      if (value === null) return { next, message: `SET failed: ${secondRaw} is not a number or register.` };
      next[first] = value;
      return { next, message: `SET ${first}: stored ${value} in register ${first}.` };
    }

    if (op === 'MOV' && first && second) {
      next[second] = state[first];
      return { next, message: `MOV ${first} ${second}: copied ${first} into ${second}.` };
    }

    if (['ADD', 'SUB', 'MUL', 'DIV'].includes(op) && first && second) {
      const a = state[first];
      const b = state[second];
      if (op === 'DIV' && a === 0) return { next, message: 'DIV blocked: divisor is 0.' };
      const result = op === 'ADD' ? a + b : op === 'SUB' ? a - b : op === 'MUL' ? a * b : b / a;
      next[second] = Number(result.toFixed(3));
      return { next, message: `${op} ${first} ${second}: result stored in ${second}.` };
    }

    if (op === 'INC' && first) {
      next[first] += 1;
      return { next, message: `INC ${first}: ${first} increased by 1.` };
    }

    if (op === 'DEC' && first) {
      next[first] -= 1;
      return { next, message: `DEC ${first}: ${first} decreased by 1.` };
    }

    if (op === 'SWAP' && first && second) {
      next[first] = state[second];
      next[second] = state[first];
      return { next, message: `SWAP ${first} ${second}: registers exchanged.` };
    }

    if (op === 'CLR' && first) {
      next[first] = 0;
      return { next, message: `CLR ${first}: register cleared.` };
    }

    return { next, message: `Unknown instruction: ${raw}` };
  }

  function step() {
    if (lines.length === 0) return;
    if (pointer >= lines.length) {
      setLog((current) => ['Program complete.', ...current].slice(0, 8));
      return;
    }

    const raw = lines[pointer];
    setRegisters((state) => {
      const { next, message } = execute(raw, state);
      setLog((current) => [`L${pointer + 1}: ${message}`, ...current].slice(0, 8));
      return next;
    });
    setPointer((value) => value + 1);
  }

  function runAll() {
    let state = { ...registers };
    const newLog = [];
    lines.slice(pointer).forEach((raw, offset) => {
      const result = execute(raw, state);
      state = result.next;
      newLog.unshift(`L${pointer + offset + 1}: ${result.message}`);
    });
    setRegisters(state);
    setPointer(lines.length);
    setLog(['Program complete.', ...newLog, ...log].slice(0, 8));
  }

  return (
    <div className="computer-twin twin-grid">
      <section className="twin-card cpu-panel">
        <div className="twin-card-head"><span>CPU</span><strong>1 CORE</strong></div>
        <div className="cpu-chip"><span>FETCH</span><span>DECODE</span><span>EXECUTE</span></div>
        <div className="cpu-pointer">NEXT LINE: {Math.min(pointer + 1, lines.length || 1)}</div>
      </section>

      <section className="twin-card instruction-panel">
        <div className="twin-card-head"><span>INSTRUCTION MEMORY</span><strong>{lines.length} LINES</strong></div>
        <textarea value={program} onChange={(event) => { setProgram(event.target.value); setPointer(0); }} spellCheck="false" />
        <div className="twin-actions">
          <button type="button" onClick={step}>STEP</button>
          <button type="button" onClick={runAll}>RUN</button>
          <button type="button" onClick={reset}>RESET</button>
        </div>
      </section>

      <section className="twin-card ram-panel">
        <div className="twin-card-head"><span>RAM</span><strong>4 REGISTERS</strong></div>
        <div className="register-grid">
          {regs.map((reg) => <div className="register-cell" key={reg}><span>{reg}</span><strong>{registers[reg]}</strong></div>)}
        </div>
      </section>

      <section className="twin-card instruction-help">
        <div className="twin-card-head"><span>ISA</span><strong>10 OPS</strong></div>
        {instructionHelp.map((item) => <code key={item}>{item}</code>)}
      </section>

      <section className="twin-card cpu-log">
        <div className="twin-card-head"><span>TRACE</span><strong>LIVE</strong></div>
        {log.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
      </section>
    </div>
  );
}

function RubberBandCarTwin() {
  const [settings, setSettings] = useState({ strength: 55, bands: 2, wheel: 6, mass: 180, friction: 28 });
  const [runs, setRuns] = useState([]);

  const prediction = useMemo(() => {
    const storedEnergy = settings.strength * settings.bands * 0.42;
    const wheelFactor = settings.wheel / 6;
    const massPenalty = settings.mass / 180;
    const frictionPenalty = 1 + settings.friction / 75;
    const distance = clamp((storedEnergy * wheelFactor * 2.4) / (massPenalty * frictionPenalty), 5, 220);
    const speed = clamp(distance / 4.8, 1, 55);
    return { distance: Number(distance.toFixed(1)), speed: Number(speed.toFixed(1)) };
  }, [settings]);

  const carX = `${clamp((prediction.distance / 220) * 78, 6, 82)}%`;

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: Number(value) }));
  }

  function runTrial() {
    setRuns((current) => [
      {
        id: current.length + 1,
        distance: prediction.distance,
        speed: prediction.speed,
        energy: Number((settings.strength * settings.bands * 0.42).toFixed(1)),
      },
      ...current,
    ].slice(0, 8));
  }

  return (
    <div className="rubber-lab twin-grid rubber-grid">
      <section className="twin-card lab-visual">
        <div className="twin-card-head"><span>RUBBER BAND CAR</span><strong>PHYSICS SANDBOX</strong></div>
        <div className="track-stage">
          <div className="track-ruler"><span>0 cm</span><span>110 cm</span><span>220 cm</span></div>
          <div className="track-line" />
          <div className="lab-car" style={{ left: carX }}>
            <div className="car-body" />
            <div className="band-wind" />
            <span className="wheel left" /><span className="wheel right" />
          </div>
        </div>
        <div className="lab-readouts">
          <div><span>Distance</span><strong>{prediction.distance} cm</strong></div>
          <div><span>Peak Speed</span><strong>{prediction.speed} cm/s</strong></div>
        </div>
      </section>

      <section className="twin-card lab-controls">
        <div className="twin-card-head"><span>INPUT SLIDERS</span><strong>CONTROL</strong></div>
        {[
          ['strength', 'Rubber band strength', 10, 100],
          ['bands', 'Number of bands', 1, 5],
          ['wheel', 'Wheel size (cm)', 3, 12],
          ['mass', 'Mass of car (g)', 80, 450],
          ['friction', 'Surface friction', 5, 80],
        ].map(([key, label, min, max]) => (
          <label className="lab-slider" key={key}>
            <span>{label}<output>{settings[key]}</output></span>
            <input type="range" min={min} max={max} value={settings[key]} onChange={(event) => update(key, event.target.value)} />
          </label>
        ))}
        <div className="twin-actions">
          <button type="button" onClick={runTrial}>RUN TRIAL</button>
          <button type="button" onClick={() => setRuns([])}>RESET DATA</button>
        </div>
      </section>

      <section className="twin-card lab-table">
        <div className="twin-card-head"><span>DATA TABLE</span><strong>{runs.length} RUNS</strong></div>
        <table>
          <thead><tr><th>Run</th><th>Energy</th><th>Distance</th><th>Speed</th></tr></thead>
          <tbody>
            {runs.length === 0 && <tr><td colSpan="4">Run a trial to record data.</td></tr>}
            {runs.map((run) => <tr key={run.id}><td>{run.id}</td><td>{run.energy}</td><td>{run.distance} cm</td><td>{run.speed} cm/s</td></tr>)}
          </tbody>
        </table>
      </section>

      <section className="twin-card lab-explain">
        <div className="twin-card-head"><span>MODEL</span><strong>CAUSE / EFFECT</strong></div>
        <p>More band strength and more bands store more elastic energy. Larger wheels cover more ground per rotation. Extra mass and friction absorb energy, so the car travels less distance.</p>
      </section>
    </div>
  );
}

export default function DigitalTwins() {
  const [activeTwin, setActiveTwin] = useState('computer');

  return (
    <section className="holographic-panel workspace-section twin-workspace">
      <div className="viewport-corners">
        <div className="c-bracket tl" /><div className="c-bracket tr" />
        <div className="c-bracket bl" /><div className="c-bracket br" />
      </div>
      <div className="twin-shell">
        <div className="twin-toolbar">
          <div>
            <div className="panel-label">DIGITAL TWINS</div>
            <h2>{activeTwin === 'computer' ? 'Computer Sandbox' : 'Rubber Band Car Sandbox'}</h2>
          </div>
          <div className="twin-tabs">
            <button className={activeTwin === 'computer' ? 'active' : ''} type="button" onClick={() => setActiveTwin('computer')}>Computer</button>
            <button className={activeTwin === 'rubber' ? 'active' : ''} type="button" onClick={() => setActiveTwin('rubber')}>Rubber Band Car</button>
          </div>
        </div>
        {activeTwin === 'computer' ? <ComputerTwin /> : <RubberBandCarTwin />}
      </div>
    </section>
  );
}
