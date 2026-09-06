import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://credits.kyeshimizu.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" }
});
