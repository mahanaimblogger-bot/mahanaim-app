import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../estudios.css';
import ScriptExecutor from './ScriptExecutor';
import AudioPlayer from '@/app/componentes/AudioPlayer';

// ============================================================
// Función para generar HTML automático a partir de una URL según el tipo
// ============================================================
function generarHtmlDesdeUrl(url, tipo, titulo) {
  if (!url || url.trim() === '') return '';

  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  // ---------------- Audio (mp3, wav, ogg, etc.) ----------------
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

  // ---------------- YouTube ----------------
  if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) {
    let videoId = '';
    if (lowerUrl.includes('youtu.be/')) {
      videoId = trimmedUrl.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else {
      const urlParams = new URLSearchParams(trimmedUrl.split('?')[1]);
      videoId = urlParams.get('v');
    }
    if (videoId) {
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:12px;"></iframe></div>`;
    }
  }

  // ---------------- Vimeo ----------------
  if (lowerUrl.includes('vimeo.com/')) {
    const vimeoId = trimmedUrl.split('vimeo.com/')[1]?.split(/[?#]/)[0];
    if (vimeoId) {
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;"><iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:12px;"></iframe></div>`;
    }
  }

  // ---------------- PDF ----------------
  if (lowerUrl.endsWith('.pdf')) {
    return `<embed src="${trimmedUrl}" type="application/pdf" width="100%" height="600px" style="border-radius:12px; margin:1rem 0;" />`;
  }

  // ---------------- Google Maps ----------------
  if (lowerUrl.includes('google.com/maps') || lowerUrl.includes('maps.google.com')) {
    if (lowerUrl.includes('/embed')) {
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;">
        <iframe src="${trimmedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:12px;" allowfullscreen></iframe>
      </div>`;
    }
    // Intentar extraer coordenadas del formato @lat,lng,zoom
    const coordsMatch = trimmedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)z/);
    if (coordsMatch) {
      const lat = coordsMatch[1];
      const lng = coordsMatch[2];
      const zoom = coordsMatch[3];
      const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${zoom}0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat},${lng}!5e0!3m2!1ses!2s!4v1`;
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;">
        <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:12px;" allowfullscreen></iframe>
      </div>`;
    }
    return `<div style="margin:1rem 0; padding:1rem; background:#f5f2eb; border-left:4px solid #d4ac0d; border-radius:8px;">
      <p>🗺️ <strong>Mapa:</strong> <a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer" style="color:#1a5276; text-decoration:underline;">Ver mapa en Google Maps</a></p>
    </div>`;
  }

  // ---------------- Otros iframes (embebidos) ----------------
  if (lowerUrl.includes('embed') || lowerUrl.includes('iframe')) {
    return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;">
      <iframe src="${trimmedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:12px;" frameborder="0" allowfullscreen></iframe>
    </div>`;
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

  let contenidoMostrar = contenidoSinPortada;
  let esAudio = false;
  let audioUrl = '';

  // Si el recurso es de tipo 'audio' y tiene URL, preparamos el reproductor especial
  if (recurso.tipo === 'audio' && recurso.recurso_url) {
    esAudio = true;
    audioUrl = recurso.recurso_url;
  } else if ((!contenidoMostrar || contenidoMostrar.trim() === '') && recurso.recurso_url) {
    // Para otros tipos, generar HTML de fallback
    contenidoMostrar = generarHtmlDesdeUrl(recurso.recurso_url, recurso.tipo, recurso.titulo);
  }

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8]">
          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link href="/" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Inicio
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <Link href="/recursos-biblicos" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Recursos Bíblicos
            </Link>
            {libro && (
              <>
                <span className="text-[#9e9e9e] mx-2">›</span>
                <Link href={`/libro/${libro.slug}`} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
                  {libro.nombre}
                </Link>
              </>
            )}
            {capitulo && (
              <>
                <span className="text-[#9e9e9e] mx-2">›</span>
                <Link href={`/libro/${libro.slug}/capitulo/${capitulo.numero}`} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
                  Capítulo {capitulo.numero}
                </Link>
              </>
            )}
            <span className="text-[#9e9e9e] mx-2">›</span>
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
            {portadaUrl && (
              <div className="imagen-portada">
                <img alt={titulo} src={portadaUrl} />
              </div>
            )}

            {esAudio ? (
              <AudioPlayer
                url={audioUrl}
                titulo={titulo}
                libroNombre={libro?.nombre || 'Libro'}
                capituloNumero={capitulo?.numero || ''}
              />
            ) : (
              <ScriptExecutor htmlContent={contenidoMostrar} />
            )}

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
      </div>
    </div>
  );
}