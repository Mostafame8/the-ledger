import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// Relative base so dist/index.html works from any folder or preview server, not only a site root.
export default defineConfig({ base: './', plugins: [vue()] })
