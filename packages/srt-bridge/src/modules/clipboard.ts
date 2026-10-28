import { invoke } from '../dispatch.js';

export const clipboard = {
  write: (text: string) => invoke<boolean>('clipboard', 'write', { text }),
  read: () => invoke<string>('clipboard', 'read'),
};
