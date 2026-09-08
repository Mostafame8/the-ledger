import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// Relative base so dist/index.html works from any folder or preview server, not only a site root.
// The Pyodide worker is a module worker; emitting it as ES keeps its CDN import a real import
// instead of an IIFE global (which produced "pyodide_mjs is not defined" in production builds).
export default defineConfig({ base: './', plugins: [vue()], worker: { format: 'es' } })
