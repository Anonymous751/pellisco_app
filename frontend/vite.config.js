import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:1551",
        changeOrigin: true, // Helps with host headers
        secure: false, // If you aren't using SSL/HTTPS
      },
    },
  },
});
