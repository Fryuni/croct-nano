import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const dependencies = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
];
const devDependencies = [...Object.keys(packageJson.devDependencies || {})];

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'es2020',
    bundle: true,
    dts: {
        entry: ['src/index.ts'],
    },
    sourcemap: true,
    clean: true,
    splitting: true,
    minify: true,
    external: dependencies,
    noExternal: devDependencies,
    treeshake: 'smallest',
    tsconfig: 'tsconfig.json',
    esbuildOptions: options => {
        options.chunkNames = 'chunks/[name]-[hash]';
    },
});
