import { defineConfig } from "astro/config";

// Set PUBLIC_SITE_URL to the approved origin before production deployment.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || undefined,
  trailingSlash: "always",
  output: "static",
  devToolbar: { enabled: false },
  build: { format: "directory" },
});
