import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// CSS-only build for server-side rendered pages
export default defineConfig({
  publicDir: "public",
  build: {
    outDir: "src/dist",
    rollupOptions: {
      input: "./src/main.js",
      output: {
        assetFileNames: "assets/[name].[ext]",
      },
    },
    cssCodeSplit: false,
  },
  plugins: [
    tailwindcss(),
  ],
});
