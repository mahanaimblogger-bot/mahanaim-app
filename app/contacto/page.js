'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: '¡Mensaje enviado con éxito! Te responderemos pronto.' });
        e.target.reset();
      } else {
        setStatus({ type: 'error', message: result.error || 'Error al enviar. Intenta más tarde.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de red. Verifica tu conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8] rounded-xl">
          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link href="/" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Inicio
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <span className="text-[#8d6e63]">Contacto</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#1a5276] mb-4">Contacto</h1>
            <p className="text-[#5d4037] italic">Estamos aquí para ayudarte</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Información de contacto */}
            <div className="bg-white p-6 rounded-lg border border-[#d4c4a8] shadow-sm">
              <h2 className="text-xl font-bold text-[#1a5276] mb-4 flex items-center gap-2">
                📬 Información de contacto
              </h2>
              <div className="space-y-4 text-[#3e2723]">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:mahanaim.blogger@gmail.com" className="text-[#1a5276] hover:underline">
                    mahanaim.blogger@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Blog:</strong>{' '}
                  <a href="https://mahanaimcampamentodivino.blogspot.com" target="_blank" rel="noopener noreferrer" className="text-[#1a5276] hover:underline">
                    mahanaimcampamentodivino.blogspot.com
                  </a>
                </p>
                <p>
                  <strong>GitHub:</strong>{' '}
                  <a href="https://github.com/mahanaimblogger-bot/mahanaim-app" target="_blank" rel="noopener noreferrer" className="text-[#1a5276] hover:underline">
                    Repositorio del proyecto
                  </a>
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-white p-6 rounded-lg border border-[#d4c4a8] shadow-sm">
              <h2 className="text-xl font-bold text-[#1a5276] mb-4 flex items-center gap-2">
                ✉️ Envíanos un mensaje
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#3e2723] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] focus:outline-none focus:border-[#d4ac0d]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#3e2723] mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] focus:outline-none focus:border-[#d4ac0d]"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#3e2723] mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    className="w-full px-4 py-2 border border-[#d4c4a8] rounded-lg bg-[#fdfbf7] focus:outline-none focus:border-[#d4ac0d]"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </button>
                {status && (
                  <div className={`text-center text-sm p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Mapa */}
          <div className="mt-8 p-6 bg-white rounded-lg border border-[#d4c4a8] shadow-sm">
            <h2 className="text-xl font-bold text-[#1a5276] mb-4 flex items-center gap-2">
              🗺️ Nuestra ubicación
            </h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.8818723468644!2d-58.21805172504741!3d-34.80891367288143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a3285f6dc8d7f3%3A0x103b30e656c8ea6f!2sSta.%20Teresita%201543%2C%20B1889FTW%20Bosques%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1778915896082!5m2!1ses!2sar"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}