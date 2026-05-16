import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const icons = {
  estudio: '📖', sermon: '🛐', video: '🎬', audio: '🎧',
  imagen: '🖼️', diapositiva: '📊', pdf: '📄', mapa: '🗺️',
  cronologia: '⏳', personaje: '👤', glosario: '📚',
  himno: '🎵', enlace: '🔗', quiz: '🧩', devocional: '✍️',
  hoja: '🖨️', testimonio: '🎙️', exegesis: '🔬', plan: '🧭',
  reflexion: '🤔', paralelos: '⛓️', palabras_clave: '🔤'
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: libro } = await supabase
    .from('books')
    .select('nombre')
    .eq('slug', slug)
    .single();

  const titulo = libro ? `${libro.nombre} – Recursos Bíblicos | Mahanaim` : 'Libro | Mahanaim';
  const descripcion = libro ? `Estudios, sermones y materiales del libro de ${libro.nombre}.` : 'Recursos bíblicos';

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, type: 'website' },
  };
}

async function getLibroYCapitulos(slug) {
  const { data: libro, error: errorLibro } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();
  if (errorLibro || !libro) return null;

  const { data: capitulos, error: errorCapitulos } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', libro.id)
    .order('numero', { ascending: true });
  if (errorCapitulos) return { libro, capitulos: [] };

  const chapterIds = capitulos.map(c => c.id);
  const { data: recursos } = await supabase
    .from('resources')
    .select('chapter_id, tipo')
    .eq('publicado', true)
    .in('chapter_id', chapterIds);

  const recursosPorCapitulo = {};
  if (recursos) {
    recursos.forEach(r => {
      if (!recursosPorCapitulo[r.chapter_id]) {
        recursosPorCapitulo[r.chapter_id] = { tipos: new Set(), total: 0 };
      }
      recursosPorCapitulo[r.chapter_id].tipos.add(r.tipo);
      recursosPorCapitulo[r.chapter_id].total++;
    });
  }

  const capitulosConRecursos = capitulos.map(cap => ({
    ...cap,
    tiposRecursos: recursosPorCapitulo[cap.id] ? Array.from(recursosPorCapitulo[cap.id].tipos) : [],
    totalRecursos: recursosPorCapitulo[cap.id] ? recursosPorCapitulo[cap.id].total : 0
  }));

  return { libro, capitulos: capitulosConRecursos };
}

function ChapterCard({ capitulo, libroSlug }) {
  const { numero, tiposRecursos, totalRecursos, resumen } = capitulo;
  
  const iconosMostrar = tiposRecursos.slice(0, 6).map(tipo => icons[tipo] || '📄');
  const hayMas = tiposRecursos.length > 6;

  return (
    <Link
      href={`/libro/${libroSlug}/capitulo/${numero}`}
      className="block bg-white border-2 border-[#e8e8e8] rounded-lg p-4 transition-all duration-200 hover:border-[#d4ac0d] hover:shadow-[0_4px_15px_rgba(26,58,92,0.1)] hover:translate-x-1"
    >
      <div>
        <h3 className="text-lg font-bold text-[#1a5276] font-['Georgia',serif] m-0 mb-2">
          Capítulo {numero}
        </h3>

        {resumen && (
          <p className="text-xs text-[#757575] mt-1 mb-2 line-clamp-2">
            {resumen}
          </p>
        )}
        
        {totalRecursos === 0 ? (
          <p className="text-sm text-gray-400 italic mt-1">Sin recursos aún</p>
        ) : (
          <div className="mt-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-3xl flex items-center gap-1.5">
                {iconosMostrar.map((icon, idx) => (
                  <span key={idx} className="inline-block">{icon}</span>
                ))}
                {hayMas && <span className="text-sm text-gray-500 ml-1">+{tiposRecursos.length - 6}</span>}
              </span>
            </div>
            <span className="text-xs text-[#757575]">
              {totalRecursos} recurso{totalRecursos !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function LibroPage({ params }) {
  const { slug } = await params;
  const data = await getLibroYCapitulos(slug);
  if (!data) notFound();

  const { libro, capitulos } = data;

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8]">
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link href="/" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Inicio
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <Link href="/recursos-biblicos" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Recursos Bíblicos
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <span className="text-[#8d6e63]">{libro.nombre}</span>
          </div>

          <Link
            href="/recursos-biblicos"
            className="inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm mb-5 transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
          >
            ← Volver a libros
          </Link>

          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b-2 border-[#d4ac0d]">
            <span className="text-2xl">📑</span>
            <h2 className="text-[#1a5276] text-xl font-bold font-['Georgia',serif] m-0">
              {libro.nombre} — Capítulos
            </h2>
          </div>

          {capitulos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#757575] text-lg">Aún no hay capítulos disponibles.</p>
              <p className="text-[#9e9e9e] text-sm mt-2">Estamos trabajando en agregar contenido pronto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capitulos.map((cap) => (
                <ChapterCard key={cap.id} capitulo={cap} libroSlug={libro.slug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}