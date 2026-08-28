// lib/tiposRecursos.js

export const TIPOS_RECURSOS = {
  estudio: { icon: '📖', label: 'Estudio Bíblico', prioridad: 1 },
  cronologia: { icon: '⏳', label: 'Línea de Tiempo', prioridad: 2 },
  bosquejo: { icon: '🗣️', label: 'Bosquejo Homilético', prioridad: 3 },
  personaje: { icon: '👤', label: 'Ficha de Personaje', prioridad: 4 },
  exegesis: { icon: '🔬', label: 'Comentario Exegético', prioridad: 5 },
  contexto_arqueologico: { icon: '🏛️', label: 'Contexto Histórico‑Arqueológico', prioridad: 6 },
  paralelos: { icon: '⛓️', label: 'Paralelos Bíblicos', prioridad: 7 },
  conexion_at: { icon: '📜', label: 'Conexión con el A.T.', prioridad: 8 },
  conexion_nt: { icon: '✝️', label: 'Conexión con el N.T.', prioridad: 9 },
  palabras_clave: { icon: '🔤', label: 'Estudio de Palabras Clave', prioridad: 10 },
  profecias: { icon: '🔮', label: 'Profecías', prioridad: 11 },
  citas_teologos: { icon: '🎓', label: 'Citas de Teólogos', prioridad: 12 },
  citas_libros: { icon: '📘', label: 'Citas de Libros', prioridad: 13 },
  glosario: { icon: '📚', label: 'Glosario de Términos', prioridad: 14 },
  infografia: { icon: '📋', label: 'Infografía Doctrinal', prioridad: 15 },
  diagrama_estructura: { icon: '📐', label: 'Diagrama de Estructura Literaria', prioridad: 16 },
  guia_estudio: { icon: '📝', label: 'Guía de Estudio y Reflexión', prioridad: 17 },
  devocional: { icon: '✍️', label: 'Devocional', prioridad: 18 },
  hoja: { icon: '🖨️', label: 'Hoja de Trabajo', prioridad: 19 },
  reflexion: { icon: '🤔', label: 'Preguntas de Reflexión', prioridad: 20 },
  sermon: { icon: '🛐', label: 'Sermón / Prédica', prioridad: 21 },
  quiz: { icon: '🧩', label: 'Cuestionario', prioridad: 22 },
  plan: { icon: '🧭', label: 'Plan de Lectura', prioridad: 23 },
  imagen: { icon: '🖼️', label: 'Imagen / Ilustración', prioridad: 24 },
  video: { icon: '🎬', label: 'Video Resumen', prioridad: 25 },
  audio: { icon: '🎧', label: 'Audio / Podcast', prioridad: 26 },
  diapositiva: { icon: '📊', label: 'Diapositivas', prioridad: 27 },
  pdf: { icon: '📄', label: 'PDF / Documento', prioridad: 28 },
  mapa: { icon: '🗺️', label: 'Mapa Interactivo', prioridad: 29 },
  himno: { icon: '🎵', label: 'Himno / Alabanza', prioridad: 30 },
  testimonio: { icon: '🎙️', label: 'Testimonio', prioridad: 31 },
  enlace: { icon: '🔗', label: 'Recurso Externo', prioridad: 32 },
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
