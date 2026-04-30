import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Obtener el recurso junto con el capítulo y el libro
async function getRecursoCompleto(id) {
  const { data: recurso, error } = await supabase
    .from('resources')
    .select('*, chapters(*, books(*))')
    .eq('id', id)
    .single();

  if (error || !recurso) return null;
  return recurso;
}

export default async function RecursoPage({ params }) {
  const { id } = await params;
  const recurso = await getRecursoCompleto(id);

  if (!recurso) {
    notFound();
  }

  const libro = recurso.chapters?.books;
  const capitulo = recurso.chapters;
  const titulo = recurso.titulo || 'Sin título';

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0 pb-10">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8]">

          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link href="/" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Recursos Bíblicos
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            {libro && (
              <>
                <Link href={`/libro/${libro.slug}`} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
                  {libro.nombre}
                </Link>
                <span className="text-[#9e9e9e] mx-2">›</span>
              </>
            )}
            {capitulo && (
              <>
                <Link href={`/libro/${libro.slug}/capitulo/${capitulo.numero}`} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
                  Capítulo {capitulo.numero}
                </Link>
                <span className="text-[#9e9e9e] mx-2">›</span>
              </>
            )}
            <span className="text-[#8d6e63]">{titulo}</span>
          </div>

          {/* Botón volver */}
          {capitulo && libro && (
            <Link
              href={`/libro/${libro.slug}/capitulo/${capitulo.numero}`}
              className="inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm mb-5 transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
            >
              ← Volver a recursos del capítulo
            </Link>
          )}

          {/* Contenido del recurso */}
          <div className="bg-white p-8 rounded-xl shadow-md text-justify text-[17px] leading-relaxed font-['Georgia',serif] text-[#333] border border-[#d4c4a8]">
            <h1 className="text-3xl text-[#1a5276] border-b-2 border-[#d4ac0d] pb-3 mb-6 text-center font-['Georgia',serif]">
              {titulo}
            </h1>

            {recurso.contenido_html ? (
              <div
                className="contenedor-blog"
                dangerouslySetInnerHTML={{ __html: recurso.contenido_html }}
              />
            ) : (
              <p className="text-center text-[#757575]">Este recurso no tiene contenido disponible aún.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center py-5 text-sm text-[#8d6e63] border-t border-[#d4c4a8] mt-0 font-['Georgia',serif]">
          © Mahanaim &quot;Campamento de Dios&quot; —{' '}
          <a href="https://mahanaimcampamentodivino.blogspot.com" className="text-[#5d4037] hover:text-[#bf360c]">
            Inicio del Blog
          </a>
        </footer>
      </div>
    </div>
  );
}