'use client';

import { useState } from 'react';

// Lista exacta de recursos que tienen información solapada en modo vertical
// (Nombres tal como están en la tabla 'resources' de Supabase)
const RECURSOS_SOLAPADOS = [
  'profecias',
  'paralelos',
  'infografia',
  'conexion_nt',
  'conexion_at'
];

export default function PrintButton({ 
  titulo = 'Estudio', 
  libro = '', 
  capitulo = '',
  tipo = 'estudio'
}) {
  const [generando, setGenerando] = useState(false);
  const [mostrarModalRotacion, setMostrarModalRotacion] = useState(false);

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
      
      // Normalizamos el tipo a minúsculas y sin espacios para evitar errores de coincidencia
      const tipoNormalizado = tipo.toLowerCase().trim().replace(/\s+/g, '_');

      // 2. VERIFICAR SI EL RECURSO REQUIERE ADVERTENCIA
      const requiereAdvertencia = RECURSOS_SOLAPADOS.includes(tipoNormalizado);

      // 3. MOSTRAR MODAL SOLO SI CUMPLE TODAS LAS CONDICIONES
      if (requiereAdvertencia && esMovil && esVertical) {
        setMostrarModalRotacion(true);
        setGenerando(false); // Pausamos el estado de "generando" hasta que el usuario decida
        return; 
      }

      // 4. SI NO REQUIERE ADVERTENCIA (O YA ESTÁ HORIZONTAL), GENERAMOS DIRECTO
      generarPDFLimpio(areaImpresion);
    }, 300);
  };

  // Función para continuar después de que el usuario vea el modal
  const continuarImpresion = () => {
    setMostrarModalRotacion(false);
    setGenerando(true);
    const areaImpresion = document.getElementById('area-impresion');
    if (areaImpresion) {
      generarPDFLimpio(areaImpresion);
    }
  };

  // Función interna que aplica los estilos y lanza la impresión
  const generarPDFLimpio = (areaImpresion) => {
    areaImpresion.classList.add('pdf-limpio');
    window.print();

    setTimeout(() => {
      areaImpresion.classList.remove('pdf-limpio');
      setGenerando(false);
    }, 500);
  };

  return (
    <>
      {/* BOTÓN PRINCIPAL */}
      <div className="no-print">
        <button
          onClick={manejarImpresion}
          disabled={generando}
          className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50 cursor-pointer shadow-md"
        >
          {generando ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Preparando PDF...
            </>
          ) : (
            <>
              🖨️ Descargar PDF
            </>
          )}
        </button>
      </div>

      {/* MODAL DE ADVERTENCIA DE ROTACIÓN (DISEÑO MAHANAIM) */}
      {mostrarModalRotacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-[#fdfbf7] rounded-xl shadow-2xl max-w-sm w-full border-2 border-[#d4ac0d] overflow-hidden">
            
            {/* Encabezado del Modal */}
            <div className="bg-[#1a3a5c] p-4 text-center border-b-4 border-[#d4ac0d]">
              <h3 className="text-[#d4ac0d] font-serif font-bold text-xl tracking-wide">
                Optimiza tu Vista
              </h3>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 text-center">
              {/* Icono de Teléfono Rotando */}
              <div className="mb-4 flex justify-center">
                <div className="bg-[#f5f2eb] p-4 rounded-full border border-[#d4c4a8]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    <path d="M16 12l4 4-4 4" stroke="#d4ac0d"></path>
                    <path d="M20 16h-4" stroke="#d4ac0d"></path>
                  </svg>
                </div>
              </div>

              {/* Mensaje Claro */}
              <p className="text-[#3e2723] font-serif text-lg leading-relaxed mb-2">
                Este recurso contiene tablas y gráficos detallados.
              </p>
              <p className="text-[#5d4037] text-sm mb-6">
                Para que la información se vea <strong>completa y legible</strong> en el PDF, por favor <strong className="text-[#1a3a5c]">rota tu dispositivo a posición horizontal</strong>.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button 
                  onClick={() => setMostrarModalRotacion(false)}
                  className="w-full py-3 rounded-lg border border-[#d4c4a8] text-[#5d4037] font-semibold hover:bg-[#f5f2eb] transition"
                >
                  Salir para rotar a horizontal
                </button>
                <button 
                  onClick={continuarImpresion}
                  className="w-full py-3 rounded-lg bg-[#1a3a5c] text-[#d4ac0d] font-bold hover:bg-[#2d4a6c] transition shadow-md"
                >
                  Descargar PDF incompleto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
