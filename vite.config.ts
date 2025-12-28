import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'sw.js', dest: '' },
        { src: 'metadata.json', dest: '' }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});