import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '../env.js';
import type { SrtConfig } from '@srt/config';

const path = env.DATABASE_URL.replace(/^file:/, '');
mkdirSync(dirname(path), { recursive: true });

const db = new Database(path);
db.pragma('journal_mode = WAL');

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS apps (',
  '  id TEXT PRIMARY KEY,',
  '  name TEXT NOT NULL,',
  '  start_url TEXT NOT NULL,',
  '  config TEXT NOT NULL,',
  '  created_at INTEGER NOT NULL,',
  '  updated_at INTEGER NOT NULL',
  ');',
  'CREATE TABLE IF NOT EXISTS builds (',
  '  id TEXT PRIMARY KEY,',
  '  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,',
  '  platform TEXT NOT NULL,',
  '  status TEXT NOT NULL,',
  '  artifact TEXT,',
  "  log TEXT NOT NULL DEFAULT '',",
  '  created_at INTEGER NOT NULL,',
  '  updated_at INTEGER NOT NULL',
  ');',
  'CREATE INDEX IF NOT EXISTS idx_builds_app ON builds(app_id);',
].join('\n');

db.exec(SCHEMA);

export interface AppRecord {
  id: string;
  name: string;
  startUrl: string;
  config: SrtConfig;
  createdAt: number;
  updatedAt: number;
}

const toRecord = (row: any): AppRecord => ({
  id: row.id,
  name: row.name,
  startUrl: row.start_url,
  config: JSON.parse(row.config) as SrtConfig,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const appsRepo = {
  list(): AppRecord[] {
    return db.prepare('SELECT * FROM apps ORDER BY updated_at DESC').all().map(toRecord);
  },
  get(id: string): AppRecord | null {
    const row = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
    return row ? toRecord(row) : null;
  },
  create(name: string, startUrl: string, config: SrtConfig): AppRecord {
    const id = crypto.randomUUID();
    const now = Date.now();
    db.prepare('INSERT INTO apps (id,name,start_url,config,created_at,updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, name, startUrl, JSON.stringify(config), now, now);
    return this.get(id) as AppRecord;
  },
  update(id: string, patch: { name?: string; startUrl?: string; config?: SrtConfig }): AppRecord | null {
    const existing = this.get(id);
    if (!existing) return null;
    db.prepare('UPDATE apps SET name=?, start_url=?, config=?, updated_at=? WHERE id=?').run(
      patch.name ?? existing.name,
      patch.startUrl ?? existing.startUrl,
      JSON.stringify(patch.config ?? existing.config),
      Date.now(),
      id,
    );
    return this.get(id);
  },
  remove(id: string): boolean {
    return db.prepare('DELETE FROM apps WHERE id = ?').run(id).changes > 0;
  },
};

export const buildsRepo = {
  create(appId: string, platform: 'ios' | 'android') {
    const id = crypto.randomUUID();
    const now = Date.now();
    db.prepare('INSERT INTO builds (id,app_id,platform,status,created_at,updated_at) VALUES (?,?,?,?,?,?)')
      .run(id, appId, platform, 'queued', now, now);
    return id;
  },
  get(id: string) {
    return db.prepare('SELECT * FROM builds WHERE id = ?').get(id) as any;
  },
  listForApp(appId: string) {
    return db.prepare('SELECT * FROM builds WHERE app_id = ? ORDER BY created_at DESC').all(appId);
  },
  setStatus(id: string, status: string, patch: { artifact?: string; log?: string } = {}) {
    db.prepare('UPDATE builds SET status=?, artifact=COALESCE(?, artifact), log=COALESCE(?, log), updated_at=? WHERE id=?')
      .run(status, patch.artifact ?? null, patch.log ?? null, Date.now(), id);
  },
};
