import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) requires a function; object form is not supported.
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) {
            return "framer";
          }
        },
      },
    },
  },
});
