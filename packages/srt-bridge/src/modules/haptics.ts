import { invoke } from '../dispatch.js';

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationStyle = 'success' | 'warning' | 'error';

export const haptics = {
  impact: (opts: { style?: ImpactStyle } = {}) =>
    invoke<boolean>('haptics', 'impact', { style: opts.style ?? 'medium' }),
  notification: (opts: { style?: NotificationStyle } = {}) =>
    invoke<boolean>('haptics', 'notification', { style: opts.style ?? 'success' }),
  vibrate: (ms = 100) => invoke<boolean>('haptics', 'vibrate', { ms }),
  selection: () => invoke<boolean>('haptics', 'selection'),
};
