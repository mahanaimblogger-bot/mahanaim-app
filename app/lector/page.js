import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export const metadata = {
  title: 'Lector Bíblico - Mahanaim',
  description: 'Lee la Biblia Reina Valera 1960, capítulo por capítulo.',
};

export default async function LectorPage() {
  const { data: libros, error } = await supabase
    .from('books')
    .select('id, nombre, slug')
    .order('orden', { ascending: true }); // Orden bíblico

  if (error) {
    console.error(error);
    return <div className="text-center py-12 text-red-600">Error al cargar los libros.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1a5276] text-center mb-4">Lector Bíblico</h1>
      <p className="text-center text-[#5d4037] mb-12">Reina Valera 1960</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {libros.map((libro) => (
          <Link
            key={libro.id}
            href={`/lector/${libro.slug}`}
            className="block bg-white border border-[#d4c4a8] rounded-lg p-3 text-center hover:shadow-md hover:border-[#d4ac0d] transition"
          >
            <span className="font-bold text-[#1a5276]">{libro.nombre}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}