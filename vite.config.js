import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // تنظیمات اضافی برای جلوگیری از خطاهای احتمالی حافظه در بیلد
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 3000,
  }
})