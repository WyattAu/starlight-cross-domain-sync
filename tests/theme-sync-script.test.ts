import { describe, it, expect } from 'vitest';
import { generateSyncScript } from '../src/theme-sync-script';
import type { CrossDomainSyncOptions } from '../src/types';

function resolved(opts: Partial<CrossDomainSyncOptions>): Required<CrossDomainSyncOptions> {
  return {
    domain: opts.domain ?? '.example.com',
    cookieName: opts.cookieName ?? 'starlight-theme',
    cookieMaxAge: opts.cookieMaxAge ?? 31536000,
    storageKey: opts.storageKey ?? 'starlight.theme',
    themeAttribute: opts.themeAttribute ?? 'data-theme',
    darkValue: opts.darkValue ?? 'dark',
    lightValue: opts.lightValue ?? 'light',
    broadcastChannel: opts.broadcastChannel ?? true,
    channelName: opts.channelName ?? 'starlight-theme-sync',
  };
}

describe('generateSyncScript', () => {
  it('returns a non-empty string', () => {
    const script = generateSyncScript(resolved({}));
    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(0);
  });

  it('wraps in IIFE', () => {
    const script = generateSyncScript(resolved({}));
    expect(script.startsWith('(function(){')).toBe(true);
    expect(script.endsWith('})();')).toBe(true);
  });

  it('contains the configured domain', () => {
    const script = generateSyncScript(resolved({ domain: '.mydomain.com' }));
    expect(script).toContain('.mydomain.com');
  });

  it('contains the configured cookie name', () => {
    const script = generateSyncScript(resolved({ cookieName: 'my-cookie' }));
    expect(script).toContain('my-cookie');
  });

  it('contains the configured storage key', () => {
    const script = generateSyncScript(resolved({ storageKey: 'my.storage' }));
    expect(script).toContain('my.storage');
  });

  it('contains the configured theme attribute', () => {
    const script = generateSyncScript(resolved({ themeAttribute: 'data-color' }));
    expect(script).toContain('data-color');
  });

  it('contains dark and light values', () => {
    const script = generateSyncScript(resolved({ darkValue: 'night', lightValue: 'day' }));
    expect(script).toContain('night');
    expect(script).toContain('day');
  });

  it('includes BroadcastChannel when enabled', () => {
    const script = generateSyncScript(resolved({ broadcastChannel: true }));
    expect(script).toContain('BroadcastChannel');
  });

  it('omits BroadcastChannel setup when disabled', () => {
    const script = generateSyncScript(resolved({ broadcastChannel: false }));
    // Should not contain "new BroadcastChannel" setup logic
    expect(script).not.toContain('initBC');
  });

  it('contains MutationObserver for theme attribute', () => {
    const script = generateSyncScript(resolved({}));
    expect(script).toContain('MutationObserver');
  });

  it('contains cookie read/write functions', () => {
    const script = generateSyncScript(resolved({}));
    expect(script).toContain('document.cookie');
  });

  it('contains localStorage operations', () => {
    const script = generateSyncScript(resolved({}));
    expect(script).toContain('localStorage');
  });

  it('handles astro:after-swap for View Transitions', () => {
    const script = generateSyncScript(resolved({}));
    expect(script).toContain('astro:after-swap');
  });

  it('contains storage event listener', () => {
    const script = generateSyncScript(resolved({}));
    expect(script).toContain('storage');
  });

  it('uses configured channel name when BroadcastChannel enabled', () => {
    const script = generateSyncScript(
      resolved({ broadcastChannel: true, channelName: 'my-channel' }),
    );
    expect(script).toContain('my-channel');
  });

  it('uses configured max-age', () => {
    const script = generateSyncScript(resolved({ cookieMaxAge: 86400 }));
    expect(script).toContain('86400');
  });
});
