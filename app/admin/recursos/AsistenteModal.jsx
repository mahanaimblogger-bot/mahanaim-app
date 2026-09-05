"use client";

import { useState } from "react";
import ModalLayout from "./asistente/ModalLayout";
import ResourceTypeStep from "./asistente/ResourceTypeStep";
import ResourceConfigStep from "./asistente/ResourceConfigStep";

const TIPOS = [
  { id: "quiz", icon: "🧩", label: "Cuestionario" },
  { id: "personaje", icon: "👤", label: "Ficha de Personaje" },
  { id: "glosario", icon: "📚", label: "Glosario de Términos" },
  { id: "devocional", icon: "✍️", label: "Devocional" },
  { id: "hoja", icon: "🖨️", label: "Hoja de Trabajo" },
  { id: "reflexion", icon: "💭", label: "Preguntas de Reflexión" },
  { id: "paralelos", icon: "🔗", label: "Paralelos Bíblicos" },
  { id: "palabras_clave", icon: "📖", label: "Estudio de Palabras Clave" },
  // ─── NUEVOS RECURSOS AUTOMÁTICOS ───
  { id: "bosquejo", icon: "🗣️", label: "Bosquejo Homilético" },
  { id: "sermon", icon: "🎤", label: "Sermón / Prédica" },
  { id: "infografia", icon: "📊", label: "Infografía Doctrinal" },
  { id: "citas_teologos", icon: "🎓", label: "Citas de Teólogos" },
  { id: "citas_libros", icon: "📘", label: "Citas de Libros" },
  { id: "contexto_arqueologico", icon: "🏛️", label: "Contexto Histórico‑Arqueológico" },
  { id: "diagrama_estructura", icon: "📐", label: "Diagrama de Estructura Literaria" },
  { id: "cronologia", icon: "📅", label: "Cronología del Capítulo" },
  { id: "conexion_at", icon: "✡️", label: "Conexión con el A.T." },
  { id: "profecias", icon: "🔮", label: "Profecías cumplidas / por cumplir" },
];


export default function AsistenteModal({
  books, chapters, selectedBook, selectedChapter, onClose, onResourceCreated,
}) {
  const [step, setStep] = useState(1);
  const [ctx, setCtx] = useState({
    libro: books.find((b) => b.id.toString() === selectedBook)?.nombre || "",
    slug: books.find((b) => b.id.toString() === selectedBook)?.slug || "",
    cap: chapters.find((c) => c.id.toString() === selectedChapter)?.numero?.toString() || "",
    chapterId: selectedChapter,
  });

  const [tipo, setTipo] = useState("");

  return (
    <ModalLayout context={ctx} onClose={onClose}>
        {step === 1 && (
          <ResourceTypeStep
            types={TIPOS}
            onSelectType={(selectedType) => {
              setTipo(selectedType);
              setStep(2);
            }}
            onClose={onClose}
          />
        )}

        {step === 2 && (
          <ResourceConfigStep
            ctx={ctx}
            tipo={tipo}
            tipoInfo={TIPOS.find((t) => t.id === tipo)}
            onBack={() => setStep(1)}
            onClose={onClose}
            onResourceCreated={onResourceCreated}
          />
        )}
    </ModalLayout>
  );
}