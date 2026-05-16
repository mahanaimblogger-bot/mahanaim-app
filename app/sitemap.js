import { supabase } from '@/lib/supabaseClient';

export default async function sitemap() {
  const baseUrl = 'http://localhost:3000/'; // Cambia por tu dominio final o deja localhost para pruebas

  // Páginas estáticas
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/recursos-biblicos`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/lector`, lastModified: new Date(), priority: 0.7 },
  ];

  // Obtener libros
  const { data: books } = await supabase.from('books').select('slug');
  const bookUrls = books?.map(book => ({
    url: `${baseUrl}/libro/${book.slug}`,
    lastModified: new Date(),
    priority: 0.9,
  })) || [];

  // Obtener capítulos (limitamos a 1000 para no sobrecargar)
  const { data: chapters } = await supabase
    .from('chapters')
    .select('books!inner(slug), numero')
    .limit(1000);
  const chapterUrls = chapters?.map(ch => ({
    url: `${baseUrl}/libro/${ch.books.slug}/capitulo/${ch.numero}`,
    lastModified: new Date(),
    priority: 0.8,
  })) || [];

  return [...staticPages, ...bookUrls, ...chapterUrls];
}