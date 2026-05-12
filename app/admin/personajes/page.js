'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPersonajesPage() {
  const [personajes, setPersonajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarPersonajes();
      }
    });
  }, [router]);

  const cargarPersonajes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .order('name');
    if (error) {
      console.error(error);
    } else {
      setPersonajes(data || []);
    }
    setLoading(false);
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar personaje "${nombre}" y su ficha asociada?`)) return;

    const { data: resources } = await supabase
      .from('resources')
      .select('id')
      .eq('tipo', 'personaje')
      .eq('titulo', `Ficha de Personaje: ${nombre}`);

    if (resources && resources.length > 0) {
      await supabase.from('resources').delete().eq('id', resources[0].id);
    }

    const { error } = await supabase.from('persons').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      cargarPersonajes();
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📚 Libros</a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📑 Capítulos</a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">🎬 Recursos</a>
          <a href="/admin/personajes" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">👥 Personajes</a>
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
              <h2 className="text-2xl font-bold text-[#1a5276]">Personajes Bíblicos</h2>
              <p className="text-[#8d6e63] text-sm mt-1">{personajes.length} personaje(s) registrados</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Cargando personajes...</div>
          ) : personajes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No hay personajes aún. Usa el detector en los capítulos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4c4a8]">
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personajes.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-[#1a5276]">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-sm">{p.slug}</td>
                      <td className="py-3 px-4 text-gray-700">{p.description?.substring(0, 80)}...</td>
                      <td className="py-3 px-4 flex gap-2">
                        <a href={`/personaje/${p.slug}`} target="_blank" rel="noopener noreferrer" className="bg-[#1a5276] text-white px-3 py-1 rounded text-sm">Ver ficha</a>
                        <button onClick={() => handleEliminar(p.id, p.name)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Eliminar</button>
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