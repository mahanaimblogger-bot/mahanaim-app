'use client';

import { useState, useEffect } from 'react';

export default function CharacterDetector({ bookId, chapterNum }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState([]);
  const [missing, setMissing] = useState([]);
  const [creating, setCreating] = useState(null);
  const [toast, setToast] = useState(null); // { type, message }

  useEffect(() => {
    // Limpiar toast después de 3 segundos
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function detect() {
      setLoading(true);
      setError('');
      try {
        const chapterRes = await fetch(`/api/chapter-text?bookId=${bookId}&chapter=${chapterNum}`);
        const { text: chapterText, error: chapterError } = await chapterRes.json();
        if (chapterError) throw new Error(chapterError);

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

  const handleCreateCharacter = async (name) => {
    setCreating(name);
    try {
      const res = await fetch('/api/create-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bookId, chapterNum }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: 'success', message: `✅ Ficha de "${name}" creada correctamente.` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setToast({ type: 'error', message: `❌ Error: ${data.error}` });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Error de red. Intenta de nuevo.' });
    } finally {
      setCreating(null);
    }
  };

  if (loading) return <div className="p-4 bg-gray-100 rounded">🔍 Detectando personajes...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700">Error: {error}</div>;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

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
                <li key={name} className="flex items-center gap-2">
                  {name}
                  <button
                    onClick={() => handleCreateCharacter(name)}
                    disabled={creating === name}
                    className={`ml-2 text-xs px-2 py-0.5 rounded transition ${
                      creating === name
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#1a3a5c] text-white hover:bg-[#2c5a7a]'
                    }`}
                  >
                    {creating === name ? 'Creando...' : '+ Crear ficha'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}