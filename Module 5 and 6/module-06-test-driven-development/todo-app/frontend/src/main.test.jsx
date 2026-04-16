import { beforeEach, describe, expect, it, vi } from 'vitest';

const renderSpy = vi.fn();
const createRootSpy = vi.fn(() => ({ render: renderSpy }));

vi.mock('react-dom/client', () => ({
  default: { createRoot: createRootSpy },
  createRoot: createRootSpy
}));

vi.mock('./App', () => ({
  default: () => null
}));

describe('main.jsx', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    renderSpy.mockClear();
    createRootSpy.mockClear();
  });

  it('mounts the App into the root element', async () => {
    await import('./main.jsx');

    expect(createRootSpy).toHaveBeenCalledWith(document.getElementById('root'));
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
