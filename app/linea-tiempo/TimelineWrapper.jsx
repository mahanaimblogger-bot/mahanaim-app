'use client';

import { useState, useEffect } from 'react';
import TimelineAvanzado from './TimelineAvanzado';
import TimelineMobile from './TimelineMobile';

export default function TimelineWrapper({ events }) {
  const [initialEventId, setInitialEventId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Obtener el parámetro 'evento' de la URL
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get('evento');
    if (eventoId) {
      setInitialEventId(parseInt(eventoId));
    }
  }, []);
  
  // Mientras no estamos en cliente, mostrar timeline sin selección
  if (!isClient) {
    return (
      <>
        <div className="hidden md:block">
          <TimelineAvanzado events={events} />
        </div>
        <div className="block md:hidden">
          <TimelineMobile events={events} />
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="hidden md:block">
        <TimelineAvanzado events={events} initialEventId={initialEventId} />
      </div>
      <div className="block md:hidden">
        <TimelineMobile events={events} initialEventId={initialEventId} />
      </div>
    </>
  );
}