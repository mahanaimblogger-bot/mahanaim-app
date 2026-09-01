'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ url, titulo, libroNombre, capituloNumero }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioReady, setAudioReady] = useState(false);
  const [error, setError] = useState(null);
  const animationRef = useRef(null);

  // Visualizador animado (fake pero bonito, sin Web Audio API)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 48;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let h;
        if (isPlaying) {
          const t = Date.now() / 300 + i * 0.5;
          h = (Math.sin(t) * 0.4 + 0.6) * height;
        } else {
          h = height * 0.15;
        }

        const gradient = ctx.createLinearGradient(0, height, 0, height - h);
        gradient.addColorStop(0, '#8b6914');
        gradient.addColorStop(0.5, '#d4ac0d');
        gradient.addColorStop(1, '#fcd34d');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 2), height - h, barWidth, h);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Eventos del audio (simple, sin Web Audio API)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setAudioReady(true);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);
    const handleError = () => {
      setError('No se pudo cargar el audio. Verifica la URL.');
      setAudioReady(false);
    };

    audio.volume = volume;
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (e.target.value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto my-6">
      <div className="bg-[#fdfbf7] rounded-xl border-2 border-[#d4c4a8] shadow-lg overflow-hidden">
        
        {/* Header con disco animado */}
        <div className="bg-gradient-to-r from-[#1a3a5c] to-[#2d4a6c] p-5 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f2440] to-[#1a3a5c] border-4 border-[#d4ac0d] shadow-lg flex items-center justify-center"
              style={{ animation: isPlaying ? 'spin 4s linear infinite' : 'none' }}
            >
              <div className="w-5 h-5 rounded-full bg-[#d4ac0d]"></div>
              <div className="absolute inset-2 rounded-full border border-[#d4ac0d]/20"></div>
              <div className="absolute inset-4 rounded-full border border-[#d4ac0d]/20"></div>
            </div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isPlaying && (
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                  ● Reproduciendo
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#d4ac0d] font-['Georgia',serif] leading-tight truncate">
              {titulo}
            </h3>
            <p className="text-[#e0cba0] text-xs sm:text-sm mt-1 font-medium">
              {libroNombre} {capituloNumero && `— Capítulo ${capituloNumero}`}
            </p>
          </div>
        </div>

        {/* Visualizador */}
        <div className="bg-[#0a1929] px-4 py-3 border-b border-[#d4c4a8]/30">
          <canvas 
            ref={canvasRef} 
            className="w-full h-20 rounded"
          />
        </div>

        {/* Controles */}
        <div className="p-5 space-y-4">
          
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="relative w-full h-2 bg-[#e8e8e8] rounded-full overflow-hidden group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#b8960c] to-[#d4ac0d] transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Progreso del audio"
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-[#1a3a5c]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded text-sm text-red-800">
              ⚠️ {error}
            </div>
          )}

          {/* Controles principales */}
          <div className="flex items-center justify-between">
            
            {/* Volumen */}
            <div className="flex items-center gap-2 group">
              <svg className="w-5 h-5 text-[#1a3a5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange} 
                className="w-20 h-1 bg-[#e8e8e8] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-[#d4ac0d]
                  [&::-webkit-slider-thumb]:hover:bg-[#b8960c]
                  [&::-webkit-slider-thumb]:transition-colors
                  [&::-moz-range-thumb]:w-3 
                  [&::-moz-range-thumb]:h-3 
                  [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-[#d4ac0d]
                  [&::-moz-range-thumb]:border-none"
                aria-label="Volumen"
              />
            </div>

            {/* Botón Play/Pause */}
            <button 
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#1a3a5c] hover:bg-[#2d4a6c] text-[#d4ac0d] shadow-lg border-2 border-[#d4ac0d] transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Velocidad */}
            <div className="w-20 text-right">
              <span className="text-xs font-bold text-[#1a3a5c] bg-[#e8e8e8] px-2 py-1 rounded">
                1.0×
              </span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
