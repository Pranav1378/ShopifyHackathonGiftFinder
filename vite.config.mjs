import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig, loadEnv} from 'vite'

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Expose process.env.FAL_KEY to client code without requiring VITE_ prefix.
  const falKey = env.FAL_KEY || env.VITE_FAL_KEY || ''

  return {
    root: '.',
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['@shopify/shop-minis-react'],
    },
    define: {
      'process.env.FAL_KEY': JSON.stringify(falKey),
    },
  }
})
