import { describe, it, expect } from 'vitest';
import { parseConfig, createDefaultConfig, deriveIdentifiers } from '../src/index.js';

describe('config defaults', () => {
  it('fills every section when only app and site are supplied', () => {
    const app = deriveIdentifiers('Example', 'www.example.com');
    const config = parseConfig(createDefaultConfig({ app, site: { startUrl: 'https://example.com' } }));

    expect(config.app.androidPackage).toBe('com.example.example');
    expect(config.branding.theme.primaryColor).toBe('#2563eb');
    expect(config.navigation.mode).toBe('none');
    expect(config.interface.pullToRefresh).toBe(true);
    expect(config.permissions.camera).toBe(false);
    expect(config.plugins.pushProvider).toBe('none');
    expect(config.deepLink.scheme).toBe('srtapp');
  });

  it('accepts partial overrides', () => {
    const app = deriveIdentifiers('Example', 'example.com');
    const config = parseConfig(
      createDefaultConfig({ app, site: { startUrl: 'https://example.com' }, navigation: { mode: 'tabbar' } as any }),
    );
    expect(config.navigation.mode).toBe('tabbar');
  });
});
