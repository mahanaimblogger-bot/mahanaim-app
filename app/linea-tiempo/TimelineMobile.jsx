'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { EventoCard } from './EventoCard'

const CATEGORIAS = [
  'Todos',
  'Patriarcas', 'Diluvio', 'Postdiluvio', 'Éxodo',
  'Conquista', 'Jueces', 'Reyes', 'Profetas',
  'Exilio', 'Postexilio', 'Intertestamentario',
  'Vida de Jesús', 'Nuevo Testamento', 'Histórico', 'Otros'
]

const TESTAMENTOS = ['Todos', 'AT', 'NT']

export default function TimelineMobile({ events, initialEventId = null }) {
  const [categoria, setCategoria] = useState('Todos')
  const [testamento, setTestamento] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(null)
  const cardRefs = useRef({})

  const eventosFiltrados = useMemo(() => {
    return events.filter(ev => {
      const okCategoria = categoria === 'Todos' || ev.category === categoria
      const okTestamento = testamento === 'Todos' || ev.testament === testamento
      const okBusqueda = busqueda === '' ||
        ev.title?.toLowerCase().includes(busqueda.toLowerCase()) ||
        ev.description?.toLowerCase().includes(busqueda.toLowerCase())
      return okCategoria && okTestamento && okBusqueda
    })
  }, [events, categoria, testamento, busqueda])

  // Seleccionar automáticamente el evento cuando viene desde URL
  useEffect(() => {
    if (initialEventId && eventosFiltrados.length > 0) {
      const eventExists = eventosFiltrados.find(ev => ev.id === initialEventId)
      if (eventExists) {
        setSelectedEventId(initialEventId)
        // Hacer scroll al elemento
        setTimeout(() => {
          const element = cardRefs.current[initialEventId]
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Resaltar visualmente (opcional)
            element.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2')
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2')
            }, 2000)
          }
        }, 100)
      }
    }
  }, [initialEventId, eventosFiltrados])

  // Limpiar selección cuando cambian filtros
  useEffect(() => {
    if (selectedEventId) {
      // Verificar si el evento seleccionado sigue en los filtrados
      const stillExists = eventosFiltrados.find(ev => ev.id === selectedEventId)
      if (!stillExists) {
        setSelectedEventId(null)
      }
    }
  }, [eventosFiltrados, selectedEventId])

  return (
    <div className="flex flex-col gap-4 px-4 pb-8">

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar evento bíblico..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 
                     px-4 py-2.5 text-sm text-stone-800 
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xl"
          >×</button>
        )}
      </div>

      {/* Filtro Testamento */}
      <div className="flex gap-2">
        {TESTAMENTOS.map(t => (
          <button
            key={t}
            onClick={() => setTestamento(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition
              ${testamento === t
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-500'}`}
          >
            {t === 'AT' ? 'A. Testamento' : t === 'NT' ? 'N. Testamento' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Filtro Categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition
              ${categoria === cat
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-stone-400">
        Mostrando{' '}
        <span className="font-semibold text-stone-600">{eventosFiltrados.length}</span>
        {' '}de {events.length} eventos
      </p>

      {/* Cards o estado vacío */}
      {eventosFiltrados.length > 0 ? (
        <div className="flex flex-col gap-4">
          {eventosFiltrados.map(ev => (
            <div
              key={ev.id}
              ref={el => cardRefs.current[ev.id] = el}
              className={`transition-all duration-300 ${
                selectedEventId === ev.id ? 'scale-[1.02] shadow-lg' : ''
              }`}
            >
              <EventoCard evento={ev} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-stone-400">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-sm font-medium">No hay eventos para esta búsqueda</p>
          <button
            onClick={() => { setCategoria('Todos'); setTestamento('Todos'); setBusqueda('') }}
            className="mt-4 text-xs text-amber-600 font-semibold underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

    </div>
  )
}