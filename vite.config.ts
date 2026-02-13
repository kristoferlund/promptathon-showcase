import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import environment from "vite-plugin-environment";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { icpBindgen } from "@icp-sdk/bindgen/plugins/vite";

dotenv.config({ path: ".env" });

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
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    icpBindgen({
      didFile: "./src/server/server.did",
      outDir: "./src",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
});
