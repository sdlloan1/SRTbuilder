import { emit, invoke } from '../dispatch.js';

export type StatusBarOptions = {
  color?: string;
  style?: 'light' | 'dark';
  hidden?: boolean;
  overlay?: boolean;
};

export const statusbar = {
  set: (opts: StatusBarOptions) => emit('statusbar', 'set', opts),
  get: () => invoke<StatusBarOptions>('statusbar', 'get'),
  hide: () => emit('statusbar', 'hide'),
  show: () => emit('statusbar', 'show'),
};
