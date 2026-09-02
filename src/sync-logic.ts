import type { ResolvedTheme, BroadcastPayload } from './types';

export function getCookieValue(cookieString: string, name: string): string | null {
  const match = cookieString.match(new RegExp('(?:^|;\\s*)' + escapeRegex(name) + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function buildCookieString(
  name: string,
  value: string,
  domain: string,
  maxAge: number,
): string {
  return (
    name +
    '=' +
    encodeURIComponent(value) +
    '; domain=' +
    domain +
    '; path=/' +
    '; max-age=' +
    maxAge +
    '; SameSite=Lax' +
    '; Secure'
  );
}

export function resolveTheme(
  storageTheme: string | null,
  cookieTheme: string | null,
): ResolvedTheme {
  if (storageTheme && !cookieTheme) {
    return { action: 'sync-to-cookie', value: storageTheme };
  }
  if (!storageTheme && cookieTheme) {
    return { action: 'sync-to-storage', value: cookieTheme };
  }
  if (storageTheme && cookieTheme && storageTheme !== cookieTheme) {
    return { action: 'sync-to-cookie', value: storageTheme };
  }
  return { action: 'none', value: '' };
}

export function createBroadcastMessage(theme: string, timestamp: number): string {
  const payload: BroadcastPayload = { theme, timestamp };
  return JSON.stringify(payload);
}

export function parseBroadcastMessage(data: string): BroadcastPayload | null {
  try {
    const parsed = JSON.parse(data);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.theme === 'string' &&
      typeof parsed.timestamp === 'number' &&
      Number.isFinite(parsed.timestamp)
    ) {
      return { theme: parsed.theme, timestamp: parsed.timestamp };
    }
  } catch {
    // not valid JSON
  }
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
