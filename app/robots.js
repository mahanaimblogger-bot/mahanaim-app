export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: 'http://localhost:3000/sitemap.xml', // Ajusta el dominio
  };
}