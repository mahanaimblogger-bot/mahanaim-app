// lib/tiposRecursos.js

export const TIPOS_RECURSOS = {
  estudio: { icon: '📖', label: 'Estudio Bíblico', prioridad: 1 },
  cronologia: { icon: '⏳', label: 'Línea de Tiempo', prioridad: 2 },
  bosquejo: { icon: '🗣️', label: 'Bosquejo Homilético', prioridad: 3 },
  personaje: { icon: '👤', label: 'Ficha de Personaje', prioridad: 4 },
  exegesis: { icon: '🔬', label: 'Comentario Exegético', prioridad: 5 },
  contexto_arqueologico: { icon: '🏛️', label: 'Contexto Histórico‑Arqueológico', prioridad: 6 },
  
  // 👇 NUEVO RECURSO AGREGADO 👇
  aplicaciones_practicas: { icon: '🎯', label: 'Aplicaciones Prácticas', prioridad: 7 },
  
  paralelos: { icon: '⛓️', label: 'Paralelos Bíblicos', prioridad: 8 },
  conexion_at: { icon: '📜', label: 'Conexión con el A.T.', prioridad: 9 },
  conexion_nt: { icon: '✝️', label: 'Conexión con el N.T.', prioridad: 10 },
  palabras_clave: { icon: '🔤', label: 'Estudio de Palabras Clave', prioridad: 11 },
  profecias: { icon: '🔮', label: 'Profecías', prioridad: 12 },
  citas_teologos: { icon: '🎓', label: 'Citas de Teólogos', prioridad: 13 },
  citas_libros: { icon: '📘', label: 'Citas de Libros', prioridad: 14 },
  glosario: { icon: '📚', label: 'Glosario de Términos', prioridad: 15 },
  infografia: { icon: '📋', label: 'Infografía Doctrinal', prioridad: 16 },
  diagrama_estructura: { icon: '📐', label: 'Diagrama de Estructura Literaria', prioridad: 17 },
  guia_estudio: { icon: '📝', label: 'Guía de Estudio y Reflexión', prioridad: 18 },
  devocional: { icon: '✍️', label: 'Devocional', prioridad: 19 },
  hoja: { icon: '🖨️', label: 'Hoja de Trabajo', prioridad: 20 },
  reflexion: { icon: '🤔', label: 'Preguntas de Reflexión', prioridad: 21 },
  sermon: { icon: '🛐', label: 'Sermón / Prédica', prioridad: 22 },
  quiz: { icon: '🧩', label: 'Cuestionario', prioridad: 23 },
  plan: { icon: '🧭', label: 'Plan de Lectura', prioridad: 24 },
  imagen: { icon: '🖼️', label: 'Imagen / Ilustración', prioridad: 25 },
  video: { icon: '🎬', label: 'Video Resumen', prioridad: 26 },
  audio: { icon: '🎧', label: 'Audio / Podcast', prioridad: 27 },
  diapositiva: { icon: '📊', label: 'Diapositivas', prioridad: 28 },
  pdf: { icon: '📄', label: 'PDF / Documento', prioridad: 29 },
  mapa: { icon: '🗺️', label: 'Mapa Interactivo', prioridad: 30 },
  himno: { icon: '🎵', label: 'Himno / Alabanza', prioridad: 31 },
  testimonio: { icon: '🎙️', label: 'Testimonio', prioridad: 32 },
  enlace: { icon: '🔗', label: 'Recurso Externo', prioridad: 33 },
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
