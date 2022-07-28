import * as path from 'path'
import { defineConfig } from "vite"
import svgLoader from 'vite-svg-loader'
import vue from "@vitejs/plugin-vue"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader()
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`
    }
  },
  build: {
    rollupOptions: {
      input: "src/main.ts",
      output: [
        {
          dir: "../../public/scripts",
          inlineDynamicImports: true,
          format: 'iife',
          entryFileNames: 'widget.js'
        },
        {
          dir: "../../theme-app-extension/assets",
          inlineDynamicImports: true,
          format: 'iife',
          entryFileNames: 'widget.js'
        }
      ]
    }
  }
})
