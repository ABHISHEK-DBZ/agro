import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get base path based on deployment platform
const getBasePath = () => {
  // GitHub Pages
  if (process.env.GITHUB_PAGES) return '/smart-krishi-sahayak/'
  // Firebase, Vercel, Netlify, Surge, Railway - use root
  return '/'
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          i18n: ['i18next', 'react-i18next'],
          ai: ['@google/generative-ai']
        }
      }
    }
  },
  publicDir: 'public'
})
