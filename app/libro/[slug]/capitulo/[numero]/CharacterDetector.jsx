'use client';

import { useState, useEffect } from 'react';

export default function CharacterDetector({ bookId, chapterNum }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState([]);
  const [missing, setMissing] = useState([]);

  useEffect(() => {
    async function detect() {
      setLoading(true);
      setError('');
      try {
        // 1. Obtener texto del capítulo
        const chapterRes = await fetch(`/api/chapter-text?bookId=${bookId}&chapter=${chapterNum}`);
        const { text: chapterText, error: chapterError } = await chapterRes.json();
        if (chapterError) throw new Error(chapterError);

        // 2. Detectar personajes con IA
        const detectRes = await fetch('/api/detect-characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chapterText }),
        });
        const { characters, error: apiError } = await detectRes.json();
        if (apiError) throw new Error(apiError);
        if (!characters || characters.length === 0) {
          setExisting([]);
          setMissing([]);
          return;
        }

        // 3. Consultar personajes existentes
        const personsRes = await fetch('/api/persons/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: characters }),
        });
        const { persons, error: personsError } = await personsRes.json();
        if (personsError) throw new Error(personsError);

        const existingNames = new Set(persons.map(p => p.name));
        setExisting(persons || []);
        setMissing(characters.filter(c => !existingNames.has(c)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (bookId && chapterNum) detect();
  }, [bookId, chapterNum]);

  if (loading) return <div className="p-4 bg-gray-100 rounded">🔍 Detectando personajes...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700">Error: {error}</div>;

  return (
    <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
      <h3 className="text-xl font-bold text-[#1a5276] mb-3">👥 Personajes en este capítulo</h3>
      {existing.length === 0 && missing.length === 0 && <p>No se detectaron personajes.</p>}
      {existing.length > 0 && (
        <div className="mb-3">
          <strong>📖 Con ficha existente:</strong>
          <ul className="list-disc ml-6 mt-1">
            {existing.map(p => (
              <li key={p.slug}>
                <a href={`/personaje/${p.slug}`} className="text-blue-800 hover:underline">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <strong>✨ Sin ficha aún (puedes crearlas):</strong>
          <ul className="list-disc ml-6 mt-1">
            {missing.map(name => (
              <li key={name}>
                {name}
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/create-character', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, bookId, chapterNum }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`✅ Ficha de "${name}" creada correctamente.`);
                        window.location.reload();
                      } else {
                        alert(`❌ Error: ${data.error}`);
                      }
                    } catch (err) {
                      alert('Error de red. Intenta de nuevo.');
                    }
                  }}
                  className="ml-2 text-xs bg-[#1a3a5c] text-white px-2 py-0.5 rounded hover:bg-[#2c5a7a]"
                >
                  + Crear ficha
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}