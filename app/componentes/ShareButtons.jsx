'use client';
import { useState } from 'react';

export default function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);

  // Obtener la URL actual del navegador
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[#d4ac0d] text-center">
      <p className="text-sm text-[#8d6e63] mb-3 font-['Georgia',serif]">Comparte este recurso:</p>
      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={shareOnFacebook} className="bg-[#3b5998] hover:bg-[#2d4373] text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
          <span>📘</span> Facebook
        </button>
        <button onClick={shareOnTwitter} className="bg-[#1da1f2] hover:bg-[#0c85d0] text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
          <span>🐦</span> Twitter
        </button>
        <button onClick={shareOnWhatsApp} className="bg-[#25d366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
          <span>📱</span> WhatsApp
        </button>
        <button onClick={copyToClipboard} className="bg-[#1a3a5c] hover:bg-[#2d4a6c] text-[#d4ac0d] border border-[#d4ac0d] px-4 py-2 rounded-lg transition flex items-center gap-2">
          <span>🔗</span> {copied ? '¡Copiado!' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  );
}