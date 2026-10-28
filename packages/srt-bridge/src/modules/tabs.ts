import { emit, invoke } from '../dispatch.js';

export interface TabItem {
  label: string;
  url: string;
  icon?: string;
  badge?: string;
}

export const tabs = {
  set: (items: TabItem[]) => emit('tabs', 'set', { items }),
  select: (index: number) => emit('tabs', 'select', { index }),
  setBadge: (index: number, badge: string | null) => emit('tabs', 'setBadge', { index, badge }),
  get: () => invoke<{ items: TabItem[]; selected: number }>('tabs', 'get'),
};
