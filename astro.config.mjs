import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://homelesshounds.com.au", // Will be updated with your Cloudflare Pages URL
  vite: {
    plugins: [tailwind()],
  },
});