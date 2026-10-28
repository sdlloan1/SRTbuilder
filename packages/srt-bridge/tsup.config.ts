import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
  },
  {
    // The file the native shell injects. Self-installing IIFE.
    entry: { 'srt-bridge': 'src/index.ts' },
    format: ['iife'],
    globalName: 'SRTBridge',
    minify: true,
    sourcemap: false,
    target: 'es2018',
    outExtension: () => ({ js: '.js' }),
    footer: { js: 'if(typeof window!=="undefined"){SRTBridge.install(window);}' },
  },
]);
