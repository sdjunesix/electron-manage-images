import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components/index.ts'),
      '@constants': path.resolve(__dirname, 'src/constants/index.ts'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services/index.ts'),
      'types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils/index.ts'),
    },
  },
});
