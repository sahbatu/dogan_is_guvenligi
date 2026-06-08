import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(root, 'src')

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: [path.join(root, 'tsconfig.app.json')] }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: src },
    ],
  },
})
