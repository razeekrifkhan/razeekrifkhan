import type { APIRoute } from "astro";
import { services } from "../data";
export const GET: APIRoute = ({ site }) => {
  const routes = [
    "/",
    "/services/",
    "/employers/",
    "/about/",
    "/contact/",
    "/privacy/",
    ...services.map((s) => `/services/${s.slug}/`),
  ];
  const urls = site
    ? routes
        .map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`)
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
