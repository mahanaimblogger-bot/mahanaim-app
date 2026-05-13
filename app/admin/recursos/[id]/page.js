'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { marked } from 'marked';

export default function EditarRecursoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Campos del formulario
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('estudio');
  const [publicado, setPublicado] = useState(true);
  const [recursoUrl, setRecursoUrl] = useState('');

  // Libros y capítulos (para poder cambiar la ubicación)
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Modo y contenido específico
  const [modo, setModo] = useState('html');
  const [contenidoHtml, setContenidoHtml] = useState('');
  const [markdownText, setMarkdownText] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarDatos();
      }
    });
  }, [router, id]);

  const cargarDatos = async () => {
    setLoading(true);

    // Cargar lista de libros
    const { data: booksData } = await supabase
      .from('books')
      .select('id, nombre')
      .order('orden', { ascending: true });
    if (booksData) setBooks(booksData);

    // Cargar el recurso
    const { data: recurso, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
    } else if (recurso) {
      setTitulo(recurso.titulo || '');
      setTipo(recurso.tipo || 'estudio');
      setPublicado(recurso.publicado ?? true);
      setRecursoUrl(recurso.recurso_url || '');

      // Si tiene chapter_id, buscamos el capítulo para saber el book_id
      if (recurso.chapter_id) {
        setSelectedChapter(recurso.chapter_id.toString());
        const { data: cap } = await supabase
          .from('chapters')
          .select('book_id')
          .eq('id', recurso.chapter_id)
          .single();
        if (cap) {
          setSelectedBook(cap.book_id.toString());
        }
      }

      const modoGuardado = recurso.modo || 'html';
      setModo(modoGuardado);

      if (modoGuardado === 'markdown') {
        const html = recurso.contenido_html || '';
        // Extraer URL de portada si existe
        const match = html.match(/<div class="imagen-portada"><img alt=".*?" src="(.*?)" \/><\/div>/);
        if (match) {
          setPortadaUrl(match[1]);
          const htmlSinPortada = html.replace(/<div class="imagen-portada">.*?<\/div>\n?/, '');
          setMarkdownText(htmlSinPortada);
        } else {
          setPortadaUrl('');
          setMarkdownText(html);
        }
      } else {
        setContenidoHtml(recurso.contenido_html || '');
      }
    }
    setLoading(false);
  };

  // Cargar capítulos cuando cambia el libro seleccionado
  useEffect(() => {
    if (!selectedBook) {
      setChapters([]);
      return;
    }
    const cargarCapitulos = async () => {
      const { data } = await supabase
        .from('chapters')
        .select('id, numero')
        .eq('book_id', selectedBook)
        .order('numero', { ascending: true });
      setChapters(data || []);
    };
    cargarCapitulos();
  }, [selectedBook]);

  const generarHtmlFinal = () => {
    if (modo === 'html') return contenidoHtml;
    let html = '';
    if (portadaUrl.trim()) {
      html += `<div class="imagen-portada"><img alt="${titulo}" src="${portadaUrl.trim()}" /></div>\n`;
    }
    html += marked.parse(markdownText);
    return html;
  };

  // Función para generar HTML automático a partir de la URL, según el tipo
function generarHtmlDesdeUrl(url, tipo, titulo) {
  if (!url || url.trim() === '') return '';

  url = url.trim();
  const lowerUrl = url.toLowerCase();

  // Imagen
  if (tipo === 'imagen' || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)) {
    return `<img src="${url}" alt="${titulo}" style="max-width:100%; border-radius:12px; margin:1rem 0; box-shadow:0 4px 12px rgba(0,0,0,0.1);" />`;
  }

  // YouTube
  if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) {
    let videoId = '';
    if (lowerUrl.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    if (videoId) {
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:12px;"></iframe></div>`;
    }
  }

  // Vimeo
  if (lowerUrl.includes('vimeo.com/')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split(/[?#]/)[0];
    if (vimeoId) {
      return `<div style="position:relative; padding-bottom:56.25%; height:0; margin:1rem 0;"><iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:12px;"></iframe></div>`;
    }
  }

  // PDF
  if (lowerUrl.endsWith('.pdf')) {
    return `<embed src="${url}" type="application/pdf" width="100%" height="600px" style="border-radius:12px; margin:1rem 0;" />`;
  }

  // Mapa de Google Maps (compartir > incrustar un mapa)
  if (lowerUrl.includes('google.com/maps') && lowerUrl.includes('embed')) {
    return `<iframe src="${url}" width="100%" height="450" style="border:0; border-radius:12px; margin:1rem 0;" allowfullscreen></iframe>`;
  }

  // Otro iframe (si la URL parece ser de un embed)
  if (lowerUrl.includes('iframe') || lowerUrl.includes('embed')) {
    return `<iframe src="${url}" width="100%" height="500" style="border-radius:12px; margin:1rem 0;" frameborder="0"></iframe>`;
  }

  // Por defecto: enlace clicable
  return `<div style="margin:1rem 0; padding:1rem; background:#f5f2eb; border-left:4px solid #d4ac0d; border-radius:8px;">
    <p>🔗 <strong>Recurso externo:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a5276; text-decoration:underline;">${url}</a></p>
  </div>`;
}

  const handleSave = async (e) => {
  e.preventDefault();
  if (!titulo.trim() || !selectedChapter) {
    alert('Completa al menos título y capítulo.');
    return;
  }

  let contenidoFinal = generarHtmlFinal();

  // Si el contenido HTML está vacío pero hay URL, generar automáticamente
  if ((!contenidoFinal || contenidoFinal.trim() === '') && recursoUrl.trim()) {
    contenidoFinal = generarHtmlDesdeUrl(recursoUrl, tipo, titulo);
  }

  setSaving(true);
  const { error } = await supabase
    .from('resources')
    .update({
      titulo: titulo.trim(),
      tipo,
      contenido_html: contenidoFinal,
      chapter_id: parseInt(selectedChapter, 10),
      recurso_url: recursoUrl,
      publicado,
      modo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  // ... resto igual
};

  if (!session) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <p className="text-[#8d6e63]">Cargando recurso...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">🎬 Recursos</a>
        </nav>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/admin/recursos" className="text-[#1a5276] hover:text-[#d4ac0d] text-lg">←</a>
            <h2 className="text-2xl font-bold text-[#1a5276]">Editar Recurso</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Libro y Capítulo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Libro *</label>
                <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition">
                  <option value="">Seleccionar libro...</option>
                  {books.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Capítulo *</label>
                <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition">
                  <option value="">Seleccionar capítulo...</option>
                  {chapters.map((c) => <option key={c.id} value={c.id}>Capítulo {c.numero}</option>)}
                </select>
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">Título *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition" />
            </div>

            {/* Tipo y Publicado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition">
                  <option value="estudio">Estudio Bíblico</option>
                  <option value="sermon">Sermón / Prédica</option>
                  <option value="video">Video Resumen</option>
                  <option value="audio">Audio / Podcast</option>
                  <option value="imagen">Imagen / Ilustración</option>
                  <option value="diapositiva">Diapositivas</option>
                  <option value="pdf">PDF / Documento</option>
                  <option value="mapa">Mapa Interactivo</option>
                  <option value="cronologia">Línea de Tiempo</option>
                  <option value="personaje">Ficha de Personaje</option>
                  <option value="glosario">Glosario de Términos</option>
                  <option value="himno">Himno / Alabanza</option>
                  <option value="enlace">Recurso Externo</option>
                  <option value="quiz">Cuestionario</option>
                  <option value="devocional">Devocional</option>
                  <option value="hoja">Hoja de Trabajo</option>
                  <option value="testimonio">Testimonio</option>
                  <option value="exegesis">Comentario Exegético</option>
                  <option value="plan">Plan de Lectura</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)}
                    className="w-4 h-4 text-[#1a5276] border-gray-300 rounded focus:ring-[#d4ac0d]" />
                  <span className="text-sm text-[#3e2723]">Publicado</span>
                </label>
              </div>
            </div>

            {/* URL del recurso */}
            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">URL del recurso (opcional)</label>
              <input type="url" value={recursoUrl} onChange={(e) => setRecursoUrl(e.target.value)} placeholder="https://..."
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition" />
            </div>

            {/* Selector de modo (solo para estudios) */}
            {tipo === 'estudio' && (
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Modo de contenido</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="modo" value="html" checked={modo === 'html'} onChange={(e) => setModo(e.target.value)}
                      className="w-4 h-4 text-[#1a5276] focus:ring-[#d4ac0d]" />
                    <span className="text-sm">HTML directo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="modo" value="markdown" checked={modo === 'markdown'} onChange={(e) => setModo(e.target.value)}
                      className="w-4 h-4 text-[#1a5276] focus:ring-[#d4ac0d]" />
                    <span className="text-sm">Markdown + Plantilla</span>
                  </label>
                </div>
              </div>
            )}

            {/* Contenido según modo */}
            {modo === 'html' ? (
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Contenido HTML</label>
                <textarea value={contenidoHtml} onChange={(e) => setContenidoHtml(e.target.value)} rows={20}
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] font-mono text-sm focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#3e2723] mb-1">URL de la imagen de portada (opcional)</label>
                  <input type="url" value={portadaUrl} onChange={(e) => setPortadaUrl(e.target.value)} placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3e2723] mb-1">Contenido en Markdown</label>
                  <textarea value={markdownText} onChange={(e) => setMarkdownText(e.target.value)} rows={20}
                    className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] font-mono text-sm focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving}
                className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-8 py-2.5 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <a href="/admin/recursos" className="px-8 py-2.5 rounded-lg border border-[#d4c4a8] text-[#5d4037] hover:bg-gray-50 transition">
                Cancelar
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}