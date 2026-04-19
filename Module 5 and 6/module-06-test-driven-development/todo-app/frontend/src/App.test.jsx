import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

function jsonResponse(body, init = {}) {
  return Promise.resolve({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: () => Promise.resolve(body)
  });
}

function delayedJsonResponse(body, delay = 25) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(body)
    }), delay);
  });
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('loads saved tasks and renders fetched task details', async () => {
    global.fetch.mockImplementationOnce(() => jsonResponse([
      {
        id: '1',
        title: 'Write tests',
        due: '2026-04-30',
        notes: 'Cover the toggle flow',
        completed: false,
        createdAt: '2026-04-16T10:00:00.000Z'
      },
      {
        id: '2',
        title: 'Review PR',
        due: null,
        notes: '',
        completed: true,
        createdAt: '2026-04-16T11:00:00.000Z'
      }
    ]));

    render(<App />);

    expect(await screen.findByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Review PR')).toBeInTheDocument();
    expect(screen.getByText('2 item(s)')).toBeInTheDocument();
    expect(screen.getByText(/Due 2026-04-30/)).toBeInTheDocument();
    expect(screen.getByText(/No due date/)).toBeInTheDocument();
    expect(screen.getByText('Cover the toggle flow')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark complete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark undone' })).toBeInTheDocument();
  });

  it('shows a loading state while the initial fetch is in flight', async () => {
    global.fetch.mockImplementationOnce(() => delayedJsonResponse([]));

    render(<App />);

    expect(screen.getByText(/Loading saved tasks/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('No tasks yet. Submit one above.')).toBeInTheDocument());
  });

  it('shows an error status when the initial task load fails', async () => {
    global.fetch.mockImplementationOnce(() => jsonResponse(
      { error: 'Backend offline' },
      { ok: false, status: 503, statusText: 'Service Unavailable' }
    ));

    render(<App />);

    expect(await screen.findByText('Backend offline')).toBeInTheDocument();
    expect(screen.getByText('No tasks yet. Submit one above.')).toBeInTheDocument();
  });

  it('submits a new task successfully, clears the form, and prepends the created task', async () => {
    const user = userEvent.setup();
    global.fetch
      .mockImplementationOnce(() => jsonResponse([]))
      .mockImplementationOnce(() => jsonResponse({
        id: '9',
        title: 'Prep demo',
        due: '2026-04-25',
        notes: 'Bring release notes',
        completed: false,
        createdAt: '2026-04-16T12:00:00.000Z'
      }, { status: 201 }));

    render(<App />);
    await screen.findByText('No tasks yet. Submit one above.');

    await user.type(screen.getByLabelText('Task title'), 'Prep demo');
    await user.type(screen.getByLabelText('Optional due date'), '2026-04-25');
    await user.type(screen.getByLabelText('Notes/details'), 'Bring release notes');
    await user.click(screen.getByRole('button', { name: 'Save task to backend' }));

    await screen.findByText('Task saved to the backend.');
    expect(screen.getByText('Prep demo')).toBeInTheDocument();
    expect(screen.getByText('Bring release notes')).toBeInTheDocument();
    expect(screen.getByText('1 item(s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Task title')).toHaveValue('');
    expect(screen.getByLabelText('Optional due date')).toHaveValue('');
    expect(screen.getByLabelText('Notes/details')).toHaveValue('');

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:4033/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Prep demo', due: '2026-04-25', notes: 'Bring release notes' })
      })
    );
  });

  it('shows a backend validation error when saving fails', async () => {
    const user = userEvent.setup();
    global.fetch
      .mockImplementationOnce(() => jsonResponse([]))
      .mockImplementationOnce(() => jsonResponse(
        { error: 'Task title is required.' },
        { ok: false, status: 400, statusText: 'Bad Request' }
      ));

    render(<App />);
    await screen.findByText('No tasks yet. Submit one above.');

    await user.type(screen.getByLabelText('Task title'), 'Draft agenda');
    await user.click(screen.getByRole('button', { name: 'Save task to backend' }));

    expect(await screen.findByText('Task title is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Task title')).toHaveValue('Draft agenda');
  });

  it('toggles a task to completed when the backend patch succeeds', async () => {
    const user = userEvent.setup();
    global.fetch
      .mockImplementationOnce(() => jsonResponse([
        {
          id: 'abc',
          title: 'Ship release',
          due: null,
          notes: '',
          completed: false,
          createdAt: '2026-04-16T13:00:00.000Z'
        }
      ]))
      .mockImplementationOnce(() => jsonResponse({
        id: 'abc',
        title: 'Ship release',
        due: null,
        notes: '',
        completed: true,
        createdAt: '2026-04-16T13:00:00.000Z'
      }));

    render(<App />);
    await screen.findByText('Ship release');

    await user.click(screen.getByRole('button', { name: 'Mark complete' }));

    expect(await screen.findByRole('button', { name: 'Mark undone' })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:4033/tasks/abc/complete',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('shows an error when toggling completion fails', async () => {
    const user = userEvent.setup();
    global.fetch
      .mockImplementationOnce(() => jsonResponse([
        {
          id: 'abc',
          title: 'Retro',
          due: null,
          notes: '',
          completed: false,
          createdAt: '2026-04-16T14:00:00.000Z'
        }
      ]))
      .mockImplementationOnce(() => jsonResponse(
        { error: 'Task not found.' },
        { ok: false, status: 404, statusText: 'Not Found' }
      ));

    render(<App />);
    await screen.findByText('Retro');

    await user.click(screen.getByRole('button', { name: 'Mark complete' }));

    expect(await screen.findByText('Task not found.')).toBeInTheDocument();
  });

  it('falls back to the HTTP status text when an error response has no JSON payload', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('invalid json'))
    }));

    render(<App />);

    expect(await screen.findByText('Bad Gateway')).toBeInTheDocument();
  });
});
