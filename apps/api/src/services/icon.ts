import { deflateSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { SrtConfig } from '@srt/config';
import { env } from '../env.js';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = (CRC_TABLE[(c ^ (buf[i] as number)) & 0xff] as number) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
}

/** A flat, square RGBA PNG — the fallback launcher icon when no logo is uploaded. */
export function solidPng(size: number, hex: string): Buffer {
  const [r, g, b] = parseHex(hex);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const p = row + 1 + x * 4;
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
      raw[p + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export interface LauncherIcon {
  fileName: string;
  data: Buffer;
}

/**
 * Resolves the uploaded logo (stored under UPLOAD_DIR when it is a bitmap the
 * native shell can use) or falls back to a solid icon in the brand colour.
 */
export async function launcherIcon(config: SrtConfig): Promise<LauncherIcon> {
  const iconPath = config.branding?.iconPath ?? null;
  if (iconPath && iconPath.startsWith('/uploads/')) {
    const relative = iconPath.slice('/uploads/'.length);
    const ext = basename(relative).split('.').pop()?.toLowerCase();
    try {
      const data = await readFile(join(env.UPLOAD_DIR, relative));
      if (ext === 'png') return { fileName: 'ic_launcher.png', data };
      if (ext === 'jpg' || ext === 'jpeg') return { fileName: 'ic_launcher.jpg', data };
    } catch {
      // fall through to the generated fallback
    }
  }
  return {
    fileName: 'ic_launcher.png',
    data: solidPng(192, config.branding?.theme?.primaryColor ?? '#2563eb'),
  };
}
