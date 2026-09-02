import { describe, it, expect } from 'vitest';
import starlightCrossDomainSync from '../src/index';

describe('starlightCrossDomainSync plugin', () => {
  it('throws when domain is missing', () => {
    expect(() => starlightCrossDomainSync({ domain: '' })).toThrow(
      '[starlight-cross-domain-sync] The "domain" option is required',
    );
  });

  it('throws when domain is not a string', () => {
    expect(() =>
      starlightCrossDomainSync({ domain: undefined as unknown as string }),
    ).toThrow();
  });

  it('throws when cookieMaxAge is non-positive', () => {
    expect(() =>
      starlightCrossDomainSync({ domain: '.example.com', cookieMaxAge: 0 }),
    ).toThrow('cookieMaxAge');
    expect(() =>
      starlightCrossDomainSync({ domain: '.example.com', cookieMaxAge: -1 }),
    ).toThrow('cookieMaxAge');
  });

  it('returns an Astro integration with correct name', () => {
    const plugin = starlightCrossDomainSync({ domain: '.example.com' });
    expect(plugin.name).toBe('starlight-cross-domain-sync');
  });

  it('has astro:config:setup hook', () => {
    const plugin = starlightCrossDomainSync({ domain: '.example.com' });
    expect(plugin.hooks).toHaveProperty('astro:config:setup');
    expect(typeof plugin.hooks['astro:config:setup']).toBe('function');
  });

  it('calls injectScript via the hook', () => {
    const plugin = starlightCrossDomainSync({ domain: '.example.com' });
    const injected: Array<{ stage: string; script: string }> = [];
    const mockInject = (stage: string, script: string) => {
      injected.push({ stage, script });
    };
    (plugin.hooks as Record<string, Function>)['astro:config:setup']({
      injectScript: mockInject,
    });
    expect(injected.length).toBe(1);
    expect(injected[0].stage).toBe('head-inline');
    expect(typeof injected[0].script).toBe('string');
    expect(injected[0].script.length).toBeGreaterThan(0);
  });

  it('injects script with configured domain', () => {
    const plugin = starlightCrossDomainSync({ domain: '.mytest.com' });
    const injected: string[] = [];
    const mockInject = (_stage: string, script: string) => {
      injected.push(script);
    };
    (plugin.hooks as Record<string, Function>)['astro:config:setup']({
      injectScript: mockInject,
    });
    expect(injected[0]).toContain('.mytest.com');
  });

  it('uses default cookie name when not specified', () => {
    const plugin = starlightCrossDomainSync({ domain: '.example.com' });
    const injected: string[] = [];
    const mockInject = (_stage: string, script: string) => {
      injected.push(script);
    };
    (plugin.hooks as Record<string, Function>)['astro:config:setup']({
      injectScript: mockInject,
    });
    expect(injected[0]).toContain('starlight-theme');
  });

  it('uses custom cookie name when specified', () => {
    const plugin = starlightCrossDomainSync({
      domain: '.example.com',
      cookieName: 'custom-cookie',
    });
    const injected: string[] = [];
    const mockInject = (_stage: string, script: string) => {
      injected.push(script);
    };
    (plugin.hooks as Record<string, Function>)['astro:config:setup']({
      injectScript: mockInject,
    });
    expect(injected[0]).toContain('custom-cookie');
  });
});
