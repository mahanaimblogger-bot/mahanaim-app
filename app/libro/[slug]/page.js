import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Obtener libro y capítulos desde Supabase
async function getLibroYCapitulos(slug) {
  // Buscar libro por slug
  const { data: libro, error: errorLibro } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (errorLibro || !libro) return null;

  // Buscar capítulos ordenados
  const { data: capitulos, error: errorCapitulos } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', libro.id)
    .order('numero', { ascending: true });

  if (errorCapitulos) return { libro, capitulos: [] };

  return { libro, capitulos };
}

// Tarjeta de capítulo (cliente)
function ChapterCard({ capitulo, libroSlug }) {
  return (
    <Link
      href={`/libro/${libroSlug}/capitulo/${capitulo.numero}`}
      className="flex items-center gap-4 bg-white border-2 border-[#e8e8e8] rounded-lg p-4 mb-3.5 transition-all duration-200 hover:border-[#d4ac0d] hover:shadow-[0_4px_15px_rgba(26,58,92,0.1)] hover:translate-x-1.5"
    >
      {/* Círculo con número del capítulo */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] to-[#2d5a3d] text-[#d4ac0d] text-xl font-bold">
        {capitulo.numero}
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-[#1a5276] font-['Georgia',serif] m-0">
          Capítulo {capitulo.numero}
        </p>
        {capitulo.resumen && (
          <p className="text-xs text-[#757575] mt-1 line-clamp-2">
            {capitulo.resumen}
          </p>
        )}
        <p className="text-xs text-[#757575] mt-1">
          Recursos disponibles
        </p>
      </div>

      {/* Flecha dorada */}
      <span className="text-[#d4ac0d] text-lg flex-shrink-0">›</span>
    </Link>
  );
}

// Página principal del libro
export default async function LibroPage({ params }) {
  const { slug } = await params;
  const data = await getLibroYCapitulos(slug);

  if (!data) {
    notFound();
  }

  const { libro, capitulos } = data;

  return (
    // Contenedor externo SIN color de fondo (hereda el pergamino del body)
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0 pb-10">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8]">
          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link
              href="/"
              className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]"
            >
              Recursos Bíblicos
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <span className="text-[#8d6e63]">{libro.nombre}</span>
          </div>

          {/* Botón volver */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm mb-5 transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
          >
            ← Volver a libros
          </Link>

          {/* Encabezado de sección */}
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b-2 border-[#d4ac0d]">
            <span className="text-2xl">📑</span>
            <h2 className="text-[#1a5276] text-xl font-bold font-['Georgia',serif] m-0">
              {libro.nombre} — Capítulos
            </h2>
          </div>

          {/* Lista de capítulos */}
          {capitulos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#757575] text-lg">
                Aún no hay capítulos disponibles para este libro.
              </p>
              <p className="text-[#9e9e9e] text-sm mt-2">
                Estamos trabajando en agregar contenido pronto.
              </p>
            </div>
          ) : (
            <div>
              {capitulos.map((cap) => (
                <ChapterCard
                  key={cap.id}
                  capitulo={cap}
                  libroSlug={libro.slug}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-5 text-sm text-[#8d6e63] border-t border-[#d4c4a8] mt-0 font-['Georgia',serif]">
          © Mahanaim &quot;Campamento de Dios&quot; —{' '}
          <a
            href="https://mahanaimcampamentodivino.blogspot.com"
            className="text-[#5d4037] hover:text-[#bf360c]"
          >
            Inicio del Blog
          </a>
        </footer>
      </div>
    </div>
  );
}