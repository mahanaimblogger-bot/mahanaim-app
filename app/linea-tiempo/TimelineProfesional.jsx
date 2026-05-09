// app/linea-tiempo/TimelineProfesional.jsx
'use client';

import { useEffect, useRef } from 'react';
import { DataSet, Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

export default function TimelineProfesional({ events }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !events.length) return;

    // Limpiar instancia anterior
    if (timelineRef.current) {
      timelineRef.current.destroy();
    }

    // Convertir eventos a fechas UTC
    const items = events.map(ev => ({
      id: ev.id,
      content: ev.title,
      start: new Date(Date.UTC(ev.start_year, 0, 1)),
      title: ev.description || '',
    }));

    const dataset = new DataSet(items);

    // Opciones con límites de zoom para evitar escala enorme
    const options = {
      horizontalScroll: true,
      verticalScroll: false,
      zoomable: true,
      zoomKey: 'ctrlKey',
      zoomMin: 100 * 365 * 24 * 60 * 60 * 1000, // mínimo 100 años
      zoomMax: 1000 * 365 * 24 * 60 * 60 * 1000, // máximo 1000 años
      moveable: true,
      showCurrentTime: true,
      start: new Date(Date.UTC(-500, 0, 1)),
      end: new Date(Date.UTC(200, 0, 1)),
      min: new Date(Date.UTC(-4100, 0, 1)),
      max: new Date(Date.UTC(150, 0, 1)),
      timeAxis: { scale: 'year', step: 50 },
      orientation: 'top',
      stack: true,
      showTooltips: true,
      tooltip: { followMouse: true },
      height: '500px',
      width: '100%',
    };

    const timeline = new Timeline(containerRef.current, dataset, options);
    timelineRef.current = timeline;

    // Centrar ventana en el nacimiento de Jesús (año -5 hasta 195 d.C.)
    const jesusStart = new Date(Date.UTC(-5, 0, 1));
    const jesusEnd = new Date(Date.UTC(195, 0, 1));
    timeline.setWindow(jesusStart, jesusEnd, { animation: false });

    // Exponer función global para los botones de salto
    if (typeof window !== 'undefined') {
      window.__timelineJumpToYear = (year) => {
        if (timeline) {
          const startDate = new Date(Date.UTC(year, 0, 1));
          const endDate = new Date(Date.UTC(year + 100, 0, 1));
          timeline.setWindow(startDate, endDate, { animation: true });
        }
      };
    }

    return () => {
      if (timelineRef.current) timelineRef.current.destroy();
    };
  }, [events]);

  return (
    <div className="w-full">
      <div 
        ref={containerRef} 
        style={{ height: '500px', width: '100%', backgroundColor: '#fdfbf7' }}
      />
    </div>
  );
}