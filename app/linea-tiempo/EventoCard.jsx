'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import DOMPurify from 'dompurify';

const CATEGORY_EMOJI = {
  'Patriarcas': '👴',
  'Diluvio': '🌊',
  'Postdiluvio': '🌈',
  'Exodo': '🏜️',
  'Conquista': '⚔️',
  'Jueces': '🗡️',
  'Reyes': '👑',
  'Profetas': '📜',
  'Exilio': '🏛️',
  'Postexilio': '🔨',
  'Intertestamentario': '⏳',
  'Vida de Jesus': '✝️',
  'Nuevo Testamento': '📖',
  'Historico': '📅',
  'Prueba': '🔍',
  'Otros': '📌',
};

function formatYear(year) {
  if (!year) return '';
  if (year < 0) return Math.abs(year) + ' a.C.';
  return year + ' d.C.';
}

function sanitizeHTML(html) {
  if (!html) return '';
  try {
    const clean = DOMPurify.sanitize(html, { 
      ADD_ATTR: ['target', 'rel'],
      ADD_TAGS: ['style']
    });
    return clean || html;
  } catch (e) {
    console.error('Error sanitizando HTML:', e);
    return html;
  }
}

function CollapsibleContent({ html }) {
  const containerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useLayoutEffect(() => {
    if (!isClient || !containerRef.current) return;
    const headers = containerRef.current.querySelectorAll('.ficha-header');

    const handleClick = (e) => {
  const header = e.currentTarget;
  console.log('CLICK EN HEADER:', header.querySelector('.ficha-label')?.textContent);

  const body = header.nextElementSibling;
  const chevron = header.querySelector('.ficha-chev');

  console.log('body es null?', body === null);
  console.log('chevron es null?', chevron === null);
  console.log('body tagName:', body?.tagName, 'body className:', body?.className);

  if (body && chevron) {
    console.log('ENTRO AL IF');
    const isOpen = chevron.classList.contains('open');
    console.log('isOpen antes del cambio:', isOpen);
    if (isOpen) {
      body.style.display = 'none';
      chevron.classList.remove('open');
    } else {
      body.style.display = 'block';
      chevron.classList.add('open');
    }
    console.log('display DESPUES de asignar:', body.style.display);
    console.log('mismo objeto?', body === header.nextElementSibling);
  } else {
    console.log('NO ENTRO AL IF');
  }
};

    headers.forEach(header => header.addEventListener('click', handleClick));
    return () => headers.forEach(header => header.removeEventListener('click', handleClick));
  }, [isClient, html]);

  if (!isClient) return <div className="text-stone-400">Cargando contenido...</div>;

  return (
  <div ref={containerRef} className="evento-card-ficha">
    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />
  </div>
);
}

export function EventoCard({ evento }) {
  const [expandido, setExpandido] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const emoji = CATEGORY_EMOJI[evento.category] || '📖';
  const fechaInicio = formatYear(evento.start_year);
  const fechaFin = evento.end_year ? formatYear(evento.end_year) : null;
  const fechaDisplay = fechaFin ? `${fechaInicio} - ${fechaFin}` : fechaInicio;
  const tieneImagen = evento.image_url && !imgError;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {tieneImagen ? (
        <div className="relative w-full aspect-video">
          <img
            src={evento.image_url}
            alt={evento.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            {emoji} {evento.category}
          </span>
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-amber-50 to-stone-100 flex flex-col items-center justify-center gap-2">
          <span className="text-5xl">{emoji}</span>
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
            {evento.category}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
            {fechaDisplay}
          </span>
          {evento.testament && (
            <span className="text-xs text-stone-400 font-medium">
              {evento.testament === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
            </span>
          )}
        </div>

        <h3 className="font-bold text-stone-800 text-base leading-snug">
          {evento.title}
        </h3>

        {evento.bible_references && (
          <p className="mt-1 text-xs italic text-stone-400">
            {evento.bible_references}
          </p>
        )}

        {expandido && (
          <div className="mt-3 text-sm text-stone-600 leading-relaxed">
            {evento.description && isClient && <CollapsibleContent html={evento.description} />}
            {!isClient && <div>Cargando detalles...</div>}

            {evento.related_book_slug && evento.related_chapter && (
              <a href={`/lector/${evento.related_book_slug}/${evento.related_chapter}`}
                 className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-600 hover:underline">
                📖 Leer {evento.related_book_slug} capítulo {evento.related_chapter} <span>→</span>
              </a>
            )}

            {evento.related_book_slug && !evento.related_chapter && (
              <a href={`/libro/${evento.related_book_slug}`}
                 className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-600 hover:underline">
                📖 Ver recursos de {evento.related_book_slug} <span>→</span>
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => setExpandido(!expandido)}
          className="mt-3 text-xs text-stone-400 font-medium flex items-center gap-1"
          aria-expanded={expandido}
        >
          {expandido ? '▲ Cerrar' : '▼ Ver contexto histórico'}
        </button>
      </div>
    </div>
  );
}