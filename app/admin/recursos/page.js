import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../estudios.css';
import ScriptExecutor from './ScriptExecutor';
import AudioPlayer from '@/app/componentes/AudioPlayer';
import ShareButtons from '@/app/componentes/ShareButtons';
import Breadcrumb from '@/app/componentes/Breadcrumb';
import PrintButton from '@/app/componentes/PrintButton';

// ============================================================
// Función para extraer ID de YouTube y generar iframe
// ============================================================
function renderVideoEmbed(url) {
  if (!url) return null;
  let videoId = '';
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
  } else if (lowerUrl.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  } else if (lowerUrl.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split(/[?#]/)[0];
  }

  if (videoId) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
        ></iframe>
      </div>
    );
  }
  return null;
}

// ============================================================
// Obtener recurso completo desde Supabase
// ============================================================
async function getRecursoCompleto(id) {
  const { data: recurso, error } = await supabase
    .from('resources')
    .select('*, chapters(*, books(*))')
    .eq('id', id)
    .single();

  if (error || !recurso) return null;
  return recurso;
}

// ============================================================
// Componente principal
// ============================================================
export default async function RecursoPage({ params }) {
  const { id } = await params;
  const recurso = await getRecursoCompleto(id);

  if (!recurso) notFound();

  const libro = recurso.chapters?.books;
  const capitulo = recurso.chapters;
  const titulo = recurso.titulo || 'Sin título';
  const tipo = recurso.tipo || 'estudio';
  const urlRecurso = recurso.recurso_url || '';
  const lowerUrl = urlRecurso.toLowerCase();

  let portadaUrl = null;
  let contenidoSinPortada = recurso.contenido_html || '';

  if (recurso.modo === 'markdown') {
    const match = contenidoSinPortada.match(/<div class="imagen-portada"><img alt=".*?" src="(.*?)" \/><\/div>/);
    if (match) {
      portadaUrl = match[1];
      contenidoSinPortada = contenidoSinPortada.replace(/<div class="imagen-portada">.*?<\/div>\n?/, '');
    }
  }

  // ============================================================
  // LÓGICA DE RENDERIZADO SEGÚN EL TIPO DE RECURSO
  // ============================================================
  
  // 1. PDF o DIAPOSITIVAS (PPT/PPTX) -> Usamos Google Docs Viewer (Más compatible con Archive.org)
  if (tipo === 'pdf' || tipo === 'diapositiva' || tipo === 'ppt' || lowerUrl.match(/\.(pdf|ppt|pptx)$/)) {
    // Codificamos la URL para que Google Docs la pueda leer sin errores
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(urlRecurso)}&embedded=true`;
    
    var contenidoPrincipal = (
      <div className="w-full border border-[#d4c4a8] rounded-xl overflow-hidden bg-white">
        <iframe
          src={viewerUrl}
          className="w-full h-[75vh] min-h-[600px]"
          title={`Visor de ${tipo === 'diapositiva' ? 'Diapositivas' : 'PDF'}`}
          allowFullScreen
        />
        <div className="p-4 bg-[#fdfbf7] text-center border-t border-[#d4c4a8]">
          <p className="text-sm text-[#5d4037] mb-2">¿No se visualiza correctamente?</p>
          <a 
            href={urlRecurso} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition"
          >
            📥 Descargar archivo directamente
          </a>
        </div>
      </div>
    );
  } 
  // 2. VIDEO
  else if (tipo === 'video' && urlRecurso) {
    var contenidoPrincipal = renderVideoEmbed(urlRecurso) || (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">⚠️ URL de video no válida. <a href={urlRecurso} target="_blank" className="underline font-bold">Ver en YouTube</a></p>
      </div>
    );
  }
  // 3. AUDIO
  else if (tipo === 'audio' && urlRecurso) {
    var contenidoPrincipal = (
      <AudioPlayer
        url={urlRecurso}
        titulo={titulo}
        libroNombre={libro?.nombre || 'Libro'}
        capituloNumero={capitulo?.numero || ''}
      />
    );
  }
  // 4. TEXTO / HTML / ESTUDIO (Default)
  else {
    var contenidoPrincipal = <ScriptExecutor htmlContent={contenidoSinPortada} />;
  }

  // ============================================================
  // RENDERIZADO DE LA PÁGINA
  // ============================================================
  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="w-full px-0 sm:max-w-[922px] sm:px-0 sm:mx-auto">
        <div className="bg-[#fdfbf7] p-2 sm:p-5 border border-[#d4c4a8]">
          
          <Breadcrumb items={[
            { name: 'Inicio', href: '/' },
            { name: 'Recursos Bíblicos', href: '/recursos-biblicos' },
            ...(libro ? [{ name: libro.nombre, href: `/libro/${libro.slug}` }] : []),
            ...(capitulo ? [{ name: `Capítulo ${capitulo.numero}`, href: `/libro/${libro.slug}/capitulo/${capitulo.numero}` }] : []),
            { name: titulo, href: null }
          ]} />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            {capitulo && libro && (
              <Link
                href={`/libro/${libro.slug}/capitulo/${capitulo.numero}`}
                className="no-print inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
              >
                ← Volver a recursos del capítulo
              </Link>
            )}
            <div className="no-print"><PrintButton /></div>
          </div>

          <div id="area-impresion" className="bg-white p-3 sm:p-8 rounded-xl shadow-md border border-[#d4c4a8] w-full">
            {portadaUrl && (
              <div className="imagen-portada mb-6">
                <img alt={titulo} src={portadaUrl} className="w-full rounded-lg" />
              </div>
            )}

            {/* Aquí se inyecta el contenido según el tipo */}
            {contenidoPrincipal}

            <div className="no-print mt-6">
              <ShareButtons title={titulo} />  
            </div>

            <div className="mt-8 pt-6 border-t border-[#d4ac0d] text-center text-sm text-[#8d6e63] font-['Georgia',serif]">
              <p className="mb-1">Estudio bíblico de Mahanaim — Recursos Bíblicos</p>
              <p className="text-xs text-[#9e9e9e]">© {new Date().getFullYear()} Mahanaim "Campamento de Dios". Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
