/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild')

const esbuildArgs = process.argv.slice(2)
const shouldWatch = esbuildArgs.includes('--watch')

esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'node',
    target: 'esnext',
    external: ['pg-native'],
    watch: shouldWatch
}).then(buildResult => {
    console.log('Build succeeded', buildResult)
})