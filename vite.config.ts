import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Get base path based on deployment platform
const getBasePath = () => {
  // GitHub Pages
  if (process.env.GITHUB_PAGES) return '/smart-krishi-sahayak/'
  // Firebase, Vercel, Netlify, Surge, Railway - use root
  return '/'
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable automatic JSX runtime (no need to import React in every file)
      jsxRuntime: 'automatic'
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  base: getBasePath(),
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - Core libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Framer Motion animations
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // AI libraries
            if (id.includes('@google/generative-ai')) {
              return 'vendor-ai';
            }
            // Axios and other HTTP clients
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            // All other node_modules
            return 'vendor-misc';
          }
          
          // App chunks - Group by feature
          // Admin pages
          if (id.includes('/pages/Admin')) {
            return 'app-admin';
          }
          // Community pages
          if (id.includes('/pages/Community') || 
              id.includes('/pages/Groups') || 
              id.includes('/pages/Messages') || 
              id.includes('/pages/Leaderboard')) {
            return 'app-community';
          }
          // Feature pages (new features)
          if (id.includes('/pages/CropCalendar') || 
              id.includes('/pages/LoanCalculator') || 
              id.includes('/pages/SoilTesting')) {
            return 'app-features';
          }
          // Main pages
          if (id.includes('/pages/Dashboard') || 
              id.includes('/pages/Weather') || 
              id.includes('/pages/MarketPrices')) {
            return 'app-main';
          }
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Minify options
    minify: 'esbuild',
    target: 'esnext'
  },
  publicDir: 'public'
})
