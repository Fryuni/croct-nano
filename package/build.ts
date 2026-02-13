import { readFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
];

rmSync('./dist', { recursive: true, force: true });

const result = await Bun.build({
    entrypoints: ['src/index.ts'],
    outdir: './dist',
    format: 'esm',
    target: 'browser',
    splitting: true,
    minify: true,
    sourcemap: 'linked',
    external,
    naming: {
        entry: '[dir]/[name].[ext]',
        chunk: 'chunks/[name]-[hash].[ext]',
    },
});

if (!result.success) {
    for (const log of result.logs) {
        console.error(log);
    }
    process.exit(1);
}

for (const output of result.outputs) {
    console.log(`  ${output.path} (${output.size} bytes)`);
}

execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });
