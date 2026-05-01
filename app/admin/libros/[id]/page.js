'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function EditarLibroPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [testamento, setTestamento] = useState('AT');
  const [capitulos, setCapitulos] = useState(1);
  const [nombreOriginal, setNombreOriginal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
        cargarLibro();
      }
    });
  }, [router, id]);

  const cargarLibro = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setNombre(data.nombre || '');
      setSlug(data.slug || '');
      setTestamento(data.testamento || 'AT');
      setCapitulos(data.capitulos || 1);
      setNombreOriginal(data.nombre_original || '');
      setDescripcion(data.descripcion || '');
      setOrden(data.orden || 1);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('books')
      .update({
        nombre: nombre.trim(),
        slug: slug.trim(),
        testamento,
        capitulos: parseInt(capitulos, 10),
        nombre_original: nombreOriginal.trim(),
        descripcion: descripcion.trim(),
        orden: parseInt(orden, 10),
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      router.push('/admin/libros');
    }
  };

  // Generar slug automáticamente al escribir el nombre
  useEffect(() => {
    if (nombre) {
      const slugAuto = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setSlug(slugAuto);
    }
  }, [nombre]);

  if (!session) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <p className="text-[#8d6e63]">Cargando libro...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex font-['Georgia',serif]">
      {/* Barra lateral (resumida) */}
      <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#d4ac0d]">Mahanaim</h1>
          <p className="text-sm text-[#d4ac0d]/70">Panel de Administración</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <a href="/admin" className="px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition">📊 Inicio</a>
          <a href="/admin/libros" className="px-4 py-2 rounded-lg bg-[#d4ac0d]/20 text-[#d4ac0d] font-bold transition hover:bg-[#d4ac0d]/30">📚 Libros</a>
        </nav>
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm text-white/60 mb-2">{session.user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} className="w-full py-2 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition text-sm">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Formulario de edición */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white border border-[#d4c4a8] rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/admin/libros" className="text-[#1a5276] hover:text-[#d4ac0d] text-lg">←</a>
            <h2 className="text-2xl font-bold text-[#1a5276]">Editar Libro</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Slug (auto)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-gray-100 text-[#3e2723] cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Testamento</label>
                <select
                  value={testamento}
                  onChange={(e) => setTestamento(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                >
                  <option value="AT">Antiguo Testamento</option>
                  <option value="NT">Nuevo Testamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Capítulos</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={capitulos}
                  onChange={(e) => setCapitulos(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3e2723] mb-1">Orden</label>
                <input
                  type="number"
                  min="1"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">Nombre original (hebreo/griego)</label>
              <input
                type="text"
                value={nombreOriginal}
                onChange={(e) => setNombreOriginal(e.target.value)}
                placeholder="Ej: בְּרֵאשִׁית, Μᾶρκος..."
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition dir-rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-8 py-2.5 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <a
                href="/admin/libros"
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