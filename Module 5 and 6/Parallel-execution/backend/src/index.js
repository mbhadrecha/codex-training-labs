const express = require('express');
const cors = require('cors');
const { findScenario, scenarios } = require('./scenarios');

const app = express();
const PORT = process.env.PORT || 4133;
const VALID_MODES = new Set(['parallel', 'sequential']);

app.use(cors({ origin: '*' }));
app.use(express.json());

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildTimeline = (workstreams, mode) => {
  let cursor = 0;

  return workstreams.map((workstream) => {
    const startOffsetMs = mode === 'sequential' ? cursor : 0;
    const endOffsetMs = startOffsetMs + workstream.durationMs;

    if (mode === 'sequential') {
      cursor = endOffsetMs;
    }

    return {
      id: workstream.id,
      label: workstream.label,
      focus: workstream.focus,
      status: 'completed',
      startOffsetMs,
      endOffsetMs,
      durationMs: workstream.durationMs,
      result: workstream.result
    };
  });
};

const runSequentially = async (workstreams) => {
  for (const workstream of workstreams) {
    await sleep(workstream.durationMs);
  }
};

const runInParallel = async (workstreams) => {
  await Promise.all(workstreams.map((workstream) => sleep(workstream.durationMs)));
};

app.get('/api/scenarios', (req, res) => {
  res.json({
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      workstreamCount: scenario.workstreams.length,
      sequentialDurationMs: scenario.workstreams.reduce((sum, item) => sum + item.durationMs, 0),
      parallelDurationMs: Math.max(...scenario.workstreams.map((item) => item.durationMs))
    }))
  });
});

app.post('/api/run', async (req, res, next) => {
  try {
    const { scenarioId, mode = 'parallel' } = req.body || {};
    const scenario = findScenario(scenarioId);

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }

    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({ error: 'Mode must be either parallel or sequential.' });
    }

    const startedAt = new Date().toISOString();

    if (mode === 'parallel') {
      await runInParallel(scenario.workstreams);
    } else {
      await runSequentially(scenario.workstreams);
    }

    const timeline = buildTimeline(scenario.workstreams, mode);
    const totalDurationMs = Math.max(...timeline.map((item) => item.endOffsetMs));
    const sequentialDurationMs = scenario.workstreams.reduce((sum, item) => sum + item.durationMs, 0);
    const parallelDurationMs = Math.max(...scenario.workstreams.map((item) => item.durationMs));

    res.json({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      mode,
      startedAt,
      completedAt: new Date().toISOString(),
      totalDurationMs,
      savedTimeMs: sequentialDurationMs - totalDurationMs,
      comparison: {
        sequentialDurationMs,
        parallelDurationMs
      },
      timeline
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error('Parallel execution demo error:', err);
  res.status(500).json({ error: 'An unexpected error occurred while running the demo.' });
});

app.listen(PORT, () => {
  console.log(`Parallel execution backend listening on http://localhost:${PORT}`);
});
