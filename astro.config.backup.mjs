import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
// Temporarily disable sitemap - causing dev server issues
// import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://homelesshounds.com.au",
  output: "server",
  // Sitemap disabled temporarily - will be enabled in production
  // integrations: [sitemap(...)],
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