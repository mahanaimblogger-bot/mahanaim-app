'use client'

import { useState } from 'react'

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
}

function formatYear(year) {
  if (!year) return ''
  if (year < 0) return Math.abs(year) + ' a.C.'
  return year + ' d.C.'
}

export function EventoCard({ evento }) {
  const [expandido, setExpandido] = useState(false)
  const [imgError, setImgError] = useState(false)

  const emoji = CATEGORY_EMOJI[evento.category] || '📖'
  const fechaInicio = formatYear(evento.start_year)
  const fechaFin = evento.end_year ? formatYear(evento.end_year) : null
  const fechaDisplay = fechaFin ? fechaInicio + ' - ' + fechaFin : fechaInicio
  const tieneImagen = evento.image_url && !imgError

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

        <div className={expandido ? 'mt-3 text-sm text-stone-600 leading-relaxed' : 'mt-3 text-sm text-stone-600 leading-relaxed hidden'}>
  <div dangerouslySetInnerHTML={{ __html: evento.description }} />

        {evento.related_book_slug && (
            <p className="mt-3 text-xs font-semibold text-amber-600">
              Ver en {evento.related_book_slug}
            </p>
          )}
        </div>

        <button
          onClick={() => setExpandido(!expandido)}
          className="mt-3 text-xs text-stone-400 font-medium flex items-center gap-1"
          aria-expanded={expandido}
        >
          {expandido ? '▲ Cerrar' : '▼ Ver contexto historico'}
        </button>

      </div>
    </div>
  )
}