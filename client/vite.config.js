import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    // increases chunk size limit to 1 MB (1000 KB)
    chunkSizeWarningLimit: 1000
  }
});
