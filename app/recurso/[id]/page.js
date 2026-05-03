import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../estudios.css';

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

  let portadaUrl = null;
  let contenidoSinPortada = recurso.contenido_html || '';

  if (recurso.modo === 'markdown') {
    const match = contenidoSinPortada.match(
      /<div class="imagen-portada"><img alt=".*?" src="(.*?)" \/><\/div>/
    );
    if (match) {
      portadaUrl = match[1];
      contenidoSinPortada = contenidoSinPortada.replace(
        /<div class="imagen-portada">.*?<\/div>\n?/,
        ''
      );
    }
  }

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
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
          <div className="bg-white p-8 rounded-xl shadow-md border border-[#d4c4a8]">
            {/* Portada (si existe en modo markdown) */}
            {portadaUrl && (
              <div className="imagen-portada">
                <img alt={titulo} src={portadaUrl} />
              </div>
            )}

            {/* HTML del contenido */}
            <div
              className="contenedor-blog"
              dangerouslySetInnerHTML={{ __html: contenidoSinPortada }}
            />

            {/* Pie del estudio */}
            <div className="mt-8 pt-6 border-t border-[#d4ac0d] text-center text-sm text-[#8d6e63] font-['Georgia',serif]">
              <p className="mb-1">
                Estudio bíblico de Mahanaim — Recursos Bíblicos
              </p>
              <p className="text-xs text-[#9e9e9e]">
                © {new Date().getFullYear()} Mahanaim &quot;Campamento de Dios&quot;. 
                Todos los derechos reservados.
              </p>
              <p className="text-xs text-[#9e9e9e] mt-1">
                Este material puede ser compartido libremente citando la fuente.
              </p>
            </div>
          </div>
        </div>

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