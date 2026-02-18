import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

dotenv.config({ path: ".env" });

const canisterId = process.env.CANISTER_ID_SERVER;
const canisterHost = `http://localhost:4943`;

export default defineConfig({
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: canisterHost,
        changeOrigin: true,
        headers: { Host: `${canisterId || ""}.localhost:4943` },
      },
      "/images": {
        target: canisterHost,
        changeOrigin: true,
        headers: { Host: `${canisterId || ""}.localhost:4943` },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
});
