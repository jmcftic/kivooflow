/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-scroll-area']
        }
      }
    }
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://kivoo.kivooapp.co',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});