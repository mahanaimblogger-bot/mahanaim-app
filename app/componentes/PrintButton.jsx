'use client';

import { useState } from 'react';

// Lista exacta de recursos que tienen información solapada en modo vertical
// (Nombres tal como están en la tabla 'resources' de Supabase)
const RECURSOS_SOLAPADOS = [
  'profecias',
  'paralelos',
  'infografia',
  'conexion_nt',
  'conexion_at' // Agregado por si lo creas en el futuro
];

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

      // 1. DETECCIÓN DE DISPOSITIVO Y ORIENTACIÓN
      const esMovil = window.innerWidth < 768;
      const esVertical = window.innerHeight > window.innerWidth;
      
      // Normalizamos el tipo para comparación segura
      const tipoNormalizado = tipo.toLowerCase().trim();

      // 2. VERIFICAR SI EL RECURSO REQUIERE ADVERTENCIA
      const requiereAdvertencia = RECURSOS_SOLAPADOS.includes(tipoNormalizado);

      // 3. MOSTRAR MENSAJE SOLO SI CUMPLE TODAS LAS CONDICIONES
      if (requiereAdvertencia && esMovil && esVertical) {
        const continuar = window.confirm(
          ' Para que la información de este recurso salga completa en el PDF, ' +
          'por favor rota tu dispositivo a horizontal (apaisado) antes de continuar. ' +
          '¿Deseas continuar de todos modos?'
        );
        
        if (!continuar) {
          setGenerando(false);
          return; // Cancela la impresión
        }
      }

      // 4. APLICAR ESTILOS LIMPIOS Y GENERAR PDF
      areaImpresion.classList.add('pdf-limpio');
      window.print();

      // 5. RESTAURAR EL DISEÑO ORIGINAL
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
            ️ Descargar PDF
          </>
        )}
      </button>
    </div>
  );
}
