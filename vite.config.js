import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
       '@layouts': path.resolve(__dirname, './src/components/Common'),
      '@components': path.resolve(__dirname, './src/components') 
    },
  },
  server: {
    proxy: {
      // Forward /storage requests to Laravel
      "/storage": "http://127.0.0.1:8000",
    },
  },
});
