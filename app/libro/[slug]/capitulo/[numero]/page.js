import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// ─── Iconos y etiquetas (actualizado con nuevos tipos) ───
const icons = {
  estudio: '📖', sermon: '🛐', video: '🎬', audio: '🎧',
  imagen: '🖼️', diapositiva: '📊', pdf: '📄', mapa: '🗺️',
  cronologia: '⏳', personaje: '👤', glosario: '📚',
  himno: '🎵', enlace: '🔗', quiz: '🧩', devocional: '✍️',
  hoja: '🖨️', testimonio: '🎙️', exegesis: '🔬', plan: '🧭',
  // Nuevos recursos automáticos
  reflexion: '🤔',
  paralelos: '⛓️',
  palabras_clave: '🔤'
};

const labels = {
  estudio: 'Estudio Bíblico', sermon: 'Sermón / Prédica',
  video: 'Video Resumen', audio: 'Audio / Podcast',
  imagen: 'Imagen / Ilustración', diapositiva: 'Diapositivas',
  pdf: 'PDF / Documento', mapa: 'Mapa Interactivo',
  cronologia: 'Línea de Tiempo', personaje: 'Ficha de Personaje',
  glosario: 'Glosario de Términos', himno: 'Himno / Alabanza',
  enlace: 'Recurso Externo', quiz: 'Cuestionario',
  devocional: 'Devocional', hoja: 'Hoja de Trabajo',
  testimonio: 'Testimonio', exegesis: 'Comentario Exegético',
  plan: 'Plan de Lectura',
  // Nuevos recursos automáticos
  reflexion: 'Preguntas de Reflexión',
  paralelos: 'Paralelos Bíblicos',
  palabras_clave: 'Estudio de Palabras Clave'
};

// ─── Obtener libro, capítulo y recursos ───
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
    .order('orden', { ascending: true });

  return { libro, capitulo, recursos: recursos || [] };
}

// ─── Tarjeta de recurso (cliente) ───
function ResourceCard({ recurso }) {
  const tipo = recurso.tipo || 'estudio';
  const icon = icons[tipo] || '📄';
  const label = labels[tipo] || tipo;
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

// ─── Página principal de recursos del capítulo ───
export default async function RecursosPage({ params }) {
  const { slug, numero } = await params;
  const data = await getRecursos(slug, numero);

  if (!data) {
    notFound();
  }

  const { libro, capitulo, recursos } = data;

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
            <Link href={`/libro/${libro.slug}`} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              {libro.nombre}
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <span className="text-[#8d6e63]">Capítulo {capitulo.numero}</span>
          </div>

          {/* Botón volver */}
          <Link
            href={`/libro/${libro.slug}`}
            className="inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm mb-5 transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
          >
            ← Volver a capítulos
          </Link>

          {/* Encabezado */}
          <h2 className="text-2xl text-[#1a5276] text-center mb-2 pb-4 border-b-2 border-[#d4ac0d] font-['Georgia',serif]">
            {libro.nombre} — Capítulo {capitulo.numero}
          </h2>
          <p className="text-center text-[#757575] mb-6">Elige qué recurso querés ver:</p>

          {/* Cuadrícula de recursos */}
          {recursos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#757575] text-lg">Aún no hay recursos para este capítulo.</p>
              <p className="text-[#9e9e9e] text-sm mt-2">Estamos preparando contenido.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recursos.map((rec) => (
                <ResourceCard key={rec.id} recurso={rec} />
              ))}
            </div>
          )}
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