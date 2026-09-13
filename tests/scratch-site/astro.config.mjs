import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import starlightCrossDomainSync from '@wyatt/starlight-cross-domain-sync';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Scratch Site',
      sidebar: [{ label: 'Guide', autogenerate: { directory: 'guide' } }],
    }),
    mdx(),
    starlightCrossDomainSync({ domain: 'example.com' }),
  ],
});
