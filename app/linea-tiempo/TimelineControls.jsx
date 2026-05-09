// app/linea-tiempo/TimelineControls.jsx
'use client';

export default function TimelineControls() {
  const jumpToYear = (year) => {
    if (typeof window !== 'undefined' && window.__timelineJumpToYear) {
      // Se pasa 'true' para que también seleccione el evento explícitamente
      window.__timelineJumpToYear(year, true);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <button onClick={() => jumpToYear(-4004)} className="jump-btn">🌍 Creación</button>
      <button onClick={() => jumpToYear(-2091)} className="jump-btn">👴 Abraham</button>
      <button onClick={() => jumpToYear(-1446)} className="jump-btn">📜 Éxodo</button>
      <button onClick={() => jumpToYear(-1010)} className="jump-btn">👑 David</button>
      <button onClick={() => jumpToYear(-586)} className="jump-btn">🏛️ Exilio</button>
      <button onClick={() => jumpToYear(-5)} className="jump-btn">✝️ Jesús</button>
    </div>
  );
}