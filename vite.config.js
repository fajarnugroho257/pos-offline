import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/testing-app/", // 🔥 WAJIB
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "POS Sammeramart",
        short_name: "POS",
        start_url: "/testing-app/", // 🔥 penting
        scope: "/testing-app/", // 🔥 tambah ini
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
      },
    }),
  ],
});
