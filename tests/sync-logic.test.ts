import { describe, it, expect } from 'vitest';
import {
  getCookieValue,
  buildCookieString,
  resolveTheme,
  createBroadcastMessage,
  parseBroadcastMessage,
} from '../src/sync-logic';

describe('getCookieValue', () => {
  it('extracts a simple cookie', () => {
    expect(getCookieValue('theme=dark', 'theme')).toBe('dark');
  });

  it('extracts cookie from multiple cookies', () => {
    expect(getCookieValue('a=1; theme=light; b=2', 'theme')).toBe('light');
  });

  it('extracts cookie with leading space after semicolon', () => {
    expect(getCookieValue('a=1; theme=dark; b=2', 'theme')).toBe('dark');
  });

  it('returns null for missing cookie', () => {
    expect(getCookieValue('a=1; b=2', 'theme')).toBeNull();
  });

  it('returns null for empty cookie string', () => {
    expect(getCookieValue('', 'theme')).toBeNull();
  });

  it('decodes URI-encoded values', () => {
    expect(getCookieValue('theme=dark%20mode', 'theme')).toBe('dark mode');
  });

  it('handles cookie name that is substring of another', () => {
    expect(getCookieValue('themefoo=bar; theme=dark', 'theme')).toBe('dark');
  });

  it('returns first match when cookie appears twice', () => {
    const result = getCookieValue('theme=dark; theme=light', 'theme');
    expect(result).toBe('dark');
  });

  it('handles cookie with special characters in value', () => {
    expect(getCookieValue('theme=dark%2Flight', 'theme')).toBe('dark/light');
  });

  it('returns null when cookie name contains regex special chars', () => {
    expect(getCookieValue('my.theme=dark', 'my.theme')).toBe('dark');
  });
});

describe('buildCookieString', () => {
  it('builds correct cookie string', () => {
    const result = buildCookieString('theme', 'dark', '.example.com', 31536000);
    expect(result).toBe(
      'theme=dark; domain=.example.com; path=/; max-age=31536000; SameSite=Lax; Secure',
    );
  });

  it('encodes the value', () => {
    const result = buildCookieString('theme', 'dark mode', '.example.com', 3600);
    expect(result.startsWith('theme=dark%20mode')).toBe(true);
  });

  it('uses provided max-age', () => {
    const result = buildCookieString('t', 'v', '.d.com', 100);
    expect(result).toContain('max-age=100');
  });

  it('includes SameSite Lax and Secure', () => {
    const result = buildCookieString('a', 'b', '.c.com', 1);
    expect(result).toContain('SameSite=Lax');
    expect(result).toContain('Secure');
  });

  it('includes path slash', () => {
    const result = buildCookieString('a', 'b', '.c.com', 1);
    expect(result).toContain('path=/');
  });
});

describe('resolveTheme', () => {
  it('syncs storage to cookie when only storage has theme', () => {
    expect(resolveTheme('dark', null)).toEqual({
      action: 'sync-to-cookie',
      value: 'dark',
    });
  });

  it('syncs cookie to storage when only cookie has theme', () => {
    expect(resolveTheme(null, 'light')).toEqual({
      action: 'sync-to-storage',
      value: 'light',
    });
  });

  it('syncs storage to cookie when both differ', () => {
    expect(resolveTheme('dark', 'light')).toEqual({
      action: 'sync-to-cookie',
      value: 'dark',
    });
  });

  it('does nothing when both agree', () => {
    expect(resolveTheme('dark', 'dark')).toEqual({
      action: 'none',
      value: '',
    });
  });

  it('does nothing when both null', () => {
    expect(resolveTheme(null, null)).toEqual({
      action: 'none',
      value: '',
    });
  });

  it('handles empty string as storage theme (empty string is falsy)', () => {
    expect(resolveTheme('', null)).toEqual({
      action: 'none',
      value: '',
    });
  });
});

describe('createBroadcastMessage', () => {
  it('creates valid JSON string', () => {
    const msg = createBroadcastMessage('dark', 1000);
    const parsed = JSON.parse(msg);
    expect(parsed).toEqual({ theme: 'dark', timestamp: 1000 });
  });

  it('includes theme and timestamp', () => {
    const msg = createBroadcastMessage('light', 999);
    expect(msg).toContain('"theme":"light"');
    expect(msg).toContain('"timestamp":999');
  });
});

describe('parseBroadcastMessage', () => {
  it('parses valid message', () => {
    const result = parseBroadcastMessage('{"theme":"dark","timestamp":1000}');
    expect(result).toEqual({ theme: 'dark', timestamp: 1000 });
  });

  it('returns null for invalid JSON', () => {
    expect(parseBroadcastMessage('not json')).toBeNull();
  });

  it('returns null when theme is missing', () => {
    expect(parseBroadcastMessage('{"timestamp":1000}')).toBeNull();
  });

  it('returns null when timestamp is missing', () => {
    expect(parseBroadcastMessage('{"theme":"dark"}')).toBeNull();
  });

  it('returns null when theme is not a string', () => {
    expect(parseBroadcastMessage('{"theme":123,"timestamp":1000}')).toBeNull();
  });

  it('returns null when timestamp is not a number', () => {
    expect(parseBroadcastMessage('{"theme":"dark","timestamp":"now"}')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(parseBroadcastMessage('null')).toBeNull();
  });

  it('round-trips with createBroadcastMessage', () => {
    const original = createBroadcastMessage('light', 12345);
    const parsed = parseBroadcastMessage(original);
    expect(parsed).toEqual({ theme: 'light', timestamp: 12345 });
  });

  it('rejects NaN timestamp', () => {
    expect(parseBroadcastMessage('{"theme":"dark","timestamp":NaN}')).toBeNull();
  });

  it('rejects Infinity timestamp', () => {
    expect(
      parseBroadcastMessage('{"theme":"dark","timestamp":Infinity}'),
    ).toBeNull();
  });
});
