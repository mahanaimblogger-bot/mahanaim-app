'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminCapitulosPage() {
  const [capitulos, setCapitulos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarLibros();
      }
    });
  }, [router]);

  const cargarLibros = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, nombre')
      .order('orden', { ascending: true });
    if (data) setLibros(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarCapitulos();
  }, [selectedBook]);

  const cargarCapitulos = async () => {
    setLoading(true);
    let query = supabase
      .from('chapters')
      .select('*, books(nombre)')
      .order('numero', { ascending: true });

    if (selectedBook) {
      query = query.eq('book_id', selectedBook);
    }

    const { data, error } = await query;

    if (!error) {
      setCapitulos(data || []);
    } else {
      console.error('Error al cargar capítulos:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id, numero, libroNombre) => {
    if (!window.confirm(`¿Eliminar el capítulo ${numero} de ${libroNombre}? También se borrarán sus recursos asociados. Esta acción no se puede deshacer.`)) return;

    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (!error) {
      setCapitulos((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert('Error al eliminar: ' + error.message);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      {/* Barra lateral */}
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📚 Libros</a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">📑 Capítulos</a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">🎬 Recursos</a>
        </nav>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1a5276]">Capítulos</h2>
              <p className="text-[#8d6e63] text-sm mt-1">
                {capitulos.length} capítulo(s) encontrado(s)
              </p>
            </div>
            <a
              href="/admin/capitulos/nuevo"
              className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-5 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition"
            >
              + Nuevo capítulo
            </a>
          </div>

          {/* Filtro por libro */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#3e2723] mb-1">Filtrar por libro</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full md:w-64 px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
            >
              <option value="">Todos los libros</option>
              {libros.map((libro) => (
                <option key={libro.id} value={libro.id}>{libro.nombre}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#757575]">Cargando capítulos...</div>
          ) : capitulos.length === 0 ? (
            <div className="text-center py-12 text-[#757575]">
              <p className="text-lg">No hay capítulos aún{selectedBook ? ' para este libro' : ''}.</p>
              <p className="text-sm text-[#9e9e9e] mt-1">Crea el primer capítulo usando el botón "Nuevo capítulo".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4c4a8] text-[#5d4037]">
                    <th className="py-3 px-4 font-bold">Libro</th>
                    <th className="py-3 px-4 font-bold">Número</th>
                    <th className="py-3 px-4 font-bold">Resumen</th>
                    <th className="py-3 px-4 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {capitulos.map((cap) => (
                    <tr key={cap.id} className="border-b border-gray-100 hover:bg-[#fdfbf7] transition">
                      <td className="py-3 px-4 font-bold text-[#1a5276]">{cap.books?.nombre || '—'}</td>
                      <td className="py-3 px-4 text-[#3e2723]">{cap.numero}</td>
                      <td className="py-3 px-4 text-[#3e2723] text-sm max-w-xs truncate">
                        {cap.resumen || '—'}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <a
                          href={`/admin/capitulos/${cap.id}`}
                          className="text-sm bg-[#1a5276] text-white px-3 py-1 rounded hover:bg-[#2d6a9e] transition"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => handleDelete(cap.id, cap.numero, cap.books?.nombre || 'Libro')}
                          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}