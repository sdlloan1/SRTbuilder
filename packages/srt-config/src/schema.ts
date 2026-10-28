import { z } from 'zod';

export const CONFIG_VERSION = 1 as const;

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex color');

export const AndroidPackage = z
  .string()
  .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'invalid Android package name');

export const IosBundleId = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/, 'invalid iOS bundle identifier');

export const AppIdentifiersSchema = z.object({
  androidPackage: AndroidPackage,
  iosBundleId: IosBundleId,
  displayName: z.string().min(1).max(30),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  buildNumber: z.number().int().positive().default(1),
  minSdk: z.number().int().min(21).max(35).default(24),
  targetSdk: z.number().int().min(21).max(35).default(35),
  minIos: z.string().regex(/^\d+(\.\d+)?$/).default('14.0'),
});

export const StartUrlSchema = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//.test(u), 'must be http(s) — localhost is not reachable from devices');

export const SiteSchema = z.object({
  startUrl: StartUrlSchema,
  userAgentSuffix: z.string().default('SRTBuilder/1.0'),
  injectBridge: z.boolean().default(true),
  allowedBridgePaths: z.array(z.string().startsWith('/')).default([]),
  customCss: z.string().default(''),
  customJs: z.string().default(''),
  cookiePersistence: z.boolean().default(true),
  externalLinkMode: z.enum(['in-app', 'system-browser', 'ask']).default('in-app'),
});

export const BrandingSchema = z.object({
  iconPath: z.string().nullable().default(null),
  splash: z
    .object({
      style: z.enum(['icon', 'custom', 'none']).default('icon'),
      imagePath: z.string().nullable().default(null),
      backgroundColorLight: hex.default('#ffffff'),
      backgroundColorDark: hex.default('#0b1020'),
      animation: z.enum(['none', 'fade', 'scale']).default('fade'),
      durationMs: z.number().int().min(0).max(5000).default(600),
    })
    .default({}),
  theme: z
    .object({
      primaryColor: hex.default('#2563eb'),
      statusBarColor: hex.default('#ffffff'),
      statusBarStyle: z.enum(['light', 'dark']).default('dark'),
      navigationBarColor: hex.default('#ffffff'),
    })
    .default({}),
}).default({});

export const NavigationSchema = z.object({
  mode: z.enum(['none', 'topbar', 'sidebar', 'tabbar']).default('none'),
  title: z.string().default(''),
  showRefresh: z.boolean().default(true),
  showShare: z.boolean().default(true),
  tabs: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
        icon: z.string().default('circle'),
      }),
    )
    .max(5)
    .default([]),
}).default({});

export const InterfaceSchema = z.object({
  pullToRefresh: z.boolean().default(true),
  swipeNavigation: z.boolean().default(true),
  zoom: z.boolean().default(true),
  keepScreenOn: z.boolean().default(false),
  fullScreen: z.boolean().default(false),
  orientation: z.enum(['portrait', 'landscape', 'auto']).default('portrait'),
  darkMode: z.enum(['system', 'light', 'dark']).default('system'),
  offlineHtml: z.string().default(''),
}).default({});

export const PermissionsSchema = z.object({
  camera: z.boolean().default(false),
  microphone: z.boolean().default(false),
  location: z.enum(['off', 'whenInUse', 'always']).default('off'),
  photos: z.boolean().default(true),
  contacts: z.boolean().default(false),
  biometrics: z.boolean().default(false),
  notifications: z.boolean().default(false),
}).default({});

export const PluginsSchema = z.object({
  haptics: z.boolean().default(true),
  clipboard: z.boolean().default(true),
  share: z.boolean().default(true),
  qrScanner: z.boolean().default(false),
  biometricAuth: z.boolean().default(false),
  inAppPurchases: z.boolean().default(false),
  pushProvider: z.enum(['none', 'onesignal', 'fcm']).default('none'),
  pushAppId: z.string().nullable().default(null),
}).default({});

export const DeepLinkSchema = z.object({
  enabled: z.boolean().default(false),
  scheme: z.string().regex(/^[a-z][a-z0-9+.-]*$/).default('srtapp'),
  universalLinkHost: z.string().nullable().default(null),
  androidSha256: z.string().nullable().default(null),
}).default({});

export const SrtConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.literal(CONFIG_VERSION).default(CONFIG_VERSION),
  app: AppIdentifiersSchema,
  site: SiteSchema,
  branding: BrandingSchema,
  navigation: NavigationSchema,
  interface: InterfaceSchema,
  permissions: PermissionsSchema,
  plugins: PluginsSchema,
  deepLink: DeepLinkSchema,
});

export type SrtConfig = z.infer<typeof SrtConfigSchema>;
export type SrtConfigInput = z.input<typeof SrtConfigSchema>;
