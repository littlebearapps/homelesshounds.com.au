import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://homelesshounds.com.au",
  vite: {
    plugins: [tailwind()],
  },
});