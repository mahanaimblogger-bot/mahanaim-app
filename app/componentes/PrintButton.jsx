'use client';

import { useState } from 'react';

export default function PrintButton({ 
  titulo = 'Estudio', 
  libro = '', 
  capitulo = '',
  tipo = 'estudio'
}) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const generarPDF = async () => {
    setGenerando(true);
    setError('');

    const elemento = document.getElementById('area-impresion');
    
    if (!elemento) {
      setError('No se encontró el contenido para imprimir');
      setGenerando(false);
      return;
    }

    // 1. CORRECCIÓN DEL ESPACIO EN BLANCO SUPERIOR:
    // Forzamos al navegador a ir al inicio de la página antes de capturar
    window.scrollTo(0, 0);
    
    // Pequeña pausa para asegurar que el scroll se aplicó antes de la captura
    await new Promise(resolve => setTimeout(resolve, 100));

    // Detectar flipcards (solo mostrar mensaje si las hay)
    const tieneFlipcards = document.querySelectorAll('.flipcard, .flip-container').length > 0;
    
    if (tieneFlipcards && window.innerWidth < 768) {
      const rotar = window.confirm('📱 Para mejor resultado, rota tu dispositivo a horizontal. ¿Continuar?');
      if (!rotar) {
        setGenerando(false);
        return;
      }
    }

    try {
      // Cargar html2pdf dinámicamente desde CDN
      if (typeof window.html2pdf === 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('No se pudo cargar la librería de PDF'));
          document.head.appendChild(script);
        });
      }

      const nombreArchivo = `Estudio-${libro || 'biblico'}-${capitulo || 'capitulo'}-Mahanaim.pdf`;

      const opciones = {
        margin: [5, 5, 5, 5], // Márgenes mínimos para aprovechar la hoja
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
          // 2. CORRECCIÓN CRÍTICA PARA HTML2CANVAS:
          scrollY: -window.scrollY,
          windowHeight: document.documentElement.offsetHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '.caja-nota', '.caja-arqueologia', '.caja-versiculo',
            '.caja-linguistica', '.caja-contexto', '.timeline-container',
            '.tabla-comparativa', 'table', 'img', 'ul', 'ol', 'p',
            '[style*="border-left"]', '[style*="background:"]',
            '[style*="padding: 1"]', '[style*="padding: 1.5"]',
            '[style*="padding: 2"]', '[class*="caja"]'
          ]
        }
      };

      // Ocultar elementos no imprimibles durante la generación
      const elementosOcultar = document.querySelectorAll('.no-print');
      elementosOcultar.forEach(el => el.style.display = 'none');

      // Generar y descargar el PDF
      await window.html2pdf().set(opciones).from(elemento).save();

      // Restaurar elementos
      elementosOcultar.forEach(el => el.style.display = '');
      
      console.log('✅ PDF generado exitosamente:', nombreArchivo);
      
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      setError(`Error al generar el PDF: ${error.message}. Intenta de nuevo.`);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="no-print">
      <button
        onClick={generarPDF}
        disabled={generando}
        className="inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50 cursor-pointer"
      >
        {generando ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generando PDF...
          </>
        ) : (
          <>
            🖨️ Descargar PDF
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
