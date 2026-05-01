'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRecursosPage() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarRecursos();
      }
    });
  }, [router]);

  const cargarRecursos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*, chapters(*, books(*))')
      .order('created_at', { ascending: false });

    if (!error) {
      setRecursos(data || []);
    } else {
      console.error('Error al cargar recursos:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;

    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) {
      setRecursos((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert('Error al eliminar: ' + error.message);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      {/* Barra lateral (misma que el dashboard) */}
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            📊 Inicio
          </a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            📚 Libros
          </a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            📑 Capítulos
          </a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">
            🎬 Recursos
          </a>
        </nav>

        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/admin/login');
            }}
            className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1a5276]">Recursos</h2>
              <p className="text-[#8d6e63] text-sm mt-1">
                {recursos.length} recurso(s) encontrado(s)
              </p>
            </div>
            <a
              href="/admin/recursos/nuevo"
              className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-5 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition"
            >
              + Nuevo recurso
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#757575]">Cargando recursos...</div>
          ) : recursos.length === 0 ? (
            <div className="text-center py-12 text-[#757575]">
              <p className="text-lg">No hay recursos aún.</p>
              <p className="text-sm text-[#9e9e9e] mt-1">Crea el primer recurso usando el botón "Nuevo recurso".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4c4a8] text-[#5d4037]">
                    <th className="py-3 px-4 font-bold">Título</th>
                    <th className="py-3 px-4 font-bold">Libro</th>
                    <th className="py-3 px-4 font-bold">Cap.</th>
                    <th className="py-3 px-4 font-bold">Tipo</th>
                    <th className="py-3 px-4 font-bold">Publicado</th>
                    <th className="py-3 px-4 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recursos.map((rec) => (
                    <tr key={rec.id} className="border-b border-gray-100 hover:bg-[#fdfbf7] transition">
                      <td className="py-3 px-4 font-bold text-[#1a5276]">{rec.titulo}</td>
                      <td className="py-3 px-4 text-[#3e2723]">{rec.chapters?.books?.nombre || '—'}</td>
                      <td className="py-3 px-4 text-[#3e2723]">{rec.chapters?.numero || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-[#1a3a5c] text-white px-2 py-1 rounded-full uppercase">
                          {rec.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.publicado ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <a
                          href={`/admin/recursos/${rec.id}`}
                          className="text-sm bg-[#1a5276] text-white px-3 py-1 rounded hover:bg-[#2d6a9e] transition"
                        >
                          Editar
                        </a>
                        <button
                          onClick={() => handleDelete(rec.id, rec.titulo)}
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