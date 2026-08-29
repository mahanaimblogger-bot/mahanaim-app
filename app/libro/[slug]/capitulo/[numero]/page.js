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
  
  // Fallback si no se puede extraer el ID
  return (
    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <p className="text-sm text-yellow-800">
        ⚠️ No se pudo cargar el video. 
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline ml-1">
          Ver en YouTube directamente
        </a>
      </p>
    </div>
  );
}

// ============================================================
// Función para generar HTML automático a partir de una URL según el tipo
// ============================================================
function generarHtmlDesdeUrl(url, tipo, titulo) {
  if (!url || url.trim() === '') return '';

  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  // ---------------- Video / YouTube ----------------
  if (tipo === 'video' || lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be/')) {
    const embed = renderVideoEmbed(trimmedUrl);
    // Convertimos el JSX a string para ScriptExecutor o lo manejamos aparte
    // En este caso, como usamos ScriptExecutor para otros tipos, 
    // devolveremos un div contenedor que ScriptExecutor pueda manejar o lo trataremos especial
    return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${lowerUrl.includes('youtu.be/') ? trimmedUrl.split('youtu.be/')[1].split(/[?#]/)[0] : new URLSearchParams(trimmedUrl.split('?')[1]).get('v')}" frameborder="0" allowfullscreen style="width:100%; aspect-ratio:16/9; border-radius:12px;"></iframe></div>`;
  }

  // ---------------- Audio ----------------
  if (tipo === 'audio' || /\.(mp3|wav|ogg|m4a|flac)(\?.*)?$/i.test(trimmedUrl)) {
    return `<audio controls style="width:100%; margin:1rem 0; border-radius:12px;">
      <source src="${trimmedUrl}" type="audio/mpeg">
      Tu navegador no soporta el elemento de audio.
    </audio>`;
  }

  // ---------------- Imagen ----------------
  if (tipo === 'imagen' || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(trimmedUrl)) {
    return `<img src="${trimmedUrl}" alt="${titulo}" style="max-width:100%; border-radius:12px; margin:1rem 0; box-shadow:0 4px 12px rgba(0,0,0,0.1);" />`;
  }

  // ---------------- PDF ----------------
  if (lowerUrl.endsWith('.pdf')) {
    return `<embed src="${trimmedUrl}" type="application/pdf" width="100%" height="600px" style="border-radius:12px; margin:1rem 0;" />`;
  }

  // ---------------- Por defecto: enlace ----------------
  return `<div style="margin:1rem 0; padding:1rem; background:#f5f2eb; border-left:4px solid #d4ac0d; border-radius:8px;">
    <p>🔗 <strong>Recurso externo:</strong> <a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" style="color:#1a5276; text-decoration:underline;">${trimmedUrl}</a></p>
  </div>`;
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

  if (!recurso) {
    notFound();
  }

  const libro = recurso.chapters?.books;
  const capitulo = recurso.chapters;
  const titulo = recurso.titulo || 'Sin título';
  const tipo = recurso.tipo || 'estudio';

  let portadaUrl = null;
  let contenidoSinPortada = recurso.contenido_html || '';

  // Extraer portada si es markdown
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

  // Determinar qué mostrar
  let esAudio = false;
  let esVideo = false;
  let audioUrl = '';
  let videoUrl = '';
  let contenidoMostrar = contenidoSinPortada;

  if (tipo === 'audio' && recurso.recurso_url) {
    esAudio = true;
    audioUrl = recurso.recurso_url;
  } else if (tipo === 'video' && recurso.recurso_url) {
    esVideo = true;
    videoUrl = recurso.recurso_url;
  } else if ((!contenidoMostrar || contenidoMostrar.trim() === '') && recurso.recurso_url) {
    // Para otros tipos sin contenido HTML, generar fallback
    contenidoMostrar = generarHtmlDesdeUrl(recurso.recurso_url, tipo, titulo);
  }

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="w-full px-0 sm:max-w-[922px] sm:px-0 sm:mx-auto">
        <div className="bg-[#fdfbf7] p-2 sm:p-5 border border-[#d4c4a8]">
          
          {/* Breadcrumb */}
          <Breadcrumb items={[
            { name: 'Inicio', href: '/' },
            { name: 'Recursos Bíblicos', href: '/recursos-biblicos' },
            ...(libro ? [{ name: libro.nombre, href: `/libro/${libro.slug}` }] : []),
            ...(capitulo ? [{ name: `Capítulo ${capitulo.numero}`, href: `/libro/${libro.slug}/capitulo/${capitulo.numero}` }] : []),
            { name: titulo, href: null }
          ]} />

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            {capitulo && libro && (
              <Link
                href={`/libro/${libro.slug}/capitulo/${capitulo.numero}`}
                className="no-print inline-flex items-center gap-1.5 bg-white/85 border border-[#ccc] text-[#1a5276] px-4 py-2 rounded-md text-sm transition-all hover:border-[#d4ac0d] hover:text-[#d4ac0d]"
              >
                ← Volver a recursos del capítulo
              </Link>
            )}
            
            <div className="no-print">
              <PrintButton />
            </div>
          </div>

          {/* Área de impresión */}
          <div id="area-impresion" className="bg-white p-3 sm:p-8 rounded-xl shadow-md border border-[#d4c4a8] w-full">
            {portadaUrl && (
              <div className="imagen-portada mb-6">
                <img alt={titulo} src={portadaUrl} className="w-full rounded-lg" />
              </div>
            )}

            {/* Renderizado condicional según tipo */}
            {esAudio ? (
              <AudioPlayer
                url={audioUrl}
                titulo={titulo}
                libroNombre={libro?.nombre || 'Libro'}
                capituloNumero={capitulo?.numero || ''}
              />
            ) : esVideo ? (
              renderVideoEmbed(videoUrl)
            ) : (
              <ScriptExecutor htmlContent={contenidoMostrar} />
            )}

            {/* Botones de compartir */}
            <div className="no-print mt-6">
              <ShareButtons title={titulo} />  
            </div>

            {/* Pie del estudio */}
            <div className="mt-8 pt-6 border-t border-[#d4ac0d] text-center text-sm text-[#8d6e63] font-['Georgia',serif]">
              <p className="mb-1">Estudio bíblico de Mahanaim — Recursos Bíblicos</p>
              <p className="text-xs text-[#9e9e9e]">
                © {new Date().getFullYear()} Mahanaim &quot;Campamento de Dios&quot;. Todos los derechos reservados.
              </p>
              <p className="text-xs text-[#9e9e9e] mt-1">
                Este material puede ser compartido libremente citando la fuente.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
