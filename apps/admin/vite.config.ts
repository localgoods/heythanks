import vue from '@vitejs/plugin-vue'
import { UserConfig } from 'vite'
import { fileURLToPath } from 'url'
import * as path from 'path'
import pages from 'vite-plugin-pages'

const config: UserConfig = {
  plugins: [
    vue({ include: [/\.vue$/] }),
    pages({
      dirs: [{ dir: 'src/pages', baseRoute: '' }],
      extensions: ['vue'],
    })
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
