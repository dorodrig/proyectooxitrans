import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/proyectooxitrans/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
