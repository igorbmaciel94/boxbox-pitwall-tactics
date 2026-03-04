import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@boxbox/engine': resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@boxbox/content': resolve(__dirname, '../../packages/content/src/index.ts'),
      '@content-data': resolve(__dirname, '../../packages/content/data'),
      '@': resolve(__dirname, 'src'),
    },
  },
});
