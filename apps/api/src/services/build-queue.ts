import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile, readFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import JSZip from 'jszip';
import { env } from '../env.js';
import { buildsRepo, appsRepo } from './db.js';
import { generateProject } from './generator.js';

type Task = { buildId: string; appId: string; platform: 'ios' | 'android' };

const queue: Task[] = [];
let running = 0;

/** Finished artefacts live outside the throwaway work directory so they stay downloadable. */
const DOWNLOAD_DIR = join(env.ARTIFACT_DIR, 'downloads');

export function enqueue(task: Task) {
  queue.push(task);
  pump();
}

function pump() {
  while (running < env.MAX_CONCURRENT_BUILDS && queue.length) {
    const task = queue.shift() as Task;
    running++;
    run(task).finally(() => {
      running--;
      pump();
    });
  }
}

async function run(task: Task) {
  const { buildId, appId, platform } = task;
  const app = appsRepo.get(appId);
  if (!app) return buildsRepo.setStatus(buildId, 'failed', { log: 'app not found' });

  const workDir = join(env.ARTIFACT_DIR, buildId);
  buildsRepo.setStatus(buildId, 'generating');
  await mkdir(workDir, { recursive: true });

  try {
    const projectDir = join(workDir, 'project');
    const { files } = await generateProject(app.config, platform, projectDir);
    buildsRepo.setStatus(buildId, 'generated', {
      log: 'generated ' + files.length + ' files',
    });

    const name = artifactBaseName(app.config.app.displayName, platform, buildId);

    if (platform === 'android' && (await has('gradle'))) {
      buildsRepo.setStatus(buildId, 'compiling');
      await exec('gradle', ['assembleDebug'], projectDir, (line) =>
        buildsRepo.setStatus(buildId, 'compiling', { log: line }),
      );

      const apk = join(projectDir, 'app/build/outputs/apk/debug/app-debug.apk');
      const target = join(DOWNLOAD_DIR, name + '.apk');
      await mkdir(DOWNLOAD_DIR, { recursive: true });
      await copyFile(apk, target);
      buildsRepo.setStatus(buildId, 'succeeded', { artifact: target, log: 'built APK (debug)' });
      return;
    }

    const target = join(DOWNLOAD_DIR, name + '.zip');
    await mkdir(DOWNLOAD_DIR, { recursive: true });
    await writeFile(target, await zipProject(projectDir, files));
    buildsRepo.setStatus(buildId, 'succeeded', {
      artifact: target,
      log: 'packaged ' + files.length + ' files',
    });
  } catch (error) {
    buildsRepo.setStatus(buildId, 'failed', {
      log: error instanceof Error ? error.stack ?? error.message : String(error),
    });
  } finally {
    if (process.env.KEEP_WORKDIR !== '1') {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

async function zipProject(projectDir: string, files: string[]): Promise<Buffer> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file, await readFile(join(projectDir, file)));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function artifactBaseName(displayName: string, platform: string, buildId: string): string {
  const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app';
  return slug + '-' + platform + '-' + buildId.slice(0, 8);
}

function has(bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const p = spawn(bin, ['--version'], { stdio: 'ignore' });
    p.on('error', () => resolve(false));
    p.on('close', (code) => resolve(code === 0));
  });
}

function exec(cmd: string, args: string[], cwd: string, onLine: (line: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd });
    p.stdout.on('data', (d: Buffer) => onLine(d.toString()));
    p.stderr.on('data', (d: Buffer) => onLine(d.toString()));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(cmd + ' exited ' + code))));
  });
}
