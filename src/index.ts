import type { AstroIntegration } from 'astro';
import type { CrossDomainSyncOptions } from './types';
import { generateSyncScript } from './theme-sync-script';

const DEFAULTS: Required<Omit<CrossDomainSyncOptions, 'domain'>> = {
  cookieName: 'starlight-theme',
  cookieMaxAge: 365 * 24 * 60 * 60,
  storageKey: 'starlight.theme',
  themeAttribute: 'data-theme',
  darkValue: 'dark',
  lightValue: 'light',
  broadcastChannel: true,
  channelName: 'starlight-theme-sync',
};

export default function starlightCrossDomainSync(
  options: CrossDomainSyncOptions,
): AstroIntegration {
  if (!options.domain || typeof options.domain !== 'string') {
    throw new Error(
      '[starlight-cross-domain-sync] The "domain" option is required and must be a non-empty string.',
    );
  }

  const resolved: Required<CrossDomainSyncOptions> = {
    ...DEFAULTS,
    ...options,
  };

  if (resolved.cookieMaxAge <= 0) {
    throw new Error(
      '[starlight-cross-domain-sync] "cookieMaxAge" must be a positive number.',
    );
  }

  const script = generateSyncScript(resolved);

  return {
    name: 'starlight-cross-domain-sync',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        injectScript('head-inline', script);
      },
    },
  };
}

export { generateSyncScript } from './theme-sync-script';
export {
  getCookieValue,
  buildCookieString,
  resolveTheme,
  createBroadcastMessage,
  parseBroadcastMessage,
} from './sync-logic';
export type { CrossDomainSyncOptions, ResolvedTheme, BroadcastPayload } from './types';
