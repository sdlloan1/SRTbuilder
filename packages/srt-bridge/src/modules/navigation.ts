import { emit, invoke } from '../dispatch.js';

export const navigation = {
  push: (url: string) => emit('navigation', 'push', { url }),
  pop: () => emit('navigation', 'pop'),
  setTitle: (title: string) => emit('navigation', 'setTitle', { title }),
  canGoBack: () => invoke<boolean>('navigation', 'canGoBack'),
  reload: () => emit('navigation', 'reload'),
  clearCache: () => invoke<boolean>('navigation', 'clearCache'),
  openExternal: (url: string) => emit('navigation', 'openExternal', { url }),
};
