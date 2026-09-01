'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ url, titulo, libroNombre, capituloNumero }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const animationRef = useRef(null);

  // Visualizador de audio responsivo y elegante
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationId;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      const barCount = Math.floor(width / 14); // Barras responsivas
      const barWidth = (width / barCount) - 4;
      
      for (let i = 0; i < barCount; i++) {
        let h;
        if (isPlaying) {
          // Onda suave y orgánica cuando reproduce
          const t = Date.now() / 300 + i * 0.5;
          h = (Math.sin(t) * 0.4 + 0.6) * height;
        } else {
          // Estado de reposo elegante
          h = height * 0.15;
        }
        
        // Degradado dorado para las barras
        const gradient = ctx.createLinearGradient(0, height, 0, height - h);
        gradient.addColorStop(0, '#b8960c');
        gradient.addColorStop(1, '#fcd34d');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 4), height - h, barWidth, h);
      }
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  // Manejo de eventos del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);
    
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnd);
    
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnd);
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
    if (!audio) return;
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

  return (
    <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0f2440] rounded-2xl shadow-xl p-6 sm:p-8 my-6 border border-[#d4ac0d]/40">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[#d4ac0d] font-['Georgia',serif] leading-tight mb-2">
          {titulo}
        </h3>
        <p className="text-[#e0cba0] text-sm font-medium tracking-wide uppercase">
          {libroNombre} {capituloNumero && `— Capítulo ${capituloNumero}`}
        </p>
      </div>

      {/* Visualizador de Audio */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-16 sm:h-20 mb-6 rounded-lg bg-[#0a1929]/50"
      />
      
      {/* Elemento de audio oculto */}
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Controles */}
      <div className="flex flex-col gap-5">
        {/* Barra de Progreso */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm font-mono text-[#d4ac0d] w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="flex-1 h-2 bg-[#0a1929] rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-[#d4ac0d] 
              [&::-webkit-slider-thumb]:shadow-md 
              [&::-webkit-slider-thumb]:transition-transform 
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-4 
              [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-[#d4ac0d]
              [&::-moz-range-thumb]:border-none"
          />
          <span className="text-xs sm:text-sm font-mono text-[#d4ac0d] w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Botones de Control */}
        <div className="flex items-center justify-between">
          {/* Botón Play/Pause Premium */}
          <button 
            onClick={togglePlay} 
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#d4ac0d] hover:bg-[#e5bd1f] text-[#1a3a5c] shadow-lg shadow-[#d4ac0d]/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Control de Volumen */}
          <div className="flex items-center gap-3 bg-[#0a1929]/60 px-4 py-2 rounded-full border border-[#d4ac0d]/20">
            <svg className="w-5 h-5 text-[#d4ac0d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange} 
              className="w-20 sm:w-24 h-1.5 bg-[#1a3a5c] rounded-full appearance-none cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-[#d4ac0d]
                [&::-moz-range-thumb]:w-3 
                [&::-moz-range-thumb]:h-3 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-[#d4ac0d]
                [&::-moz-range-thumb]:border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
