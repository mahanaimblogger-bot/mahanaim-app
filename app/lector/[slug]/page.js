import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: libro } = await supabase
    .from('books')
    .select('nombre')
    .eq('slug', slug)
    .single();
  
  return {
    title: `${libro?.nombre || 'Libro'} - Lector Bíblico | Mahanaim`,
  };
}

export default async function LectorLibroPage({ params }) {
  const { slug } = await params;
  
  // Obtener información del libro
  const { data: libro, error: libroError } = await supabase
    .from('books')
    .select('id, nombre')
    .eq('slug', slug)
    .single();

  if (libroError || !libro) {
    notFound();
  }

  // Obtener todos los capítulos del libro
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('numero')
    .eq('book_id', libro.id)
    .order('numero');

  if (chaptersError) {
    console.error(chaptersError);
  }

  const totalCapitulos = chapters?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/lector" className="text-[#d4ac0d] hover:underline">← Todos los libros</Link>
        <h1 className="text-3xl font-bold text-[#1a5276] mt-4">{libro.nombre}</h1>
        <p className="text-[#5d4037]">{totalCapitulos} capítulos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {chapters?.map((cap) => (
          <Link
            key={cap.numero}
            href={`/lector/${slug}/${cap.numero}`}
            className="block bg-white border border-[#d4c4a8] rounded-lg p-3 text-center hover:shadow-md hover:border-[#d4ac0d] transition"
          >
            <span className="font-bold text-[#1a5276]">Capítulo {cap.numero}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}