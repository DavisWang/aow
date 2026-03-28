import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths keep the production bundle compatible with GitHub
  // Pages project-site hosting where the app is served from `/aow/`.
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
