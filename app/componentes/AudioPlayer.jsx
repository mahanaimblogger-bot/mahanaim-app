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

  const drawBars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 16;
    const barWidth = width / barCount - 2;
    let bars = [];

    if (isPlaying) {
      for (let i = 0; i < barCount; i++) {
        const t = Date.now() / 400 + i;
        const h = (Math.sin(t) * 0.4 + 0.6) * height;
        bars.push(h);
      }
    } else {
      for (let i = 0; i < barCount; i++) bars.push(height * 0.2);
    }

    for (let i = 0; i < barCount; i++) {
      ctx.fillStyle = '#d4ac0d';
      ctx.fillRect(i * (barWidth + 2), height - bars[i], barWidth, bars[i]);
    }

    animationRef.current = requestAnimationFrame(drawBars);
  };

  useEffect(() => {
    drawBars();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

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
    <div className="bg-gradient-to-br from-[#1a2a3a] to-[#0f1a24] rounded-2xl shadow-2xl p-6 my-6 border border-[#d4ac0d]/30">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-[#d4ac0d] font-serif">{titulo}</h3>
        <p className="text-[#e0cba0] text-sm">{libroNombre} {capituloNumero}</p>
      </div>
      <canvas ref={canvasRef} width={500} height={80} className="w-full h-20 mb-4 rounded-lg"></canvas>
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#d4ac0d] w-12">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#d4ac0d]"
          />
          <span className="text-xs text-[#d4ac0d] w-12">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={togglePlay} className="bg-[#d4ac0d] hover:bg-[#c49b0c] text-[#1a2a3a] font-bold py-2 px-6 rounded-full transition flex items-center gap-2 text-lg">
            {isPlaying ? '⏸ Pausa' : '▶ Reproducir'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#d4ac0d] text-sm">🔊</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#d4ac0d]" />
          </div>
        </div>
      </div>
    </div>
  );
}