import * as path from 'path'
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import svgLoader from 'vite-svg-loader'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader()
  ],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`
    }
  },
  build: {
    rollupOptions: {
      input: "src/main.ts",
      output: {
        dir: "../public/scripts",
        inlineDynamicImports: true,
        format: 'iife',
        entryFileNames: 'widget.js'
      }
    }
  }
})
