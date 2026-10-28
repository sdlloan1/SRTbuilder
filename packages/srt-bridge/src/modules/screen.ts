import { emit, invoke } from '../dispatch.js';

export const screen = {
  keepOn: () => emit('screen', 'keepOn'),
  allowSleep: () => emit('screen', 'allowSleep'),
  fullScreen: () => emit('screen', 'fullScreen'),
  exitFullScreen: () => emit('screen', 'exitFullScreen'),
  setBrightness: (value: number) => emit('screen', 'setBrightness', { value }),
  getBrightness: () => invoke<number>('screen', 'getBrightness'),
  lockOrientation: (orientation: 'portrait' | 'landscape' | 'auto') =>
    emit('screen', 'lockOrientation', { orientation }),
};
