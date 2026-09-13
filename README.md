# @wyatt/starlight-cross-domain-sync

Starlight plugin to synchronize the dark/light theme preference across subdomains via cookies and BroadcastChannel.

Starlight stores the theme in `localStorage`, which is origin-scoped — visiting `docs.example.com` and `blog.example.com` gives each its own theme. This plugin injects a small head script that mirrors the theme preference into a cookie shared across your subdomains and keeps open tabs in sync with `BroadcastChannel`.

## How it works

1. On load, resolves the theme from cookie vs `localStorage` (newest wins) and applies it to `data-theme`
2. On change, writes the choice to both the cookie and `localStorage`, and broadcasts it to other tabs
3. Listens for storage events, cookie changes, and broadcast messages to update in real time

## Installation

```bash
npm install @wyatt/starlight-cross-domain-sync
```

## Usage

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightCrossDomainSync from '@wyatt/starlight-cross-domain-sync';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
    }),
    starlightCrossDomainSync({ domain: 'example.com' }),
  ],
});
```

The cookie is set with `Domain=example.com`, so every subdomain of `example.com` shares the theme. The `domain` option is required.

> `starlightCrossDomainSync()` is an Astro integration, so it belongs in the top-level
> `integrations` array — not inside `starlight({ plugins: [...] })`.

## Configuration options

| Option | Type | Default | Description |
|---|---|---|---|
| `domain` | `string` | — (required) | Registrable domain shared by your subdomains |
| `cookieName` | `string` | `starlight-theme` | Cookie used to mirror the theme |
| `cookieMaxAge` | `number` | `31536000` (1 year) | Cookie max age in seconds |
| `storageKey` | `string` | `starlight.theme` | `localStorage` key to keep in sync |
| `themeAttribute` | `string` | `data-theme` | HTML attribute the theme is applied to |
| `darkValue` | `string` | `dark` | Attribute value for dark mode |
| `lightValue` | `string` | `light` | Attribute value for light mode |
| `broadcastChannel` | `boolean` | `true` | Sync across tabs via BroadcastChannel |
| `channelName` | `string` | `starlight-theme-sync` | BroadcastChannel name |

The sync helpers (`getCookieValue`, `buildCookieString`, `resolveTheme`, `createBroadcastMessage`, `parseBroadcastMessage`) and `generateSyncScript` are also exported for custom setups.

## License

MIT
