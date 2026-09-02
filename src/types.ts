export interface CrossDomainSyncOptions {
  domain: string;
  cookieName?: string;
  cookieMaxAge?: number;
  storageKey?: string;
  themeAttribute?: string;
  darkValue?: string;
  lightValue?: string;
  broadcastChannel?: boolean;
  channelName?: string;
}

export interface ResolvedTheme {
  action: 'sync-to-cookie' | 'sync-to-storage' | 'none';
  value: string;
}

export interface BroadcastPayload {
  theme: string;
  timestamp: number;
}
