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

  useEffect(() => {
    if (!slug || !chapterNum) return;
    (async () => {
      setCargando(true);
      // Obtener el libro
      const { data: libroData, error: libroError } = await supabase
        .from('books')
        .select('id, nombre')
        .eq('slug', slug)
        .single();
      if (libroError || !libroData) {
        setError(`Libro no encontrado: ${slug}`);
        setCargando(false);
        return;
      }
      setLibro(libroData);

      // Obtener los versículos
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

      // Verificar si hay recursos de estudio para este capítulo
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

      setCargando(false);
    })();
  }, [slug, chapterNum]);

  if (cargando) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Cargando...</div>;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-red-600 font-bold">Error: {error}</p>
      <Link href="/lector" className="inline-block mt-4 text-[#d4ac0d] hover:underline">← Volver al lector</Link>
    </div>
  );
  if (!libro) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link href={`/lector/${slug}`} className="text-[#d4ac0d] hover:underline">← {libro.nombre}</Link>
      </div>
      <h1 className="text-3xl font-bold text-[#1a5276] text-center mb-8">{libro.nombre} {chapterNum}</h1>
      <div className="space-y-4 text-[#3e2723] text-lg leading-relaxed">
        {versos.map(v => (
          <div key={v.verse}>
            <span className="font-bold text-[#d4ac0d] mr-2">{v.verse}.</span>
            <span>{v.text}</span>
          </div>
        ))}
      </div>
      {hasStudy && (
        <div className="mt-12 text-center">
          <Link
            href={`/libro/${slug}/capitulo/${chapterNum}`}
            className="inline-block bg-[#d4ac0d] text-[#1a3a5c] font-bold px-6 py-3 rounded-lg hover:bg-[#e0b820] transition"
          >
            📖 Ver estudios de este capítulo
          </Link>
        </div>
      )}
      <div className="flex justify-between mt-8 pt-8 border-t border-[#d4c4a8]">
        <Link href={`/lector/${slug}`} className="text-[#1a5276] hover:underline">← Ver todos los capítulos</Link>
      </div>
    </div>
  );
}