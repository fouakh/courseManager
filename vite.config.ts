import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/courseManager/",
  server: {
    open: true,
    port: 3001,
  },
  // resolve: {
  //   dedupe: ['react', 'react-dom'],
  //   alias: {
  //     fs: 'fs'
  //   }
  // },
  // optimizeDeps: {
  //   include: ['lucide-react']
  // }
});