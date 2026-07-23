import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(root, 'src')

const supabaseProxyPaths = ['/auth/v1', '/rest/v1', '/storage/v1', '/realtime/v1'] as const

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '')
  const supabaseRemote =
    env.VITE_SUPABASE_REMOTE_URL?.trim() ||
    env.VITE_SUPABASE_URL?.trim() ||
    'https://doganisguvenligi.gozcucloud.com'

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths({ projects: [path.join(root, 'tsconfig.app.json')] }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor'
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor'
            }
          },
        },
      },
    },
    resolve: {
      alias: [{ find: '@', replacement: src }],
    },
    server: {
      proxy: Object.fromEntries(
        supabaseProxyPaths.map((route) => [
          route,
          {
            target: supabaseRemote,
            changeOrigin: true,
            secure: true,
            ws: route === '/realtime/v1',
          },
        ]),
      ),
    },
    preview: {
      allowedHosts: true,
      proxy: Object.fromEntries(
        supabaseProxyPaths.map((route) => [
          route,
          {
            target: supabaseRemote,
            changeOrigin: true,
            secure: true,
            ws: route === '/realtime/v1',
          },
        ]),
      ),
    },
  }
})
