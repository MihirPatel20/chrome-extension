import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';

// Plugin to copy manifest and handle CSS
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    closeBundle() {
      // Ensure dist directory exists
      try {
        mkdirSync('dist', { recursive: true });
      } catch (err) {
        // Directory might already exist
      }
      
      // Copy manifest to dist
      copyFileSync('manifest.json', 'dist/manifest.json');
      
      // Copy content CSS to dist
      copyFileSync('src/content.css', 'dist/assets/content.css');
    }
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    // Ensure source maps are generated
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});