import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4100';

const formatSeconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

async function fetchJson(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || response.statusText);
  }

  return payload;
}

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [scenarioId, setScenarioId] = useState('');
  const [mode, setMode] = useState('parallel');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const data = await fetchJson('/api/scenarios');
        setScenarios(data.scenarios);
        setScenarioId(data.scenarios[0]?.id || '');
      } catch (error) {
        setStatus({ type: 'error', message: error.message });
      }
    };

    loadScenarios();
  }, []);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === scenarioId),
    [scenarios, scenarioId]
  );

  const latestSequential = history[`${scenarioId}:sequential`];
  const latestParallel = history[`${scenarioId}:parallel`];

  const runScenario = async () => {
    setStatus({
      type: 'running',
      message: `${mode === 'parallel' ? 'Parallel' : 'Sequential'} workstreams are running...`
    });
    setResult(null);

    try {
      const data = await fetchJson('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, mode })
      });

      setResult(data);
      setHistory((current) => ({
        ...current,
        [`${scenarioId}:${mode}`]: data
      }));
      setStatus({
        type: 'success',
        message: `${data.mode} run completed in ${formatSeconds(data.totalDurationMs)}.`
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Codex classroom demo</p>
        <h1>Parallel execution lab</h1>
        <p>
          Run the same simulated Codex workflow two ways. Sequential mode waits for each
          workstream one by one. Parallel mode launches independent workstreams together.
        </p>
      </section>

      <section className="control-surface" aria-label="Demo controls">
        <div className="field">
          <label htmlFor="scenario">Scenario</label>
          <select
            id="scenario"
            value={scenarioId}
            onChange={(event) => {
              setScenarioId(event.target.value);
              setResult(null);
            }}
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend>Execution mode</legend>
          <label>
            <input
              type="radio"
              name="mode"
              value="parallel"
              checked={mode === 'parallel'}
              onChange={() => setMode('parallel')}
            />
            Parallel
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="sequential"
              checked={mode === 'sequential'}
              onChange={() => setMode('sequential')}
            />
            Sequential
          </label>
        </fieldset>

        <button type="button" onClick={runScenario} disabled={!scenarioId || status.type === 'running'}>
          {status.type === 'running' ? 'Running...' : 'Run demo'}
        </button>
      </section>

      {selectedScenario && (
        <section className="scenario-summary">
          <h2>{selectedScenario.title}</h2>
          <p>{selectedScenario.description}</p>
          <div className="metrics">
            <span>{selectedScenario.workstreamCount} workstreams</span>
            <span>Sequential: {formatSeconds(selectedScenario.sequentialDurationMs)}</span>
            <span>Parallel: {formatSeconds(selectedScenario.parallelDurationMs)}</span>
          </div>
        </section>
      )}

      {status.message && <p className={`status ${status.type}`}>{status.message}</p>}

      <section className="comparison">
        <div>
          <p className="label">Latest sequential run</p>
          <strong>{latestSequential ? formatSeconds(latestSequential.totalDurationMs) : 'Not run yet'}</strong>
        </div>
        <div>
          <p className="label">Latest parallel run</p>
          <strong>{latestParallel ? formatSeconds(latestParallel.totalDurationMs) : 'Not run yet'}</strong>
        </div>
        <div>
          <p className="label">Time saved</p>
          <strong>
            {latestSequential && latestParallel
              ? formatSeconds(latestSequential.totalDurationMs - latestParallel.totalDurationMs)
              : 'Run both modes'}
          </strong>
        </div>
      </section>

      <Timeline result={result} />

      <section className="study-prompts">
        <h2>Analyze the execution</h2>
        <ul>
          <li>Find the `Promise.all` call in the backend and explain what it changes.</li>
          <li>Compare the timeline start offsets for sequential and parallel mode.</li>
          <li>Change one duration in `backend/src/scenarios.js`, then run both modes again.</li>
        </ul>
      </section>
    </main>
  );
}

function Timeline({ result }) {
  if (!result) {
    return (
      <section className="timeline empty-state">
        <h2>Timeline</h2>
        <p>Run a scenario to see each Codex workstream plotted against the total duration.</p>
      </section>
    );
  }

  const total = result.totalDurationMs || 1;

  return (
    <section className="timeline">
      <div className="timeline-heading">
        <div>
          <p className="eyebrow">{result.mode} result</p>
          <h2>{result.scenarioTitle}</h2>
        </div>
        <strong>{formatSeconds(result.totalDurationMs)}</strong>
      </div>

      <div className="timeline-list">
        {result.timeline.map((item) => {
          const left = `${(item.startOffsetMs / total) * 100}%`;
          const width = `${(item.durationMs / total) * 100}%`;

          return (
            <article key={item.id} className="timeline-row">
              <div className="row-copy">
                <h3>{item.label}</h3>
                <p>{item.focus}</p>
                <span>{item.result}</span>
              </div>
              <div className="bar-track" aria-label={`${item.label} duration ${formatSeconds(item.durationMs)}`}>
                <div className="bar" style={{ left, width }} />
              </div>
              <p className="duration">{formatSeconds(item.durationMs)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
