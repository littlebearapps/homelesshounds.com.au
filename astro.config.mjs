import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://homelesshounds.com.au",
  output: "hybrid", // Enable API routes with SSR
  adapter: cloudflare(),
  vite: {
    plugins: [tailwind()],
  },
});