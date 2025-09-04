import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://littlebearapps.github.io/homelesshounds.com.au",
  vite: {
    plugins: [tailwind()],
  },
});