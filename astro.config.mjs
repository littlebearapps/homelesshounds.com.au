import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://homelesshounds.com.au",
  output: "server", // Full SSR for better compatibility
  adapter: cloudflare({
    mode: "advanced"
  }),
  vite: {
    plugins: [tailwind()],
  },
});