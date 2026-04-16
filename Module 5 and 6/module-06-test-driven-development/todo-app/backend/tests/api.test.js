const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const MODULE_PATH = require.resolve('../src/index.js');
let nextPort = 4133;

async function startServer() {
  const originalListen = express.application.listen;
  let server;
  const port = nextPort++;
  const useEnvPort = startServer.useEnvPort !== false;

  express.application.listen = function patchedListen(...args) {
    if (!useEnvPort) {
      args[0] = port;
    }
    server = originalListen.apply(this, args);
    return server;
  };

  delete require.cache[MODULE_PATH];
  if (useEnvPort) {
    process.env.PORT = String(port);
  } else {
    delete process.env.PORT;
  }

  try {
    require(MODULE_PATH);
  } finally {
    express.application.listen = originalListen;
  }

  if (!server) {
    throw new Error('Backend server did not start.');
  }

  if (!server.listening) {
    await new Promise((resolve) => server.once('listening', resolve));
  }

  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopServer(server) {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  delete require.cache[MODULE_PATH];
  delete process.env.PORT;
}

async function request(baseUrl, path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

test('GET /tasks returns an empty list on a fresh boot', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const { response, payload } = await request(baseUrl, '/tasks');
    assert.equal(response.status, 200);
    assert.deepEqual(payload, []);
  } finally {
    await stopServer(server);
  }
});

test('the backend falls back to its default port when PORT is unset', async () => {
  startServer.useEnvPort = false;
  const { server, baseUrl } = await startServer();

  try {
    const { response, payload } = await request(baseUrl, '/tasks');
    assert.equal(response.status, 200);
    assert.deepEqual(payload, []);
  } finally {
    startServer.useEnvPort = true;
    await stopServer(server);
  }
});

test('POST /tasks creates a task with trimmed title, defaults, and prepends it to GET /tasks', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const createResult = await request(baseUrl, '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '  Buy groceries  ',
        due: '2026-04-20',
        notes: '  remember milk  '
      })
    });

    assert.equal(createResult.response.status, 201);
    assert.match(createResult.payload.id, /[0-9a-f-]{36}/i);
    assert.equal(createResult.payload.title, 'Buy groceries');
    assert.equal(createResult.payload.notes, 'remember milk');
    assert.equal(createResult.payload.due, '2026-04-20');
    assert.equal(createResult.payload.completed, false);
    assert.ok(Date.parse(createResult.payload.createdAt));

    const listResult = await request(baseUrl, '/tasks');
    assert.equal(listResult.response.status, 200);
    assert.equal(listResult.payload.length, 1);
    assert.deepEqual(listResult.payload[0], createResult.payload);
  } finally {
    await stopServer(server);
  }
});

test('POST /tasks accepts missing notes and due values by normalizing them', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const { response, payload } = await request(baseUrl, '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Plan sprint' })
    });

    assert.equal(response.status, 201);
    assert.equal(payload.notes, '');
    assert.equal(payload.due, null);
  } finally {
    await stopServer(server);
  }
});

test('POST /tasks rejects invalid payloads with a 400 error', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const { response, payload } = await request(baseUrl, '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' })
    });

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { error: 'Task title is required.' });
  } finally {
    await stopServer(server);
  }
});

test('PATCH /tasks/:id/complete toggles completion state and returns 404 when missing', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const created = await request(baseUrl, '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ship release' })
    });

    const firstToggle = await request(baseUrl, `/tasks/${created.payload.id}/complete`, {
      method: 'PATCH'
    });
    assert.equal(firstToggle.response.status, 200);
    assert.equal(firstToggle.payload.completed, true);

    const secondToggle = await request(baseUrl, `/tasks/${created.payload.id}/complete`, {
      method: 'PATCH'
    });
    assert.equal(secondToggle.response.status, 200);
    assert.equal(secondToggle.payload.completed, false);

    const missing = await request(baseUrl, '/tasks/does-not-exist/complete', {
      method: 'PATCH'
    });
    assert.equal(missing.response.status, 404);
    assert.deepEqual(missing.payload, { error: 'Task not found.' });
  } finally {
    await stopServer(server);
  }
});

test('invalid JSON payloads are handled by the Express error middleware', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":'
    });
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(payload, { error: 'An unexpected error occurred.' });
  } finally {
    await stopServer(server);
  }
});
