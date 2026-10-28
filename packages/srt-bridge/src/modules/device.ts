import { invoke } from '../dispatch.js';

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  model: string;
  appVersion: string;
  appBuild: string;
  bundleId: string;
  locale: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isTablet: boolean;
  /** Stable per-install identifier. Not the advertising ID. */
  installId: string;
}

export const device = {
  getInfo: () => invoke<DeviceInfo>('device', 'getInfo'),
  isNative: () => invoke<boolean>('device', 'isNative'),
  getInstallId: () => invoke<string>('device', 'getInstallId'),
};
