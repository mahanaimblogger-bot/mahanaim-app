// app/linea-tiempo/TimelineAvanzado.jsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

export default function TimelineAvanzado({ events, baseUrl = 'https://mahanaim.app' }) {
  const [filterEra, setFilterEra] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearRange, setYearRange] = useState({ min: -4100, max: 150 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener categorías únicas
  const categories = useMemo(() => [...new Set(events.map(e => e.category).filter(Boolean))], [events]);

  // Filtrar eventos
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

  // Función para cambiar fondo según evento (usar imagen del evento si existe, sino un fondo por defecto)
  const setBackgroundFromEvent = (event) => {
    if (event && event.image_url) {
      setBackgroundImage(event.image_url);
    } else {
      setBackgroundImage(''); // fondo por defecto (color pergamino)
    }
  };

  // Configurar timeline
  useEffect(() => {
    if (!containerRef.current || filteredEvents.length === 0) {
      if (timelineRef.current) {
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
      return;
    }

    if (timelineRef.current) {
      timelineRef.current.destroy();
      timelineRef.current = null;
    }

    const items = filteredEvents.map(ev => ({
      id: ev.id,
      content: ev.title,
      start: new Date(Date.UTC(ev.start_year, 0, 1)),
      title: ev.description || '',
    }));

    const dataset = new DataSet(items);
    const options = {
      horizontalScroll: true,
      verticalScroll: false,
      zoomable: true,
      zoomKey: 'ctrlKey',
      zoomMin: 100 * 365 * 24 * 60 * 60 * 1000,
      zoomMax: 1000 * 365 * 24 * 60 * 60 * 1000,
      moveable: true,
      showCurrentTime: false,
      start: new Date(Date.UTC(-500, 0, 1)),
      end: new Date(Date.UTC(200, 0, 1)),
      min: new Date(Date.UTC(-4100, 0, 1)),
      max: new Date(Date.UTC(150, 0, 1)),
      timeAxis: { scale: 'year', step: 50 },
      orientation: 'top',
      stack: true,
      showTooltips: true,
      tooltip: { followMouse: true },
      height: isMobile ? '300px' : '450px',
      width: '100%',
      style: 'background-color: transparent;',
    };

    try {
      const timeline = new Timeline(containerRef.current, dataset, options);
      timelineRef.current = timeline;

      // Al hacer clic en un evento
      timeline.on('select', function (properties) {
        if (properties.items.length) {
          const eventId = properties.items[0];
          const event = filteredEvents.find(e => e.id === eventId);
          setSelectedEvent(event);
          setBackgroundFromEvent(event);
        }
      });

      // Al hacer scroll/zoom, detectar el evento más cercano al centro y cambiar fondo
      timeline.on('timechange', (props) => {
        if (!props.start || !props.end) return;
        const centerMs = (props.start.getTime() + props.end.getTime()) / 2;
        let closestEvent = null;
        let minDist = Infinity;
        filteredEvents.forEach(event => {
          const eventTime = new Date(Date.UTC(event.start_year, 0, 1)).getTime();
          const dist = Math.abs(eventTime - centerMs);
          if (dist < minDist) {
            minDist = dist;
            closestEvent = event;
          }
        });
        if (closestEvent) {
          setBackgroundFromEvent(closestEvent);
        }
      });

      // Centrar en Jesús al inicio
      timeline.setWindow(new Date(Date.UTC(-5, 0, 1)), new Date(Date.UTC(100, 0, 1)), { animation: false });

      window.__timelineJumpToYear = (year) => {
        if (timelineRef.current) {
          const startDate = new Date(Date.UTC(year, 0, 1));
          const endDate = new Date(Date.UTC(year + 100, 0, 1));
          timelineRef.current.setWindow(startDate, endDate, { animation: true });
        }
      };
    } catch (err) {
      console.error('Error al crear el timeline:', err);
    }

    return () => {
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
    setYearRange({ min: -4100, max: 150 });
  };

  const jumpToYear = (year) => {
    if (window.__timelineJumpToYear) window.__timelineJumpToYear(year);
    const event = events.find(e => e.start_year === year);
    if (event) {
      setSelectedEvent(event);
      setBackgroundFromEvent(event);
    }
  };

  const quickButtons = [
    { label: '🌍 Creación', year: -4004 },
    { label: '👴 Abraham', year: -2091 },
    { label: '📜 Éxodo', year: -1446 },
    { label: '👑 David', year: -1010 },
    { label: '🏛️ Exilio', year: -586 },
    { label: '✝️ Jesús', year: -5 },
  ];

  // Fondo por defecto (color pergamino o imagen genérica)
  const defaultBackground = 'https://ngvfllkbdnmezikxxyzd.supabase.co/storage/v1/object/public/mahanaim-public/mahanaim_fondo_papiro_opt.jpg';

  return (
    <div className="w-full font-serif text-[#3e2723]">
      {/* Barra de filtros */}
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
              <input type="range" min="-4100" max="150" value={yearRange.min} onChange={(e) => setYearRange({ ...yearRange, min: parseInt(e.target.value) })} className="w-full" />
              <span className="text-sm whitespace-nowrap">{yearRange.min < 0 ? `${Math.abs(yearRange.min)} a.C.` : `${yearRange.min} d.C.`}</span>
            </div>
            <div className="flex gap-4 items-center mt-2">
              <input type="range" min="-4100" max="150" value={yearRange.max} onChange={(e) => setYearRange({ ...yearRange, max: parseInt(e.target.value) })} className="w-full" />
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

      {/* Contenedor del timeline con imagen de fondo dinámica (según evento) */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#fdfbf7' }}>
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
            {selectedEvent ? `Evento destacado: ${selectedEvent.title}` : 'Explora la línea de tiempo'}
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
              {selectedEvent.end_year && ` – ${selectedEvent.end_year < 0 ? `${Math.abs(selectedEvent.end_year)} a.C.` : `${selectedEvent.end_year} d.C.`}`}
            </p>
            <p className="text-[#3e2723] leading-relaxed mb-4">{selectedEvent.description}</p>
            {selectedEvent.bible_references && (
              <p className="text-sm text-[#1a5276]"><strong>Referencias bíblicas:</strong> {selectedEvent.bible_references}</p>
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
          <p className="text-[#8d6e63]">Haz clic en un evento de la línea de tiempo para ver sus detalles.</p>
        )}
      </div>

      {/* En móvil, lista adicional */}
      {isMobile && filteredEvents.length > 0 && (
        <div className="mt-6 p-4 border-t border-[#d4c4a8]">
          <h3 className="text-xl font-bold text-[#1a5276] mb-3">Eventos filtrados</h3>
          <div className="space-y-2">
            {filteredEvents.map(ev => (
              <button key={ev.id} onClick={() => {
                setSelectedEvent(ev);
                setBackgroundFromEvent(ev);
                // También mover el timeline al evento (opcional)
                if (window.__timelineJumpToYear) window.__timelineJumpToYear(ev.start_year);
              }} className="w-full text-left p-3 bg-white border border-[#d4c4a8] rounded-lg hover:bg-[#fef9e6] transition">
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