'use client';

import { useState, useEffect } from 'react';

export function WikiModal({ url, onClose }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    if (!url) return;

    const cargarResumen = async () => {
      setCargando(true);
      setError(false);
      try {
        // Extraer el título del artículo desde la URL de Wikipedia
        const titulo = decodeURIComponent(url.split('/wiki/')[1] || '');
        const apiUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${titulo}`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('No se pudo cargar el resumen');
        const json = await res.json();

        setData({
          titulo: json.title || titulo.replace(/_/g, ' '),
          extracto: json.extract || 'No hay resumen disponible para este artículo.',
          imagen: json.thumbnail?.source || null,
        });
      } catch (e) {
        setError(true);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, [url]);

  if (!url) return null;

  const handleAbrirWikipedia = () => {
    setMostrarConfirmacion(true);
  };

  const handleConfirmarSalida = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setMostrarConfirmacion(false);
    onClose();
  };

  const handleCancelarSalida = () => {
    setMostrarConfirmacion(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!mostrarConfirmacion ? (
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-[#8d6e63] uppercase tracking-wide">
                Wikipedia
              </span>
              <button
                onClick={onClose}
                className="text-[#8d6e63] hover:text-[#3e2723] text-lg leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {cargando && (
              <div className="py-8 text-center text-[#8d6e63] text-sm">
                Cargando resumen...
              </div>
            )}

            {error && !cargando && (
              <div className="py-8 text-center text-[#8d6e63] text-sm">
                No se pudo cargar el resumen de este artículo.
              </div>
            )}

            {data && !cargando && !error && (
              <>
                <h3 className="text-lg font-bold text-[#1a5276] mb-3">
                  {data.titulo}
                </h3>

                {data.imagen && (
                  <img
                    src={data.imagen}
                    alt={data.titulo}
                    className="w-full max-h-48 object-cover rounded-lg mb-3"
                  />
                )}

                <p className="text-sm text-[#3e2723] leading-relaxed mb-5">
                  {data.extracto}
                </p>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-[#d4c4a8] text-[#5d4037] font-medium text-sm hover:bg-[#fef9e6] transition"
              >
                Cerrar
              </button>
              <button
                onClick={handleAbrirWikipedia}
                className="flex-1 px-4 py-2 rounded-lg bg-[#1a3a5c] text-[#d4ac0d] font-bold text-sm hover:bg-[#2d4a6c] transition"
              >
                Abrir en Wikipedia
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <h3 className="text-base font-bold text-[#1a5276] mb-3">
              Vas a salir de Mahanaim
            </h3>
            <p className="text-sm text-[#3e2723] leading-relaxed mb-5">
              Si aceptás, se abrirá el artículo completo en una nueva pestaña del navegador. Para volver a Mahanaim, presioná el botón "Regresar" o "Atrás" de tu navegador.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelarSalida}
                className="flex-1 px-4 py-2 rounded-lg border border-[#d4c4a8] text-[#5d4037] font-medium text-sm hover:bg-[#fef9e6] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSalida}
                className="flex-1 px-4 py-2 rounded-lg bg-[#1a3a5c] text-[#d4ac0d] font-bold text-sm hover:bg-[#2d4a6c] transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}