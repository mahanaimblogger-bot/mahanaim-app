// lib/tiposRecursos.js

export const TIPOS_RECURSOS = {
  estudio: { icon: '📖', label: 'Estudio Bíblico', prioridad: 1 },
  cronologia: { icon: '⏳', label: 'Línea de Tiempo', prioridad: 2 },
  bosquejo: { icon: '📋', label: 'Bosquejo Homilético', prioridad: 3 },
  personaje: { icon: '👤', label: 'Ficha de Personaje', prioridad: 4 },
  exegesis: { icon: '🔬', label: 'Comentario Exegético', prioridad: 5 },
  contexto_arqueologico: { icon: '🏛️', label: 'Contexto Histórico‑Arqueológico', prioridad: 6 },
  aplicaciones_practicas: { icon: '🎯', label: 'Aplicaciones Prácticas', prioridad: 7 },
  citas_autoridades: { icon: '🎓', label: 'Citas de Autoridades', prioridad: 8 },
  ilustraciones_testimonios: { icon: '️', label: 'Ilustraciones y Testimonios', prioridad: 9 },
  paralelos: { icon: '⛓️', label: 'Paralelos Bíblicos', prioridad: 10 },
  conexion_at: { icon: '', label: 'Conexión con el A.T.', prioridad: 11 },
  conexion_nt: { icon: '✝️', label: 'Conexión con el N.T.', prioridad: 12 },
  palabras_clave: { icon: '🔤', label: 'Estudio de Palabras Clave', prioridad: 13 },
  profecias: { icon: '🔮', label: 'Profecías', prioridad: 14 },
  citas_teologos: { icon: '', label: 'Citas de Teólogos', prioridad: 15 },
  citas_libros: { icon: '📘', label: 'Citas de Libros', prioridad: 16 },
  glosario: { icon: '📚', label: 'Glosario de Términos', prioridad: 17 },
  infografia: { icon: '📋', label: 'Infografía Doctrinal', prioridad: 18 },
  diagrama_estructura: { icon: '📐', label: 'Diagrama de Estructura Literaria', prioridad: 19 },
  guia_estudio: { icon: '📝', label: 'Guía de Estudio y Reflexión', prioridad: 20 },
  devocional: { icon: '️', label: 'Devocional', prioridad: 21 },
  hoja: { icon: '🖨️', label: 'Hoja de Trabajo', prioridad: 22 },
  reflexion: { icon: '🤔', label: 'Preguntas de Reflexión', prioridad: 23 },
  sermon: { icon: '🛐', label: 'Sermón / Prédica', prioridad: 24 },
  quiz: { icon: '🧩', label: 'Cuestionario', prioridad: 25 },
  plan: { icon: '🧭', label: 'Plan de Lectura', prioridad: 26 },
  imagen: { icon: '🖼️', label: 'Imagen / Ilustración', prioridad: 27 },
  video: { icon: '🎬', label: 'Video Resumen', prioridad: 28 },
  audio: { icon: '🎧', label: 'Audio / Podcast', prioridad: 29 },
  diapositiva: { icon: '📊', label: 'Diapositivas', prioridad: 30 },
  pdf: { icon: '📄', label: 'PDF / Documento', prioridad: 31 },
  mapa: { icon: '🗺️', label: 'Mapa Interactivo', prioridad: 32 },
  himno: { icon: '🎵', label: 'Himno / Alabanza', prioridad: 33 },
  testimonio: { icon: '🎙️', label: 'Testimonio', prioridad: 34 },
  enlace: { icon: '🔗', label: 'Recurso Externo', prioridad: 35 },
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
