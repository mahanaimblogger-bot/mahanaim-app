'use client';

import { useState } from 'react';

export default function PrintButton() {
  const [showModal, setShowModal] = useState(false);

  const handlePrint = () => {
    // Verificar si está en móvil (pantalla ≤ 768px)
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Si está en móvil, mostrar advertencia
      setShowModal(true);
    } else {
      // Si está en PC, imprimir directamente
      window.print();
    }
  };

  const confirmPrint = () => {
    setShowModal(false);
    window.print();
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="no-print inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition cursor-pointer shadow-sm font-['Georgia',serif]"
        title="Descargar o imprimir este recurso en PDF"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
        </svg>
        Descargar PDF
      </button>

      {/* Modal de advertencia para móvil */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-[#d4ac0d]">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-[#1a5276] mb-2">
                Modo Vertical Detectado
              </h3>
            </div>

            <div className="bg-[#fdfbf7] border border-[#d4c4a8] rounded-lg p-4 mb-4">
              <p className="text-[#3e2723] text-sm leading-relaxed mb-3">
                Para descargar el PDF con <strong>TODO el contenido completo</strong> de las tarjetas:
              </p>
              <ol className="text-[#3e2723] text-sm space-y-2 text-left list-decimal list-inside">
                <li>Rota tu dispositivo a <strong>modo horizontal</strong></li>
                <li>Todas las fichas se desplegarán automáticamente</li>
                <li>Vuelve a presionar "Descargar PDF"</li>
              </ol>
            </div>

            <div className="bg-[#fff3cd] border border-[#ffc107] rounded-lg p-3 mb-4">
              <p className="text-xs text-[#856404]">
                <strong>⚠️ Nota:</strong> Si descargas ahora en modo vertical, el PDF solo incluirá la parte frontal de las tarjetas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmPrint}
                className="flex-1 bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition"
              >
                Descargar igual (contenido parcial)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-[#3e2723] px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Entendido, rotaré el dispositivo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
