import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from 'vite-svg-loader'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader()
  ],
  build: {
    rollupOptions: {
      input: "src/main.ts",
      output: {
        dir: "../public/scripts",
        inlineDynamicImports: true,
        format: 'iife',
        entryFileNames: 'tips-widget-vite.js'
      }
    }
  }
});
