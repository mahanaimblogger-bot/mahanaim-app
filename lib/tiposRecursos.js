// lib/tiposRecursos.js

export const TIPOS_RECURSOS = {
  estudio: { icon: '📖', label: 'Estudio Bíblico', prioridad: 1 },
  cronologia: { icon: '⏳', label: 'Línea de Tiempo', prioridad: 2 },
  bosquejo: { icon: '🗣️', label: 'Bosquejo Homilético', prioridad: 3 },
  personaje: { icon: '👤', label: 'Ficha de Personaje', prioridad: 4 },
  exegesis: { icon: '🔬', label: 'Comentario Exegético', prioridad: 5 },
  contexto_arqueologico: { icon: '🏛️', label: 'Contexto Histórico‑Arqueológico', prioridad: 6 },
  paralelos: { icon: '⛓️', label: 'Paralelos Bíblicos', prioridad: 7 },
  palabras_clave: { icon: '🔤', label: 'Estudio de Palabras Clave', prioridad: 8 },
  profecias: { icon: '🔮', label: 'Profecías', prioridad: 9 },
  citas_teologos: { icon: '🎓', label: 'Citas de Teólogos', prioridad: 10 },
  citas_libros: { icon: '📘', label: 'Citas de Libros', prioridad: 11 },
  glosario: { icon: '📚', label: 'Glosario de Términos', prioridad: 12 },
  infografia: { icon: '📋', label: 'Infografía Doctrinal', prioridad: 13 },
  diagrama_estructura: { icon: '📐', label: 'Diagrama de Estructura Literaria', prioridad: 14 },
  devocional: { icon: '✍️', label: 'Devocional', prioridad: 15 },
  hoja: { icon: '🖨️', label: 'Hoja de Trabajo', prioridad: 16 },
  reflexion: { icon: '🤔', label: 'Preguntas de Reflexión', prioridad: 17 },
  sermon: { icon: '🛐', label: 'Sermón / Prédica', prioridad: 18 },
  quiz: { icon: '🧩', label: 'Cuestionario', prioridad: 19 },
  plan: { icon: '🧭', label: 'Plan de Lectura', prioridad: 20 },
  imagen: { icon: '🖼️', label: 'Imagen / Ilustración', prioridad: 21 },
  video: { icon: '🎬', label: 'Video Resumen', prioridad: 22 },
  audio: { icon: '🎧', label: 'Audio / Podcast', prioridad: 23 },
  diapositiva: { icon: '📊', label: 'Diapositivas', prioridad: 24 },
  pdf: { icon: '📄', label: 'PDF / Documento', prioridad: 25 },
  mapa: { icon: '🗺️', label: 'Mapa Interactivo', prioridad: 26 },
  himno: { icon: '🎵', label: 'Himno / Alabanza', prioridad: 27 },
  testimonio: { icon: '🎙️', label: 'Testimonio', prioridad: 28 },
  enlace: { icon: '🔗', label: 'Recurso Externo', prioridad: 29 },
};

// Exportamos también objetos separados para facilitar la migración
export const ICONS = Object.fromEntries(
  Object.entries(TIPOS_RECURSOS).map(([key, val]) => [key, val.icon])
);

export const LABELS = Object.fromEntries(
  Object.entries(TIPOS_RECURSOS).map(([key, val]) => [key, val.label])
);

export const ORDEN_PRIORIDAD = Object.entries(TIPOS_RECURSOS)
  .sort((a, b) => a[1].prioridad - b[1].prioridad)
  .map(([tipo]) => tipo);