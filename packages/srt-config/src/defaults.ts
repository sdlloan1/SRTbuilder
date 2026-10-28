import { SrtConfigSchema, type SrtConfigInput } from './schema.js';

export function createDefaultConfig(input: SrtConfigInput): SrtConfigInput {
  return {
    version: 1,
    ...input,
    app: {
      version: '1.0.0',
      buildNumber: 1,
      minSdk: 24,
      targetSdk: 35,
      minIos: '14.0',
      ...input.app,
    },
    site: {
      userAgentSuffix: 'SRTBuilder/1.0',
      injectBridge: true,
      allowedBridgePaths: [],
      customCss: '',
      customJs: '',
      cookiePersistence: true,
      externalLinkMode: 'in-app',
      ...input.site,
    },
  };
}

export function deriveIdentifiers(displayName: string, domain: string) {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20) || 'app';
  const host = domain.replace(/^www\./, '').split('.').reverse().join('.');
  const safeHost = host.replace(/[^a-z0-9.]/g, '').toLowerCase();
  return {
    androidPackage: safeHost + '.' + slug,
    iosBundleId: safeHost + '.' + slug,
    displayName,
  };
}
