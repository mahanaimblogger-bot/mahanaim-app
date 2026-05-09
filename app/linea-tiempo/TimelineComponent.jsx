// app/linea-tiempo/TimelineComponent.jsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const YEAR_SCALE_FACTOR = 0.6;

export default function TimelineComponent({ events }) {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeEvent, setActiveEvent] = useState(null);

  if (!events || events.length === 0) {
    return <div className="text-center p-10">No hay eventos aún.</div>;
  }

  const minYear = Math.min(...events.map(e => e.start_year));
  const maxYear = Math.max(...events.map(e => e.start_year));
  const totalYears = maxYear - minYear;
  const timelineWidth = totalYears * YEAR_SCALE_FACTOR + 800;

  const getXPos = (year) => (year - minYear) * YEAR_SCALE_FACTOR;

  const scrollToX = (x) => {
    if (timelineRef.current) timelineRef.current.scrollLeft = x;
  };

  const jumpTo = (targetYear) => {
    const targetX = getXPos(targetYear) - window.innerWidth / 2;
    scrollToX(targetX);
  };

  const detectActiveEvent = useCallback(() => {
    if (!timelineRef.current) return;
    const viewportCenter = timelineRef.current.scrollLeft + timelineRef.current.offsetWidth / 2;
    let closest = null;
    let minDist = Infinity;
    events.forEach(event => {
      const eventX = getXPos(event.start_year);
      const dist = Math.abs(eventX - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = event;
      }
    });
    setActiveEvent(closest);
  }, [events, getXPos]);

  useEffect(() => {
    const ref = timelineRef.current;
    if (ref) {
      ref.addEventListener('scroll', detectActiveEvent);
      detectActiveEvent();
      return () => ref.removeEventListener('scroll', detectActiveEvent);
    }
  }, [detectActiveEvent]);

  const jumpEras = [
    { label: 'Creación', year: events.find(e => e.title === 'Creación')?.start_year || minYear },
    { label: 'Abraham', year: events.find(e => e.title.includes('Abraham'))?.start_year || -2091 },
    { label: 'Éxodo', year: events.find(e => e.title.includes('Éxodo'))?.start_year || -1446 },
    { label: 'David', year: events.find(e => e.title === 'Reino unificado: David')?.start_year || -1010 },
    { label: 'Exilio', year: events.find(e => e.title.includes('Exilio'))?.stop_year || -586 },
    { label: 'Jesús', year: events.find(e => e.title.includes('Jesús'))?.start_year || -5 },
  ].filter(era => era.year !== undefined);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };
  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    timelineRef.current.scrollLeft = scrollLeft - walk;
    detectActiveEvent();
  };

  return (
    <div className="relative w-full">
      {/* Botones de navegación rápida */}
      <div className="flex flex-wrap justify-center gap-2 py-3 bg-warm-white border-b border-golden">
        {jumpEras.map((era) => (
          <button
            key={era.label}
            onClick={() => jumpTo(era.year)}
            className="px-3 py-1 text-sm font-serif bg-deep-blue text-warm-white rounded-full hover:bg-dark-blue transition-colors shadow-md"
          >
            {era.label}
          </button>
        ))}
      </div>

      {/* Contenedor de la línea (arrastrable) */}
      <div
        ref={timelineRef}
        className="relative w-full h-[400px] md:h-[500px] overflow-x-auto cursor-grab active:cursor-grabbing border-y-2 border-golden bg-warm-white"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onTouchStart={(e) => onMouseDown(e.touches[0])}
        onTouchEnd={onMouseUp}
        onTouchMove={(e) => onMouseMove(e.touches[0])}
      >
        {/* Línea dorada central */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-golden transform -translate-y-1/2"
          style={{ width: timelineWidth }}
        ></div>

        {/* Marcadores de años (cada 100 años) */}
        {Array.from({ length: Math.floor(totalYears / 100) + 1 }).map((_, i) => {
          const year = Math.round(minYear + i * 100);
          if (year > maxYear) return null;
          const x = getXPos(year);
          return (
            <div
              key={year}
              className="absolute text-sm text-deep-blue -translate-x-1/2 font-serif"
              style={{ left: `${x}px`, top: 'calc(50% + 25px)' }}
            >
              {year < 0 ? `${Math.abs(year)} a.C.` : `${year} d.C.`}
            </div>
          );
        })}

        {/* Círculos de eventos */}
        {events.map(event => {
          const x = getXPos(event.start_year);
          const isActive = activeEvent && activeEvent.id === event.id;
          return (
            <div
              key={event.id}
              className={`absolute top-1/2 -translate-x-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                isActive ? 'scale-125 z-10' : ''
              }`}
              style={{ left: `${x}px` }}
              onClick={() => jumpTo(event.start_year)}
            >
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full bg-golden border-2 border-deep-blue ${isActive ? 'w-5 h-5' : ''}`}></div>
                <span className={`mt-2 text-xs md:text-sm font-serif text-deep-blue whitespace-nowrap bg-warm-white px-1 rounded ${isActive ? 'font-bold' : ''}`}>
                  {event.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cuadro de información del evento activo */}
      <div className="mx-auto max-w-3xl my-6 p-5 bg-warm-white border-l-4 border-golden shadow-md rounded-r-lg">
        {activeEvent ? (
          <>
            <h3 className="text-xl md:text-2xl font-serif text-deep-blue mb-2">{activeEvent.title}</h3>
            <p className="text-brown-text text-sm md:text-base mb-2">
              <strong>Año:</strong> {activeEvent.start_year < 0 ? `${Math.abs(activeEvent.start_year)} a.C.` : `${activeEvent.start_year} d.C.`}
            </p>
            <p className="text-brown-text text-base md:text-lg leading-relaxed">{activeEvent.description || 'Descripción no disponible.'}</p>
          </>
        ) : (
          <p className="text-brown-text">Desplázate o haz clic en un evento para ver detalles.</p>
        )}
      </div>
    </div>
  );
}