// app/linea-tiempo/TimelineAvanzado.jsx - VERSIÓN CORREGIDA (sin errores de sintaxis)
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const toTimelineDate = (year) => {
  const d = new Date(0);
  d.setUTCFullYear(year, 0, 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
export default function TimelineAvanzado({ events, baseUrl = 'https://mahanaim.app' }) {
  const [filterEra, setFilterEra] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearRange, setYearRange] = useState({ min: -4100, max: 200 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const lastEventIdRef = useRef(null);

const parseBibleReferences = (references) => {
  if (!references) return null;
  const refs = references.split(/[;,]/).map(r => r.trim());
  return refs.map((ref, idx) => {
    // Expresión regular que captura: (opcional: número y espacio) + nombre del libro + capítulo:versículo
    const match = ref.match(/^(\d*\s*[a-zA-Záéíóúñ]+(?:\s+[a-zA-Záéíóúñ]+)*)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    if (!match) {
      console.warn('Referencia no parseada:', ref);
      return <span key={idx}>{ref}</span>;
    }
    let [, bookName, chapter, verseStart, verseEnd] = match;
    bookName = bookName.trim().toLowerCase();

    // Mapeo exacto según tu tabla de libros
    const bookSlugMap = {
      'génesis': 'genesis',
      'éxodo': 'exodo',
      'levítico': 'levitico',
      'números': 'numeros',
      'deuteronomio': 'deuteronomio',
      'josué': 'josue',
      'jueces': 'jueces',
      'rut': 'rut',
      '1 samuel': '1-samuel',
      '2 samuel': '2-samuel',
      '1 reyes': '1-reyes',
      '2 reyes': '2-reyes',
      '1 crónicas': '1-cronicas',
      '2 crónicas': '2-cronicas',
      'esdras': 'esdras',
      'nehemías': 'nehemias',
      'ester': 'ester',
      'job': 'job',
      'salmos': 'salmos',
      'proverbios': 'proverbios',
      'eclesiastés': 'eclesiastes',
      'cantares': 'cantares',
      'isaías': 'isaias',
      'jeremías': 'jeremias',
      'lamentaciones': 'lamentaciones',
      'ezequiel': 'ezequiel',
      'daniel': 'daniel',
      'oseas': 'oseas',
      'joel': 'joel',
      'amos': 'amos',
      'abdías': 'abdias',
      'jonás': 'jonas',
      'miqueas': 'miqueas',
      'nahúm': 'nahum',
      'habacuc': 'habacuc',
      'sofonías': 'sofonias',
      'hageo': 'hageo',
      'zacarías': 'zacarias',
      'malaquías': 'malaquias',
      'mateo': 'mateo',
      'marcos': 'marcos',
      'lucas': 'lucas',
      'juan': 'juan',
      'hechos': 'hechos',
      'romanos': 'romanos',
      '1 corintios': '1-corintios',
      '2 corintios': '2-corintios',
      'gálatas': 'galatas',
      'efesios': 'efesios',
      'filipenses': 'filipenses',
      'colosenses': 'colosenses',
      '1 tesalonicenses': '1-tesalonicenses',
      '2 tesalonicenses': '2-tesalonicenses',
      '1 timoteo': '1-timoteo',
      '2 timoteo': '2-timoteo',
      'tito': 'tito',
      'filemón': 'filemon',
      'hebreos': 'hebreos',
      'santiago': 'santiago',
      '1 pedro': '1-pedro',
      '2 pedro': '2-pedro',
      '1 juan': '1-juan',
      '2 juan': '2-juan',
      '3 juan': '3-juan',
      'judas': 'judas',
      'apocalipsis': 'apocalipsis'
    };

    const slug = bookSlugMap[bookName];
    if (!slug) {
      console.warn('Libro no mapeado:', bookName);
      return <span key={idx}>{ref}</span>;
    }

    return (
      <span key={idx}>
        <a
          style={{ cursor: 'pointer', textDecoration: 'underline dotted', color: '#1a5276' }}
          title="Cargando versículo..."
          onMouseEnter={async (e) => {
            const target = e.currentTarget;
            if (!target) return;
            try {
              const params = new URLSearchParams({
                book: slug,
                chapter: chapter,
                verseStart: verseStart,
                verseEnd: verseEnd || verseStart
              });
              const res = await fetch(`/api/bible-verse?${params.toString()}`);
              const data = await res.json();
              if (target) target.title = data.text || 'Versículo no encontrado';
            } catch (err) {
              console.error('Error al cargar versículo:', err);
              if (target) target.title = 'Error al cargar';
            }
          }}
        >
          {ref}
        </a>
      </span>
    );
  });
};

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = useMemo(() => [...new Set(events.map(e => e.category).filter(Boolean))], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterEra === 'ac' && event.start_year >= 0) return false;
      if (filterEra === 'dc' && event.start_year < 0) return false;
      if (filterCategory && event.category !== filterCategory) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return event.title.toLowerCase().includes(term) ||
               (event.description && event.description.toLowerCase().includes(term));
      }
      if (event.start_year < yearRange.min || event.start_year > yearRange.max) return false;
      return true;
    });
  }, [events, filterEra, filterCategory, searchTerm, yearRange]);

  const findClosestEvent = (centerYear) => {
    if (filteredEvents.length === 0) return null;
    let closest = null;
    let minDist = Infinity;
    filteredEvents.forEach(event => {
      const dist = Math.abs(event.start_year - centerYear);
      if (dist < minDist) {
        minDist = dist;
        closest = event;
      }
    });
    return closest;
  };

  const updateBackgroundFromEvent = (event) => {
    if (event && event.image_url) {
      setBackgroundImage(event.image_url);
    } else {
      setBackgroundImage(defaultBackground);
    }
  };

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.destroy();
      timelineRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!containerRef.current || filteredEvents.length === 0) return;

    const items = filteredEvents.map(ev => ({
  id: ev.id,
  content: ev.title,
  start: toTimelineDate(ev.start_year),
  ...(ev.end_year != null && { end: toTimelineDate(ev.end_year) }),
  title: ev.description || '',
}));

    const dataset = new DataSet(items);
   const options = {
  horizontalScroll: true,
  verticalScroll: false,   // <-- desactivado
  zoomable: true,
  zoomKey: 'ctrlKey',
  zoomMin: 100 * 365 * 24 * 60 * 60 * 1000,
  zoomMax: 1000 * 365 * 24 * 60 * 60 * 1000,
  moveable: true,
  showCurrentTime: false,
  start: toTimelineDate(-500),
  end: toTimelineDate(200),
  min: toTimelineDate(-4100),
  max: toTimelineDate(1000),
  timeAxis: { scale: 'year', step: 50 },
  orientation: 'top',
  stack: true,
  showTooltips: true,
  tooltip: { followMouse: true },
  height: isMobile ? '400px' : '550px',   // <-- aumentado
  width: '100%',
};

    try {
      const timeline = new Timeline(containerRef.current, dataset, options);
      timelineRef.current = timeline;

      timeline.on('select', function (properties) {
        if (properties.items.length) {
          const eventId = properties.items[0];
          const event = filteredEvents.find(e => e.id === eventId);
          setSelectedEvent(event);
          updateBackgroundFromEvent(event);
        }
      });

      timeline.on('timechange', () => {
        if (!timelineRef.current) return;
        const windowRange = timelineRef.current.getWindow();
        if (windowRange.start && windowRange.end) {
          const centerMs = (windowRange.start.getTime() + windowRange.end.getTime()) / 2;
          const centerYear = new Date(centerMs).getUTCFullYear();
          const closest = findClosestEvent(centerYear);
          if (closest && closest.id !== lastEventIdRef.current) {
            lastEventIdRef.current = closest.id;
            updateBackgroundFromEvent(closest);
          }
        }
      });

      timeline.setWindow(toTimelineDate(25), toTimelineDate(35), { animation: false });
      const initialWindow = timeline.getWindow();
      if (initialWindow.start && initialWindow.end) {
        const centerMs = (initialWindow.start.getTime() + initialWindow.end.getTime()) / 2;
        const centerYear = new Date(centerMs).getUTCFullYear();
        const closest = findClosestEvent(centerYear);
        if (closest) updateBackgroundFromEvent(closest);
      }

      intervalRef.current = setInterval(() => {
        if (timelineRef.current) {
          const windowRange = timelineRef.current.getWindow();
          if (windowRange.start && windowRange.end) {
            const centerMs = (windowRange.start.getTime() + windowRange.end.getTime()) / 2;
            const centerYear = new Date(centerMs).getUTCFullYear();
            const closest = findClosestEvent(centerYear);
            if (closest && closest.id !== lastEventIdRef.current) {
              lastEventIdRef.current = closest.id;
              updateBackgroundFromEvent(closest);
            }
          }
        }
      }, 100);

      window.__timelineJumpToYear = (year) => {
        if (timelineRef.current) {
          const startDate = toTimelineDate(year);
const endDate = toTimelineDate(year + 100);
          timelineRef.current.setWindow(startDate, endDate, { animation: true });
        }
      };
    } catch (err) {
      console.error('Error al crear el timeline:', err);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timelineRef.current) {
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
    };
  }, [filteredEvents, isMobile]);

  const clearFilters = () => {
    setFilterEra('');
    setFilterCategory('');
    setSearchTerm('');
    setYearRange({ min: -4100, max: 200 });
  };

  const jumpToYear = (year) => {
    if (window.__timelineJumpToYear) window.__timelineJumpToYear(year);
    const event = filteredEvents.find(e => e.start_year === year);
    if (event) setSelectedEvent(event);
  };

  const quickButtons = [
    { label: '🌍 Creación', year: -4004 },
    { label: '👴 Abraham', year: -2091 },
    { label: '📜 Éxodo', year: -1446 },
    { label: '👑 David', year: -1010 },
    { label: '🏛️ Exilio', year: -586 },
    { label: '✝️ Jesús', year: -5 },
  ];

  const defaultBackground = 'https://ngvfllkbdnmezikxxyzd.supabase.co/storage/v1/object/public/mahanaim-public/mahanaim_fondo_papiro_opt.jpg';

  return (
    <div className="w-full font-serif text-[#3e2723]">
      {/* Filtros */}
      <div className="bg-[#fef7e0] border-b border-[#d4ac0d] p-4">
        {isMobile && (
          <button onClick={() => setShowFiltersMobile(!showFiltersMobile)} className="mb-3 w-full bg-[#1a3a5c] text-[#d4ac0d] py-2 rounded-lg font-bold">
            {showFiltersMobile ? 'Ocultar filtros ▲' : 'Mostrar filtros ▼'}
          </button>
        )}
        <div className={`${isMobile && !showFiltersMobile ? 'hidden' : 'block'} space-y-4`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Era</label>
              <select value={filterEra} onChange={(e) => setFilterEra(e.target.value)} className="w-full p-2 border border-[#d4c4a8] rounded bg-white">
                <option value="">Todas</option>
                <option value="ac">Antes de Cristo (a.C.)</option>
                <option value="dc">Después de Cristo (d.C.)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Categoría</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2 border border-[#d4c4a8] rounded bg-white">
                <option value="">Todas</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Buscar</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Título o descripción" className="w-full p-2 border border-[#d4c4a8] rounded bg-white" />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold">Limpiar</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Rango de años</label>
            <div className="flex gap-4 items-center">
              <input type="range" min="-4100" max="200" value={yearRange.min} onChange={(e) => setYearRange({ ...yearRange, min: parseInt(e.target.value) })} className="w-full" />
              <span className="text-sm whitespace-nowrap">{yearRange.min < 0 ? `${Math.abs(yearRange.min)} a.C.` : `${yearRange.min} d.C.`}</span>
            </div>
            <div className="flex gap-4 items-center mt-2">
              <input type="range" min="-4100" max="200" value={yearRange.max} onChange={(e) => setYearRange({ ...yearRange, max: parseInt(e.target.value) })} className="w-full" />
              <span className="text-sm whitespace-nowrap">{yearRange.max < 0 ? `${Math.abs(yearRange.max)} a.C.` : `${yearRange.max} d.C.`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones rápidos */}
      <div className="flex flex-wrap justify-center gap-3 py-4 bg-[#fdfbf7]">
        {quickButtons.map(btn => (
          <button key={btn.label} onClick={() => jumpToYear(btn.year)} className="px-4 py-2 bg-[#1a3a5c] text-[#d4ac0d] rounded-full font-bold hover:bg-[#2d4a6c] transition">
            {btn.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {/* Timeline */}
<div className="relative w-full overflow-auto" style={{ backgroundColor: '#fdfbf7', maxHeight: isMobile ? '600px' : '800px' }}>
  <div
    className="absolute inset-0 pointer-events-none bg-cover bg-center transition-all duration-700"
    style={{
      backgroundImage: `url('${backgroundImage || defaultBackground}')`,
      opacity: 0.25,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }}
  />
  <div className="relative z-10">
    <div className="text-center text-xs text-[#8d6e63] py-1 bg-white/50 backdrop-blur-sm">
      {selectedEvent ? `Evento seleccionado: ${selectedEvent.title}` : 'Desplázate para explorar períodos'}
    </div>
    <div ref={containerRef} />
  </div>
  {filteredEvents.length === 0 && (
    <div className="text-center py-10 text-[#8d6e63] relative z-10">No hay eventos con los filtros seleccionados.</div>
  )}
</div>

      {/* Panel de detalles */}
      <div className="mx-auto max-w-4xl my-6 p-5 bg-white border-l-4 border-[#d4ac0d] shadow-md rounded-r-lg">
        {selectedEvent ? (
          <div>
            <h3 className="text-2xl font-bold text-[#1a5276] mb-2">{selectedEvent.title}</h3>
            <p className="text-[#5d4037] text-sm mb-3">
              <strong>Año:</strong> {selectedEvent.start_year < 0 ? `${Math.abs(selectedEvent.start_year)} a.C.` : `${selectedEvent.start_year} d.C.`}
              {selectedEvent.end_year && (
                <span> – {selectedEvent.end_year < 0 ? `${Math.abs(selectedEvent.end_year)} a.C.` : `${selectedEvent.end_year} d.C.`}</span>
              )}
            </p>
            <div className="text-[#3e2723] leading-relaxed mb-4 description-content" dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
            {selectedEvent.bible_references && (
  <p className="text-sm text-[#1a5276]">
    <strong>Referencias bíblicas:</strong> {parseBibleReferences(selectedEvent.bible_references)}
  </p>
)}
           
            {selectedEvent.related_book_slug && (
              <a href={`${baseUrl}/libro/${selectedEvent.related_book_slug}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition">
                📖 Ver recursos relacionados
              </a>
            )}
            {selectedEvent.image_url && (
              <img src={selectedEvent.image_url} alt={selectedEvent.title} className="mt-4 max-w-full rounded-lg shadow-md" />
            )}
          </div>
        ) : (
          <p className="text-[#8d6e63]">Haz clic en un evento para ver sus detalles.</p>
        )}
      </div>

      {/* Lista móvil */}
      {isMobile && filteredEvents.length > 0 && (
        <div className="mt-6 p-4 border-t border-[#d4c4a8]">
          <h3 className="text-xl font-bold text-[#1a5276] mb-3">Eventos filtrados</h3>
          <div className="space-y-2">
            {filteredEvents.map(ev => (
              <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left p-3 bg-white border border-[#d4c4a8] rounded-lg hover:bg-[#fef9e6] transition">
                <span className="font-bold">{ev.title}</span>
                <span className="text-xs text-[#8d6e63] ml-2">
                  {ev.start_year < 0 ? `${Math.abs(ev.start_year)} a.C.` : `${ev.start_year} d.C.`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}