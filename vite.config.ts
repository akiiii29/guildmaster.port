import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('node_modules/react')) return 'react'
          if (id.includes('/src/game/i18n')) return 'localization'
          if (id.includes('/src/game/areaScripts')) return 'area-scripts'
          return undefined
        },
      },
    },
  },
})
