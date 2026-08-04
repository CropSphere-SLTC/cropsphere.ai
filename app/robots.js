// There was no robots.txt at all, so the admin portal was as crawlable as any
// other route. The X-Robots-Tag header set in next.config.mjs covers well-
// behaved crawlers that ignore this file, and vice versa.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
  };
}
