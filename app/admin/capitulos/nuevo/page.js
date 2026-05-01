'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NuevoCapituloPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [numero, setNumero] = useState(1);
  const [resumen, setResumen] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarDatos();
      }
    });
  }, [router]);

  const cargarDatos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('books')
      .select('id, nombre')
      .order('orden', { ascending: true });
    if (data) setBooks(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !numero) {
      alert('Selecciona un libro y un número de capítulo.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('chapters').insert({
      book_id: parseInt(selectedBook, 10),
      numero: parseInt(numero, 10),
      resumen: resumen.trim() || null,
    });

    setSaving(false);

    if (error) {
      alert('Error al crear capítulo: ' + error.message);
    } else {
      router.push('/admin/capitulos');
    }
  };

  if (!session) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <p className="text-[#8d6e63]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">📑 Capítulos</a>
        </nav>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/admin/capitulos" className="text-[#1a5276] hover:text-[#d4ac0d] text-lg">←</a>
            <h2 className="text-2xl font-bold text-[#1a5276]">Nuevo Capítulo</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">Libro *</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
              >
                <option value="">Seleccionar libro...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Número de capítulo *</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">Resumen (opcional)</label>
              <textarea
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                placeholder="Breve descripción del contenido del capítulo..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-8 py-2.5 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50"
              >
                {saving ? 'Creando...' : 'Crear capítulo'}
              </button>
              <a
                href="/admin/capitulos"
                className="px-8 py-2.5 rounded-lg border border-[#d4c4a8] text-[#5d4037] hover:bg-gray-50 transition"
              >
                Cancelar
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}