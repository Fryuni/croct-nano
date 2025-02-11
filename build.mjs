import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    outfile: 'build/index.js',
    platform: 'neutral',
    format: 'esm',
    sourcemap: 'external',
    external: ['nanostores', '@croct/plug'],
});
