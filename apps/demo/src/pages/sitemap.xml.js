import { FLAT_DOCS } from "../docs-config";
import { withBase } from "../base";

export function GET({ site }) {
  const paths = ["/", "/playground", ...FLAT_DOCS.map((doc) => `/docs/${doc.id}`)];
  const urls = paths
    .map((path) => {
      const loc = new URL(withBase(path), site).href;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
}
