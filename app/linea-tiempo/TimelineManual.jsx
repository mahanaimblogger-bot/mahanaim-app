'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Configuración visual
const PX_PER_YEAR = 1.8;
const MIN_YEAR = -4100;
const MAX_YEAR = 150;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;
const TIMELINE_WIDTH = TOTAL_YEARS * PX_PER_YEAR;

// Configuración de apilamiento vertical
const CONTAINER_HEIGHT = 280;
const MAJOR_TOP = 20;
const MINOR_BASE_TOP = 70;
const MINOR_STEP = 35;
const MAX_MINOR_TOP = 240;

// Función para identificar eventos principales (épocas o hitos importantes)
function isMajorEvent(event) {
  const majorTitles = [
    "Creación", "Diluvio universal", "Alianza con Abraham",
    "Éxodo de Egipto", "Reino unificado: David", "Exilio en Babilonia",
    "Nacimiento de Jesús"
  ];
  return majorTitles.includes(event.title);
}

export default function TimelineManual({ events }) {
  const rulerRef = useRef(null);
  const eventsRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [centerYear, setCenterYear] = useState(-5);
  const [isSyncing, setIsSyncing] = useState(false);

  const getYearFromScroll = (scrollLeft, containerWidth) => {
    const centerX = scrollLeft + containerWidth / 2;
    const year = MIN_YEAR + centerX / PX_PER_YEAR;
    return Math.round(year);
  };

  const updateCenter = useCallback(() => {
    if (!eventsRef.current) return;
    const scrollLeft = eventsRef.current.scrollLeft;
    const width = eventsRef.current.clientWidth;
    const year = getYearFromScroll(scrollLeft, width);
    setCenterYear(year);

    let closest = null;
    let minDist = Infinity;
    events.forEach(event => {
      const eventX = (event.start_year - MIN_YEAR) * PX_PER_YEAR;
      const centerX = scrollLeft + width / 2;
      const dist = Math.abs(eventX - centerX);
      if (dist < minDist) {
        minDist = dist;
        closest = event;
      }
    });
    setActiveEvent(closest);
  }, [events]);

  const handleEventsScroll = () => {
    if (!eventsRef.current || !rulerRef.current) return;
    if (isSyncing) return;
    setIsSyncing(true);
    rulerRef.current.scrollLeft = eventsRef.current.scrollLeft;
    updateCenter();
    setTimeout(() => setIsSyncing(false), 50);
  };

  const jumpToYear = useCallback((year, selectEvent = false) => {
    if (!eventsRef.current) return;
    const targetX = (year - MIN_YEAR) * PX_PER_YEAR - (eventsRef.current.clientWidth / 2);
    eventsRef.current.scrollLeft = targetX;
    if (selectEvent) {
      const targetEvent = events.find(e => e.start_year === year);
      if (targetEvent) setActiveEvent(targetEvent);
    }
    updateCenter();
  }, [events]);

  useEffect(() => {
    if (eventsRef.current) jumpToYear(-5, true);
    window.__timelineJumpToYear = jumpToYear;
  }, [jumpToYear]);

  // --- Generar marcas de la regla ---
  const rulerMarks = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 10) {
    const x = (year - MIN_YEAR) * PX_PER_YEAR;
    let isCentury = year % 100 === 0 && year % 1000 !== 0;
    let isMillennium = year % 1000 === 0;
    rulerMarks.push(
      <div
        key={year}
        style={{
          position: 'absolute',
          left: `${x}px`,
          bottom: '0px',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: isMillennium ? '13px' : (isCentury ? '11px' : '10px'),
          fontWeight: isCentury ? 'bold' : 'normal',
          color: isMillennium ? '#9b4b1a' : (isCentury ? '#1a5276' : '#3e2723'),
        }}
      >
        {isCentury && (year < 0 ? `${Math.abs(year)} a.C.` : `${year} d.C.`)}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMillennium ? '2px' : '1px',
          height: isMillennium ? '35px' : (isCentury ? '22px' : '12px'),
          backgroundColor: isMillennium ? '#6b3e1a' : (isCentury ? '#8b5a2b' : '#b68b40'),
        }} />
      </div>
    );
  }

  // --- Agrupar eventos por año y separar principales de secundarios ---
  const eventsByYear = new Map();
  events.forEach(event => {
    const year = event.start_year;
    if (!eventsByYear.has(year)) eventsByYear.set(year, { majors: [], minors: [] });
    if (isMajorEvent(event)) {
      eventsByYear.get(year).majors.push(event);
    } else {
      eventsByYear.get(year).minors.push(event);
    }
  });

  const eventItems = [];
  eventsByYear.forEach((group, year) => {
    const baseX = (year - MIN_YEAR) * PX_PER_YEAR;

    // Eventos principales (sin orden especial, normalmente uno por año)
    group.majors.forEach(event => {
      const isActive = activeEvent && activeEvent.id === event.id;
      eventItems.push(
        <div
          key={event.id}
          style={{
            position: 'absolute',
            left: `${baseX}px`,
            top: `${MAJOR_TOP}px`,
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            zIndex: isActive ? 10 : 2,
          }}
          onClick={() => jumpToYear(year, true)}
        >
          <div style={{
            width: isActive ? '28px' : '22px',
            height: isActive ? '28px' : '22px',
            backgroundColor: isActive ? '#e6b800' : '#d4ac0d',
            border: isActive ? '3px solid #1a5276' : '2px solid #1a5276',
            borderRadius: '50%',
            margin: '0 auto',
            boxShadow: isActive ? '0 0 0 3px #f1c40f' : 'none',
          }} />
          <div style={{
            backgroundColor: 'white',
            padding: '4px 8px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '1px solid #d4ac0d',
            whiteSpace: 'nowrap',
            marginTop: '6px',
          }}>
            {event.title}
          </div>
        </div>
      );
    });

    // Eventos secundarios: ordenar por 'order' (campo de la BD) y luego por id
    const sortedMinors = [...group.minors].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });

    sortedMinors.forEach((event, idx) => {
      const topPos = Math.min(MINOR_BASE_TOP + idx * MINOR_STEP, MAX_MINOR_TOP);
      const isActive = activeEvent && activeEvent.id === event.id;
      eventItems.push(
        <div
          key={event.id}
          style={{
            position: 'absolute',
            left: `${baseX}px`,
            top: `${topPos}px`,
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            zIndex: isActive ? 10 : 1,
          }}
          onClick={() => jumpToYear(year, true)}
        >
          <div style={{
            width: isActive ? '18px' : '12px',
            height: isActive ? '18px' : '12px',
            backgroundColor: isActive ? '#e6b800' : '#d4ac0d',
            border: '2px solid #1a5276',
            borderRadius: '50%',
            margin: '0 auto',
            boxShadow: isActive ? '0 0 0 2px #f1c40f' : 'none',
          }} />
          <div style={{
            backgroundColor: 'white',
            padding: '2px 6px',
            borderRadius: '16px',
            fontSize: '11px',
            border: '1px solid #d4ac0d',
            whiteSpace: 'nowrap',
            marginTop: topPos < 70 ? '6px' : 0,
            marginBottom: topPos < 70 ? 0 : '6px',
          }}>
            {event.title}
          </div>
        </div>
      );
    });
  });

  return (
    <div style={{ width: '100%', fontFamily: 'Georgia, Times New Roman, serif' }}>
      {/* Regla superior */}
      <div
        ref={rulerRef}
        style={{
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: '#fef7e0',
          borderBottom: '2px solid #d4ac0d',
          height: '80px',
          width: '100%',
        }}
      >
        <div style={{ position: 'relative', height: '80px', width: `${TIMELINE_WIDTH}px` }}>
          {rulerMarks}
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '2px',
          height: '100%',
          backgroundColor: '#c0392b',
          zIndex: 20,
          pointerEvents: 'none',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 3px rgba(192,57,43,0.5)',
        }}>
          <div style={{ position: 'absolute', top: '-18px', left: '-6px', fontSize: '14px', color: '#c0392b' }}>▲</div>
          <div style={{ position: 'absolute', bottom: '-18px', left: '-6px', fontSize: '14px', color: '#c0392b' }}>▼</div>
        </div>
      </div>

      {/* Contenedor de eventos (scroll horizontal) */}
      <div
        ref={eventsRef}
        onScroll={handleEventsScroll}
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          cursor: 'grab',
          backgroundColor: '#fdfbf7',
          marginTop: '10px',
          height: `${CONTAINER_HEIGHT}px`,
          width: '100%',
        }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) e.currentTarget.style.cursor = 'grabbing'; }}
        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
        onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
      >
        <div style={{ position: 'relative', height: `${CONTAINER_HEIGHT}px`, width: `${TIMELINE_WIDTH}px` }}>
          {eventItems}
        </div>
      </div>

      {/* Panel de información */}
      <div style={{
        marginTop: '20px',
        backgroundColor: '#fef3dd',
        borderLeft: '5px solid #d4ac0d',
        padding: '12px 18px',
        borderRadius: '12px',
      }}>
        {activeEvent ? (
          <>
            <strong>{activeEvent.title}</strong> ({activeEvent.start_year < 0 ? `${Math.abs(activeEvent.start_year)} a.C.` : `${activeEvent.start_year} d.C.`})
            <p>{activeEvent.description}</p>
          </>
        ) : (
          <p>Desplázate o haz clic en un evento para ver detalles.</p>
        )}
        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
          📍 Año central: {centerYear < 0 ? `${Math.abs(centerYear)} a.C.` : `${centerYear} d.C.`}
        </p>
      </div>
    </div>
  );
}