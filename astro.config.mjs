import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://homelesshounds.com.au",
  output: "server",
  adapter: cloudflare({ 
    mode: "directory",
    routes: { 
      extend: { 
        include: [{ pattern: "/*" }], 
        exclude: [
          { pattern: "/_astro/*" }, 
          { pattern: "/assets/*" }, 
          { pattern: "/favicon.ico" }, 
          { pattern: "/robots.txt" }, 
          { pattern: "/sitemap.xml" }
        ] 
      } 
    }
  }),
  vite: {
    plugins: [tailwind()],
  },
});