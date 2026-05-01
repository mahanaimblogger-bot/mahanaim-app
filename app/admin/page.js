'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
      }
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-[#8d6e63] text-lg font-['Georgia',serif]">Cargando panel...</div>
      </div>
    );
  }

  if (!session) return null; // ya redirige

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      {/* Barra lateral */}
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">
            📊 Inicio
          </a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            📚 Libros
          </a>
          <a href="/admin/capitulos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            📑 Capítulos
          </a>
          <a href="/admin/recursos" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">
            🎬 Recursos
          </a>
        </nav>

        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#1a5276] mb-4">Bienvenido al Panel</h2>
          <p className="text-[#5d4037] mb-6">
            Desde aquí podrás gestionar los libros, capítulos y recursos de la plataforma.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#fdfbf7] border border-[#d4c4a8] rounded-lg p-6 text-center">
              <p className="text-4xl mb-2">📚</p>
              <p className="text-lg font-bold text-[#1a5276]">Libros</p>
              <p className="text-sm text-[#757575]">Gestiona los libros de la Biblia</p>
            </div>
            <div className="bg-[#fdfbf7] border border-[#d4c4a8] rounded-lg p-6 text-center">
              <p className="text-4xl mb-2">📑</p>
              <p className="text-lg font-bold text-[#1a5276]">Capítulos</p>
              <p className="text-sm text-[#757575]">Añade contenido a cada capítulo</p>
            </div>
            <div className="bg-[#fdfbf7] border border-[#d4c4a8] rounded-lg p-6 text-center">
              <p className="text-4xl mb-2">🎬</p>
              <p className="text-lg font-bold text-[#1a5276]">Recursos</p>
              <p className="text-sm text-[#757575]">Administra estudios, sermones y más</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}