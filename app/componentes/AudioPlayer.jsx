'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ url, titulo, libroNombre, capituloNumero }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [audioReady, setAudioReady] = useState(false);
  const [error, setError] = useState(null);

  // Configurar Web Audio API (una sola vez)
  const setupAudioContext = () => {
    if (audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; // 64 barras de frecuencia
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (err) {
      console.warn('No se pudo crear AudioContext:', err);
    }
  };

  // Dibujar visualizador con frecuencias REALES
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * 2; // Retina
      canvas.height = canvas.offsetHeight * 2;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const barCount = 48;
      const barWidth = width / barCount - 2;

      if (analyser && isPlaying) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Mapear las 64 frecuencias del analyser a 48 barras
        const step = Math.floor(dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] || 0;
          const barHeight = (value / 255) * height * 0.95;

          // Degradado dorado con intensidad según volumen
          const intensity = value / 255;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#8b6914');
          gradient.addColorStop(0.5, '#d4ac0d');
          gradient.addColorStop(1, intensity > 0.7 ? '#fde047' : '#d4ac0d');

          ctx.fillStyle = gradient;
          ctx.shadowColor = '#d4ac0d';
          ctx.shadowBlur = intensity > 0.6 ? 8 : 0;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      } else {
        // Estado de reposo: barras tenues y uniformes
        for (let i = 0; i < barCount; i++) {
          const barHeight = height * 0.08;
          ctx.fillStyle = 'rgba(212, 172, 13, 0.25)';
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Eventos del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setAudioReady(true);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => setIsPlaying(false);
    const handleError = () => setError('No se pudo cargar el audio.');

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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configurar AudioContext en la primera interacción (requerido por navegadores)
    setupAudioContext();

    // Reanudar AudioContext si estaba suspendido
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (err) {
        setError('No se pudo reproducir. Verifica la URL.');
      }
    }
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
          {/* Disco giratorio */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#0f2440] to-[#1a3a5c] border-4 border-[#d4ac0d] shadow-lg flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <div className="w-5 h-5 rounded-full bg-[#d4ac0d]"></div>
              {/* Surcos del disco */}
              <div className="absolute inset-2 rounded-full border border-[#d4ac0d]/20"></div>
              <div className="absolute inset-4 rounded-full border border-[#d4ac0d]/20"></div>
            </div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
            )}
          </div>

          {/* Info */}
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

            {/* Botón Play/Pause grande */}
            <button 
              onClick={togglePlay}
              disabled={!audioReady && !isPlaying}
              className="w-14 h-14 rounded-full bg-[#1a3a5c] hover:bg-[#2d4a6c] text-[#d4ac0d] shadow-lg border-2 border-[#d4ac0d] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

            {/* Velocidad (placeholder visual) */}
            <div className="w-20 text-right">
              <span className="text-xs font-bold text-[#1a3a5c] bg-[#e8e8e8] px-2 py-1 rounded">
                1.0×
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded text-sm text-red-800">
              ️ {error}
            </div>
          )}
        </div>
      </div>

      {/* CSS para animación lenta del disco */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
