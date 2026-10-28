import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildUrl, parseUrl } from '../src/protocol.js';
import { invoke } from '../src/dispatch.js';

describe('protocol', () => {
  it('round-trips an envelope', () => {
    const url = buildUrl({
      module: 'statusbar',
      fn: 'set',
      args: { color: '#000' },
      callback: '__srt_cb_1',
    });
    expect(url).toBe('srt://statusbar/set?args=%7B%22color%22%3A%22%23000%22%7D&callback=__srt_cb_1');
    expect(parseUrl(url)).toEqual({
      module: 'statusbar',
      fn: 'set',
      args: { color: '#000' },
      callback: '__srt_cb_1',
    });
  });

  it('rejects foreign schemes', () => {
    expect(parseUrl('https://example.com')).toBeNull();
  });
});

describe('dispatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.innerHTML = '';
  });

  it('resolves when the callback fires', async () => {
    const p = invoke('device', 'getInfo');
    const cb = Object.keys(window).find((k) => k.startsWith('__srt_cb_'));
    expect(cb).toBeDefined();
    (window as any)[cb].call(null, { platform: 'ios' });
    await expect(p).resolves.toEqual({ platform: 'ios' });
  });

  it('rejects on __error payloads', async () => {
    const p = invoke('share', 'page');
    const cb = Object.keys(window).find((k) => k.startsWith('__srt_cb_'));
    (window as any)[cb].call(null, { __error: 'denied' });
    await expect(p).rejects.toThrow('denied');
  });

  it('times out', async () => {
    const p = invoke('device', 'getInfo', {}, { timeout: 100 });
    const assertion = expect(p).rejects.toThrow(/timed out/);
    vi.advanceTimersByTime(150);
    await assertion;
  });
});
