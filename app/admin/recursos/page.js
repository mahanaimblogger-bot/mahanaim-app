'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRecursosPage() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  // Estados para filtros
  const [libros, setLibros] = useState([]);
  const [capitulos, setCapitulos] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState('');
  const [capituloSeleccionado, setCapituloSeleccionado] = useState('');

  // Autenticación
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
    const { data } = await supabase.from('books').select('id, nombre').order('id');
    if (data) setLibros(data);
  };

  const cargarCapitulos = async (bookId) => {
    if (!bookId) {
      setCapitulos([]);
      return;
    }
    const { data } = await supabase
      .from('chapters')
      .select('numero')
      .eq('book_id', bookId)
      .order('numero');
    if (data) setCapitulos(data);
  };

  const cargarRecursos = async (bookId = null, chapterNum = null) => {
    setLoading(true);
    let query = supabase
      .from('resources')
      .select('*, chapters(*, books(*))');

    if (bookId && chapterNum) {
      // Filtrar por libro y capítulo específico
      const { data: chapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('book_id', bookId)
        .eq('numero', chapterNum)
        .single();
      if (chapter) {
        query = query.eq('chapter_id', chapter.id);
      } else {
        setRecursos([]);
        setLoading(false);
        return;
      }
    } else if (bookId && !chapterNum) {
      // Filtrar solo por libro: obtener todos los capítulos de ese libro y luego recursos con chapter_id en esa lista
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('book_id', bookId);
      if (chapters && chapters.length > 0) {
        const chapterIds = chapters.map(c => c.id);
        query = query.in('chapter_id', chapterIds);
      } else {
        setRecursos([]);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) {
      setRecursos(data || []);
    } else {
      console.error('Error al cargar recursos:', error);
    }
    setLoading(false);
  };

  const handleLibroChange = async (e) => {
    const bookId = e.target.value;
    setLibroSeleccionado(bookId);
    setCapituloSeleccionado('');
    if (bookId) {
      await cargarCapitulos(bookId);
      cargarRecursos(bookId, null); // Filtra solo por libro
    } else {
      setCapitulos([]);
      cargarRecursos(); // sin filtros
    }
  };

  const handleCapituloChange = (e) => {
    const chapterNum = e.target.value;
    setCapituloSeleccionado(chapterNum);
    if (libroSeleccionado && chapterNum) {
      cargarRecursos(libroSeleccionado, chapterNum);
    } else if (libroSeleccionado && !chapterNum) {
      cargarRecursos(libroSeleccionado, null);
    }
  };

  const limpiarFiltros = () => {
    setLibroSeleccionado('');
    setCapituloSeleccionado('');
    setCapitulos([]);
    cargarRecursos();
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) {
      if (libroSeleccionado) {
        cargarRecursos(libroSeleccionado, capituloSeleccionado || null);
      } else {
        cargarRecursos();
      }
    } else {
      alert('Error: ' + error.message);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      {/* Barra lateral (igual que antes) */}
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📚 Libros</a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📑 Capítulos</a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">🎬 Recursos</a>
          <a href="/admin/personajes" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">👥 Personajes</a>
        </nav>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1a5276]">Recursos</h2>
              <p className="text-[#8d6e63] text-sm mt-1">{recursos.length} recurso(s) encontrado(s)</p>
            </div>
            <a href="/admin/recursos/nuevo" className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-5 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition">+ Nuevo recurso</a>
          </div>

          {/* Filtros */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-[#5d4037] mb-1">Filtrar por Libro</label>
              <select value={libroSeleccionado} onChange={handleLibroChange} className="border border-[#d4c4a8] rounded-lg p-2 w-48">
                <option value="">Todos los libros</option>
                {libros.map(libro => <option key={libro.id} value={libro.id}>{libro.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5d4037] mb-1">Capítulo (opcional)</label>
              <select value={capituloSeleccionado} onChange={handleCapituloChange} disabled={!libroSeleccionado} className="border border-[#d4c4a8] rounded-lg p-2 w-32">
                <option value="">Todos los capítulos</option>
                {capitulos.map(cap => <option key={cap.numero} value={cap.numero}>{cap.numero}</option>)}
              </select>
            </div>
            <button onClick={limpiarFiltros} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Limpiar filtros</button>
          </div>

          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : recursos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No hay recursos con esos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4c4a8]">
                    <th className="py-3 px-4">Título</th>
                    <th className="py-3 px-4">Libro</th>
                    <th className="py-3 px-4">Cap.</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Publicado</th>
                    <th className="py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recursos.map(rec => (
                    <tr key={rec.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold">{rec.titulo}</td>
                      <td className="py-3 px-4">{rec.chapters?.books?.nombre || '—'}</td>
                      <td className="py-3 px-4">{rec.chapters?.numero || '—'}</td>
                      <td className="py-3 px-4"><span className="bg-[#1a3a5c] text-white px-2 py-1 rounded-full text-xs">{rec.tipo}</span></td>
                      <td className="py-3 px-4">{rec.publicado ? '✅' : '❌'}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <a href={`/admin/recursos/${rec.id}`} className="bg-[#1a5276] text-white px-3 py-1 rounded text-sm">Editar</a>
                        <button onClick={() => handleDelete(rec.id, rec.titulo)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Borrar</button>
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