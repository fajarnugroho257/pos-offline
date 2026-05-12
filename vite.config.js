import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/app-kasir/", // 🔥 WAJIB
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "POS Sammeramart",
        short_name: "POS",
        start_url: "/app-kasir/", // 🔥 penting
        scope: "/app-kasir/", // 🔥 tambah ini
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
      },
    }),
  ],
});
