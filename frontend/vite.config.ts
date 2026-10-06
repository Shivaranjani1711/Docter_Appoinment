import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Bind to all network interfaces (not just localhost) so the app is
    // reachable from other devices on the same Wi-Fi/LAN, e.g. for opening
    // an emailed verification link on a phone.
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
