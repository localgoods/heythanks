import vue from '@vitejs/plugin-vue'
import { UserConfig } from 'vite'
import { fileURLToPath } from 'url'
import * as path from 'path'

const config: UserConfig = {
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] })
  ],
  define: {
    'window.global': []
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
      './runtimeConfig': './runtimeConfig.browser'
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  envPrefix: 'PUBLIC_'
}

export default config
