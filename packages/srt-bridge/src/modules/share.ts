import { invoke } from '../dispatch.js';

export type ShareOptions = {
  url?: string;
  text?: string;
  title?: string;
  imageDataUrl?: string;
};

export const share = {
  page: (opts: ShareOptions = {}) => invoke<{ completed: boolean }>('share', 'page', opts),
};
