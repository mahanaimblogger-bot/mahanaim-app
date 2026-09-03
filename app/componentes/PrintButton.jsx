'use client';

import { useState } from 'react';

export default function PrintButton({ 
  titulo = 'Estudio', 
  libro = '', 
  capitulo = '',
  tipo = 'estudio'
}) {
  const [generando, setGenerando] = useState(false);

  const manejarImpresion = () => {
    setGenerando(true);

    setTimeout(() => {
      const areaImpresion = document.getElementById('area-impresion');
      if (!areaImpresion) {
        setGenerando(false);
        return;
      }

      // AGREGAR clase para estilos de impresión limpia (NO modifica el HTML, solo agrega una clase)
      areaImpresion.classList.add('pdf-limpio');

      // Imprimir
      window.print();

      // REMOVER la clase inmediatamente después (el HTML original está intacto)
      setTimeout(() => {
        areaImpresion.classList.remove('pdf-limpio');
        setGenerando(false);
      }, 500);
    }, 300);
  };

  return (
    <div className="no-print">
      <button
        onClick={manejarImpresion}
        disabled={generando}
        className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50 cursor-pointer"
      >
        {generando ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Preparando PDF limpio...
          </>
        ) : (
          <>
            🖨️ Descargar PDF
          </>
        )}
      </button>
    </div>
  );
}
