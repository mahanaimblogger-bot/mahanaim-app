'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4">
      <div className="w-full max-w-md bg-white border border-[#d4c4a8] rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a5276] font-['Georgia',serif] mb-2">
            Mahanaim
          </h1>
          <p className="text-[#8d6e63] italic">Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#3e2723] mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition font-['Georgia',serif]"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3e2723] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:border-[#d4ac0d] focus:ring-1 focus:ring-[#d4ac0d] transition font-['Georgia',serif]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] py-3 rounded-lg font-bold font-['Georgia',serif] hover:bg-[#2d4a6c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-[#9e9e9e] mt-6">
          Solo acceso autorizado · Mahanaim © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}