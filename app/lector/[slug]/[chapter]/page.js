'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LectorCapituloPage() {
  const params = useParams();
  const { slug, chapter } = params || {};
  const chapterNum = parseInt(chapter);

  const [libro, setLibro] = useState(null);
  const [versos, setVersos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [hasStudy, setHasStudy] = useState(false);
  const [capitulos, setCapitulos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [timelineEvent, setTimelineEvent] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (!slug || !chapterNum) return;
    (async () => {
      setCargando(true);

      const cleanSlug = slug.trim().toLowerCase();

      // 1. Obtener el libro
      const { data: libroData, error: libroError } = await supabase
        .from('books')
        .select('id, nombre, testamento')
        .eq('slug', cleanSlug)
        .single();
      if (libroError || !libroData) {
        setError(`Libro no encontrado: ${cleanSlug}`);
        setCargando(false);
        return;
      }
      setLibro(libroData);

      // 2. Lista de capítulos
      const { data: capitulosData, error: capitulosError } = await supabase
        .from('chapters')
        .select('numero')
        .eq('book_id', libroData.id)
        .order('numero', { ascending: true });
      if (capitulosError) {
        console.error(capitulosError);
      } else if (capitulosData && capitulosData.length > 0) {
        const nums = capitulosData.map(c => c.numero);
        setCapitulos(nums);
        setCurrentIndex(nums.indexOf(chapterNum));
      } else {
        const fallbackNums = Array.from({ length: 150 }, (_, i) => i + 1);
        setCapitulos(fallbackNums);
        setCurrentIndex(chapterNum - 1);
      }

      // 3. Versículos
      const { data: versosData, error: versosError } = await supabase
        .from('verses')
        .select('verse, text')
        .eq('book_id', libroData.id)
        .eq('chapter', chapterNum)
        .order('verse', { ascending: true });
      if (versosError) {
        setError(versosError.message);
      } else if (!versosData || versosData.length === 0) {
        setError('No hay versículos para este capítulo');
      } else {
        setVersos(versosData);
      }

      // 4. Recursos de estudio
      const { data: chapterData } = await supabase
        .from('chapters')
        .select('id')
        .eq('book_id', libroData.id)
        .eq('numero', chapterNum)
        .single();
      if (chapterData) {
        const { data: resources } = await supabase
          .from('resources')
          .select('id')
          .eq('chapter_id', chapterData.id)
          .limit(1);
        setHasStudy(resources && resources.length > 0);
      }

      // ============================================================
      // 5. BÚSQUEDA DEL EVENTO EN LA LÍNEA DE TIEMPO
      // ============================================================

      // FIX: usar .eq() en lugar de .ilike() para que matchee correctamente
      const { data: eventosDelLibro } = await supabase
        .from('timeline_events')
        .select('id, title, start_year, category, image_url, related_chapter')
        .eq('related_book_slug', cleanSlug)
        .order('related_chapter', { ascending: true, nullsLast: true });

      let encontrado = null;

      if (eventosDelLibro && eventosDelLibro.length > 0) {
        // Buscar capítulo exacto
        const exacto = eventosDelLibro.find(e => e.related_chapter === chapterNum);
        if (exacto) {
          encontrado = exacto;
        } else {
          // Buscar el más cercano anterior
          const anteriores = eventosDelLibro
            .filter(e => e.related_chapter !== null && e.related_chapter < chapterNum)
            .sort((a, b) => b.related_chapter - a.related_chapter);

          if (anteriores.length > 0) {
            encontrado = { ...anteriores[0], esCercano: true };
          } else {
            // Usar el primer evento del libro como referencia
            encontrado = { ...eventosDelLibro[0], esCercano: true };
          }
        }
      } else {
        // Fallback por testamento
        // FIX: convertir el testamento del libro a 'AT' o 'NT' para que coincida con la BD
        const testamentoCorto = libroData.testamento?.toLowerCase().includes('antiguo') ? 'AT' : 'NT';

        const { data: eventoTestamento } = await supabase
          .from('timeline_events')
          .select('id, title, start_year, category, image_url')
          .eq('testament', testamentoCorto)
          .order('start_year', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (eventoTestamento) {
          encontrado = { ...eventoTestamento, esCercano: true, esTestamento: true };
        } else {
          encontrado = { id: 0, title: 'Línea de tiempo general', esFallback: true };
        }
      }

      setTimelineEvent(encontrado);
      setDebugInfo({
        slug: cleanSlug,
        chapterNum,
        totalEventosLibro: eventosDelLibro?.length || 0,
        encontrado,
      });

      setCargando(false);
    })();
  }, [slug, chapterNum]);

  const handleChapterChange = (e) => {
    window.location.href = `/lector/${slug}/${parseInt(e.target.value)}`;
  };

  if (cargando) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Cargando...</div>;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-red-600 font-bold">Error: {error}</p>
      <Link href="/lector" className="inline-block mt-4 text-[#d4ac0d] hover:underline">← Volver al lector</Link>
    </div>
  );
  if (!libro) return null;

  const prevChapter = currentIndex > 0 ? capitulos[currentIndex - 1] : null;
  const nextChapter = currentIndex < capitulos.length - 1 ? capitulos[currentIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Navegación superior */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <Link href={`/lector/${slug}`} className="text-[#d4ac0d] hover:underline">
          ← {libro.nombre}
        </Link>
        <div className="flex gap-2 items-center">
          {prevChapter && (
            <Link href={`/lector/${slug}/${prevChapter}`} className="bg-[#1a3a5c] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6c] transition text-sm">
              ← Cap. {prevChapter}
            </Link>
          )}
          <select value={chapterNum} onChange={handleChapterChange} className="border border-[#d4c4a8] rounded-lg p-2 text-sm bg-white text-[#1a5276] font-bold">
            {capitulos.map(num => (
              <option key={num} value={num}>Capítulo {num}</option>
            ))}
          </select>
          {nextChapter && (
            <Link href={`/lector/${slug}/${nextChapter}`} className="bg-[#1a3a5c] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6c] transition text-sm">
              Cap. {nextChapter} →
            </Link>
          )}
        </div>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-[#1a5276] text-center mb-8">
        {libro.nombre} {chapterNum}
      </h1>

      {/* Versículos */}
      <div className="space-y-4 text-[#3e2723] text-lg leading-relaxed">
        {versos.map(v => (
          <div key={v.verse}>
            <span className="font-bold text-[#d4ac0d] mr-2">{v.verse}.</span>
            <span>{v.text}</span>
          </div>
        ))}
      </div>

      {/* Botón línea de tiempo */}
      <div className="mt-8 text-center">
        {timelineEvent ? (
          <>
            
              href={timelineEvent.id > 0 ? `/linea-tiempo?evento=${timelineEvent.id}` : '/linea-tiempo'}
              className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] font-bold px-6 py-3 rounded-lg hover:bg-[#2d4a6c] transition"
            >
              {timelineEvent.esFallback
                ? '📜 Ver toda la línea de tiempo'
                : timelineEvent.esTestamento
                  ? `📜 Ver en línea de tiempo`
                  : timelineEvent.esCercano
                    ? `⏳ Ir al evento más cercano: ${timelineEvent.title}`
                    : `📖 Ver en línea de tiempo: ${timelineEvent.title}`}
            </a>
            {timelineEvent.esCercano && !timelineEvent.esTestamento && !timelineEvent.esFallback && (
              <p className="text-xs text-[#8d6e63] mt-2">
                No hay evento exacto para este capítulo. Mostrando el más cercano anterior.
              </p>
            )}
            {timelineEvent.esTestamento && (
              <p className="text-xs text-[#8d6e63] mt-2">
                No hay eventos para este libro. Mostrando referencia del {testamentoCorto === 'AT' ? 'Antiguo' : 'Nuevo'} Testamento.
              </p>
            )}
          </>
        ) : (
          <a href="/linea-tiempo" className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] font-bold px-6 py-3 rounded-lg hover:bg-[#2d4a6c] transition">
            📜 Ver línea de tiempo completa
          </a>
        )}
      </div>

      {/* Botón estudios */}
      {hasStudy && (
        <div className="mt-12 text-center">
          <Link href={`/libro/${slug}/capitulo/${chapterNum}`} className="inline-block bg-[#d4ac0d] text-[#1a3a5c] font-bold px-6 py-3 rounded-lg hover:bg-[#e0b820] transition">
            📖 Ver estudios de este capítulo
          </Link>
        </div>
      )}

      {/* Navegación inferior */}
      <div className="flex justify-between mt-8 pt-8 border-t border-[#d4c4a8]">
        {prevChapter && (
          <Link href={`/lector/${slug}/${prevChapter}`} className="text-[#1a5276] hover:underline">← Capítulo {prevChapter}</Link>
        )}
        <Link href={`/lector/${slug}`} className="text-[#d4ac0d] hover:underline">Ver todos los capítulos</Link>
        {nextChapter && (
          <Link href={`/lector/${slug}/${nextChapter}`} className="text-[#1a5276] hover:underline">Capítulo {nextChapter} →</Link>
        )}
      </div>

      {/* Debug (eliminá este bloque cuando todo funcione) */}
      <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono text-left overflow-auto">
        <details>
          <summary className="cursor-pointer font-bold text-[#1a5276]">🐞 Debug: timelineEvent</summary>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>

    </div>
  );
}
