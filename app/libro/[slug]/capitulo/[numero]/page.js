import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CharacterDetector from './CharacterDetector';
import { ICONS, LABELS } from '@/lib/tiposRecursos';
import Breadcrumb from '@/app/componentes/Breadcrumb';

export async function generateMetadata({ params }) {
  const { slug, numero } = await params;
  const { data: libro } = await supabase
    .from('books')
    .select('nombre')
    .eq('slug', slug)
    .single();

  const titulo = libro 
    ? `${libro.nombre} capítulo ${numero} – Recursos | Mahanaim` 
    : `Capítulo ${numero} | Mahanaim`;
  const descripcion = libro 
    ? `Estudios, sermones, videos y materiales del capítulo ${numero} de ${libro.nombre}.` 
    : `Recursos bíblicos del capítulo ${numero}.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, type: 'website' },
  };
}

async function getRecursos(slug, numero) {
  const { data: libro, error: errorLibro } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (errorLibro || !libro) return null;

  const { data: capitulo, error: errorCapitulo } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', libro.id)
    .eq('numero', numero)
    .single();

  if (errorCapitulo || !capitulo) return null;

    const { data: recursos, error: errorRecursos } = await supabase
    .from('resources')
    .select('*')
    .eq('chapter_id', capitulo.id)
    .or('tipo.neq.estudio,publicado.eq.true')
    .order('orden', { ascending: true });

  return { libro, capitulo, recursos: recursos || [] };
}

function ResourceCard({ recurso }) {
  const tipo = recurso.tipo || 'estudio';
  const icon = ICONS[tipo] || '📄';
  const label = LABELS[tipo] || tipo;
  const titulo = recurso.titulo || label;

  return (
    <Link
      href={`/recurso/${recurso.id}`}
      className="bg-white border-2 border-[#e8e8e8] rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-[#d4ac0d] hover:shadow-[0_10px_30px_rgba(26,58,92,0.15)] hover:-translate-y-1 flex flex-col items-center gap-3"
    >
      <span className="text-5xl">{icon}</span>
      <p className="text-lg font-bold text-[#1a5276] font-['Georgia',serif] leading-tight">
        {titulo}
      </p>
      <span className="text-xs text-white bg-[#1a3a5c] px-3 py-1 rounded-full uppercase tracking-wide">
        {label}
      </span>
    </Link>
  );
}

export default async function RecursosPage({ params }) {
  const { slug, numero } = await params;
  const data = await getRecursos(slug, numero);

  if (!data) notFound();

  const { libro, capitulo, recursos } = data;

  const ordenPrioridad = [
    'estudio', 'cronologia', 'bosquejo', 'personaje', 'exegesis',
    'contexto_arqueologico', 'paralelos', 'palabras_clave', 'profecias',
    'citas_teologos', 'citas_libros', 'glosario', 'infografia',
    'diagrama_estructura', 'devocional', 'hoja', 'reflexion',
    'sermon', 'quiz', 'plan', 'imagen', 'video', 'audio',
    'diapositiva', 'pdf', 'mapa', 'himno', 'testimonio', 'enlace'
  ];

  const recursosOrdenados = [...recursos].sort((a, b) => {
    const prioridadA = ordenPrioridad.indexOf(a.tipo) !== -1 ? ordenPrioridad.indexOf(a.tipo) : 999;
    const prioridadB = ordenPrioridad.indexOf(b.tipo) !== -1 ? ordenPrioridad.indexOf(b.tipo) : 999;
    return prioridadA - prioridadB;
  });

  const recursosSinPersonajes = recursosOrdenados.filter(rec => rec.tipo !== 'personaje');

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8]">
          <Breadcrumb items={[
            { name: 'Inicio', href: '/' },
            { name: 'Recursos Bíblicos', href: '/recursos-biblicos' },
            { name: libro.nombre, href: `/libro/${libro.slug}` },
            { name: `Capítulo ${capitulo.numero}`, href: null }
          ]} />

          <div className="flex justify-between items-center gap-4 mb-5">
            <Link
              href={`/libro/${libro.slug}`}
              className="inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
            >
              ← Volver a capítulos
            </Link>
            <Link
              href={`/lector/${slug}/${capitulo.numero}`}
              className="inline-flex items-center gap-1.5 bg-[#d4ac0d] text-[#1a3a5c] border border-[#d4ac0d] px-4 py-2 rounded-md text-sm font-bold transition-all hover:bg-[#e0b820]"
            >
              📖 Ir a la lectura bíblica
            </Link>
          </div>

          <h2 className="text-2xl text-[#1a5276] text-center mb-2 pb-4 border-b-2 border-[#d4ac0d] font-['Georgia',serif]">
            {libro.nombre} — Capítulo {capitulo.numero}
          </h2>
          <p className="text-center text-[#757575] mb-6">Elige qué recurso querés ver:</p>

          {recursosSinPersonajes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#757575] text-lg">Aún no hay recursos para este capítulo.</p>
              <p className="text-[#9e9e9e] text-sm mt-2">Estamos preparando contenido.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {recursosSinPersonajes.map((rec) => (
                <ResourceCard key={rec.id} recurso={rec} />
              ))}
            </div>
          )}

          <CharacterDetector bookId={libro.id} chapterNum={parseInt(numero)} />
        </div>
      </div>
    </div>
  );
}
