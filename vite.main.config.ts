import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["sqlite3", "better-sqlite3"],
    }
  },
});
