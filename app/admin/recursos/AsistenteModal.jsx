"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

// ─── Solo recursos generados con IA ───
const TIPOS = [
  { id: "quiz", icon: "🧩", label: "Cuestionario" },
  { id: "personaje", icon: "👤", label: "Ficha de Personaje" },
  { id: "glosario", icon: "📚", label: "Glosario de Términos" },
  { id: "devocional", icon: "✍️", label: "Devocional" },
  { id: "hoja", icon: "🖨️", label: "Hoja de Trabajo" },
  { id: "plan", icon: "🧭", label: "Plan de Lectura" },
];

// ─── Paleta Catedral ───
const C = {
  bg: "#fdfbf7",
  surface: "#ffffff",
  card: "#fdfbf7",
  border: "#d4c4a8",
  gold: "#d4ac0d",
  goldLight: "#e8c96d",
  goldDim: "#b7950b",
  text: "#3e2723",
  muted: "#8d6e63",
  accent: "#1a5276",
  green: "#2d6a4f",
  azulOscuro: "#1a3a5c",
};

// ─── Props ───
export default function AsistenteModal({
  books,
  chapters,
  selectedBook,
  selectedChapter,
  onClose,
  onResourceCreated,
}) {
  const [step, setStep] = useState(1);
  const [ctx, setCtx] = useState({
    libro: books.find((b) => b.id.toString() === selectedBook)?.nombre || "",
    slug: books.find((b) => b.id.toString() === selectedBook)?.slug || "",
    cap: chapters.find((c) => c.id.toString() === selectedChapter)?.numero?.toString() || "",
    chapterId: selectedChapter,
  });

  const [tipo, setTipo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tema, setTema] = useState("");
  const [personajes, setPersonajes] = useState("");
  const [numDias, setNumDias] = useState("7");
  const [numPreguntas, setNumPreguntas] = useState("5");

  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState(null);
  const [errorGen, setErrorGen] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");
  const [iteracion, setIteracion] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const tipoInfo = TIPOS.find((t) => t.id === tipo);

  const buildPrompt = useCallback(
    (extra = "") => {
      const ctxStr = `${ctx.libro} capítulo ${ctx.cap}`;
      const extraLine = extra ? `\nInstrucciones adicionales: ${extra}` : "";

      switch (tipo) {
        case "quiz":
          // Prompt mejorado con ejemplo completo y llaves cerradas explícitamente
          return `Generá un cuestionario bíblico en JSON para ${ctxStr}.
Título: "${titulo || `¿Cuánto entendiste de ${ctxStr}?`}"
Tema/contexto: ${tema || "el capítulo completo"}
Cantidad de preguntas: ${numPreguntas}${extraLine}

Devolvé SOLO un objeto JSON puro, SIN markdown. Usá EXACTAMENTE esta estructura, incluyendo las comas y llaves correctamente. Cada opción debe tener "texto" y "correcta" (true o false). Solo una opción debe tener "correcta": true.

{
  "tipo": "quiz",
  "titulo": "Ejemplo de título",
  "preguntas": [
    {
      "pregunta": "Texto de la pregunta 1",
      "opciones": [
        {"texto": "Opción A", "correcta": false},
        {"texto": "Opción B", "correcta": true},
        {"texto": "Opción C", "correcta": false},
        {"texto": "Opción D", "correcta": false}
      ]
    }
  ]
}`;

        case "personaje":
          return `Generá una ficha de personaje bíblico en HTML para ${ctxStr}.
Personaje(s): ${personajes || titulo}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "personaje",
  "titulo": "Ficha de Personaje: [nombre]",
  "contenido_html": "[HTML con datos biográficos]"
}`;

        case "glosario":
          return `Generá un glosario de términos bíblicos en HTML para ${ctxStr}.
Tema: ${tema || "términos clave del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "glosario",
  "titulo": "Glosario: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML con al menos 5 términos]"
}`;

        case "devocional":
          return `Generá un devocional completo para ${ctxStr}.
Título: "${titulo || `Devocional de ${ctxStr}`}"
Tema: ${tema || "el mensaje central del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "devocional",
  "titulo": "...",
  "contenido_html": "[reflexión]",
  "aplicacion_html": "[aplicación]"
}`;

        case "hoja":
          return `Generá una hoja de trabajo para ${ctxStr}.
Título: "${titulo || `Hoja de trabajo: ${ctxStr}`}"
Tema: ${tema || "el capítulo completo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "hoja",
  "titulo": "...",
  "contenido_html": "[HTML con actividades]"
}`;

        case "plan":
          return `Generá un plan de lectura para ${ctxStr}.
Título: "${titulo || `Plan de lectura: ${ctxStr}`}"
Días: ${numDias}
Tema: ${tema || "el contexto del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "plan",
  "titulo": "...",
  "dias": [...]
}`;

        default:
          return "";
      }
    },
    [tipo, ctx, titulo, tema, personajes, numDias, numPreguntas]
  );

  const generarConIA = useCallback(
    async (extra = "") => {
      setGenerando(true);
      setErrorGen(null);
      setGenerado(null);

      try {
        const prompt = buildPrompt(extra);
        if (!prompt) throw new Error("Tipo no soportado.");

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, max_tokens: 8000 }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || `Error ${res.status}`);

        // Parseo robusto del texto devuelto por la IA
        if (data.text) {
          try {
            // 1. Limpiar posibles restos de markdown
            let clean = data.text.trim();
            clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

            // 2. Reemplazar comas extra antes de un cierre de objeto/array
            clean = clean.replace(/,\s*([\]}])/g, "$1");

            // 3. Intentar reparar cierres de objetos faltantes en las opciones
            // Si encontramos {"texto": "..." sin cierre, añadimos }
            // Esta es una reparación básica pero útil para errores comunes
            clean = clean.replace(/\{"texto":\s*"[^"]*"(?:\s*,\s*"correcta":\s*(?:true|false))?\s*(?=,|\}\]\])/g, (match) => {
              if (!match.endsWith("}") && match.includes('"texto"')) {
                // Si le falta la propiedad correcta, la añadimos con false
                if (!match.includes('"correcta"')) {
                  return match + ', "correcta": false}';
                }
                return match + "}";
              }
              return match;
            });

            const parsed = JSON.parse(clean);
            setGenerado(parsed);
          } catch {
            setGenerado({ tipo, titulo: titulo || tipoInfo?.label, contenido_html: data.text });
          }
        } else if (data.data) {
          setGenerado(data.data);
        } else {
          setGenerado(data);
        }

        setIteracion((i) => i + 1);
      } catch (e) {
        setErrorGen(e instanceof Error ? e.message : "Error desconocido");
      }
      setGenerando(false);
    },
    [buildPrompt, tipo, titulo, tipoInfo]
  );

  // ─── Función robusta para convertir el JSON generado en HTML ───
  const formatContenidoHtml = (json) => {
    if (json.contenido_html) return json.contenido_html;

    switch (json.tipo) {
      case "quiz": {
        const preguntas = json.preguntas || [];
        if (preguntas.length > 0) {
          let html = `<h2>${json.titulo || "Cuestionario"}</h2>`;
          preguntas.forEach((p, i) => {
            const preguntaTexto = p.pregunta || "Pregunta sin texto";
            html += `<p><strong>${i + 1}. ${preguntaTexto}</strong></p><ul>`;

            const opciones = p.opciones || [];
            opciones.forEach((op) => {
              const opcionTexto = op.texto || op.text || "Opción sin texto";
              const esCorrecta = op.correcta || op.correcto || op.isCorrect || op.correct || false;
              html += `<li>${esCorrecta ? "✅" : "○"} ${opcionTexto}</li>`;
            });
            html += `</ul>`;
          });
          return html;
        }
        return `<h2>${json.titulo || "Cuestionario"}</h2><pre>${JSON.stringify(json, null, 2)}</pre>`;
      }

      case "plan": {
        const dias = json.dias || [];
        if (dias.length > 0) {
          let html = `<h2>${json.titulo || "Plan de lectura"}</h2>`;
          dias.forEach((d) => {
            const diaTitulo = d.titulo || d.title || d.dia || "";
            const diaPasaje = d.pasaje || d.passage || d.ref || "";
            const diaNota = d.nota || d.note || d.desc || "";
            html += `<p><strong>${diaTitulo}</strong> — ${diaPasaje}</p><p>${diaNota}</p><hr/>`;
          });
          return html;
        }
        return `<h2>${json.titulo || "Plan de lectura"}</h2><p>No se encontraron detalles.</p>`;
      }

      case "devocional":
        return (
          (json.contenido_html || "") +
          (json.aplicacion_html ? `<h3>Aplicación</h3>${json.aplicacion_html}` : "")
        );

      case "personaje":
      case "glosario":
      case "hoja":
        return json.contenido_html || `<h2>${json.titulo || "Sin título"}</h2><p>Contenido generado, pero no hay vista previa automática.</p>`;

      default:
        return `<pre>${JSON.stringify(json, null, 2)}</pre>`;
    }
  };

  const guardarRecurso = async () => {
    if (!generado) return;
    setGuardando(true);

    const payload = {
      titulo: generado.titulo || titulo || tipoInfo?.label,
      tipo,
      contenido_html: formatContenidoHtml(generado),
      chapter_id: parseInt(ctx.chapterId, 10),
      recurso_url: generado.recurso_url || "",
      publicado: true,
      orden: 1,
      modo: "html",
    };

    const { error } = await supabase.from("resources").insert(payload);
    setGuardando(false);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      onResourceCreated();
      onClose();
    }
  };

  const inputStyle = {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "Georgia, serif",
    outline: "none",
    marginBottom: 14,
    boxSizing: "border-box",
  };

  const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: 90 };
  const selectStyle = { ...inputStyle };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: 12,
          width: "90%",
          maxWidth: 700,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 24,
          fontFamily: "Georgia, serif",
          color: C.text,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ color: C.gold, margin: 0, fontSize: 18 }}>✨ Asistente IA</h2>
            <p style={{ color: C.muted, fontSize: 12, margin: "2px 0 0" }}>{ctx.libro} — Cap. {ctx.cap}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 18, cursor: "pointer", padding: "4px 10px" }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontSize: 13, color: C.gold, marginBottom: 12 }}>Seleccioná el tipo de recurso</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 18 }}>
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTipo(t.id); setStep(2); }}
                  style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 8, padding: "12px 10px", cursor: "pointer", textAlign: "center", color: C.text }}
                >
                  <span style={{ fontSize: 22, display: "block", marginBottom: 4 }}>{t.icon}</span>
                  <span style={{ fontSize: 12 }}>{t.label}</span>
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>Cancelar</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: C.gold, marginBottom: 12 }}>{tipoInfo?.icon} {tipoInfo?.label}</p>

            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Título</label>
            <input style={inputStyle} placeholder="Título del recurso" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>
              {tipo === "personaje" ? "Personaje(s) *" : "Tema o enfoque *"}
            </label>
            <input
              style={inputStyle}
              placeholder={tipo === "personaje" ? "Ej: Agar la Egipcia" : "Ej: tema central"}
              value={tipo === "personaje" ? personajes : tema}
              onChange={(e) => tipo === "personaje" ? setPersonajes(e.target.value) : setTema(e.target.value)}
            />

            {tipo === "quiz" && (
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Cantidad de preguntas</label>
                <select style={selectStyle} value={numPreguntas} onChange={(e) => setNumPreguntas(e.target.value)}>
                  {[3, 4, 5, 6, 7, 8, 10].map((n) => <option key={n} value={n}>{n} preguntas</option>)}
                </select>
              </div>
            )}

            {tipo === "plan" && (
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Cantidad de días</label>
                <select style={selectStyle} value={numDias} onChange={(e) => setNumDias(e.target.value)}>
                  {[3, 5, 7, 10, 14, 21, 30].map((n) => <option key={n} value={n}>{n} días</option>)}
                </select>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              {generado && !errorGen && (
                <div>
                  <div style={{ background: "#e8f4f8", border: "1px solid #1a5276", borderRadius: 6, padding: 8, fontSize: 12, color: C.accent, marginBottom: 8 }}>
                    ✅ Iteración {iteracion} generada
                  </div>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Modificar (opcional)</label>
                  <textarea style={textareaStyle} placeholder="Ej: Agregá más detalles..." value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { generarConIA(extraInfo); setExtraInfo(""); }}
                      style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}
                    >
                      🔄 Regenerar
                    </button>
                    <button
                      onClick={guardarRecurso}
                      disabled={guardando}
                      style={{ background: C.azulOscuro, color: C.goldLight, border: `1px solid ${C.gold}`, borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: "bold" }}
                    >
                      {guardando ? "Guardando..." : "💾 Guardar recurso"}
                    </button>
                  </div>
                </div>
              )}

              {errorGen && (
                <div style={{ background: "#fdf2f0", border: "1px solid #e74c3c", borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <div style={{ color: "#e74c3c", fontSize: 13, fontWeight: "bold" }}>⚠️ Error</div>
                  <div style={{ color: "#c0392b", fontSize: 12, marginBottom: 8 }}>{errorGen}</div>
                  <button onClick={() => { setErrorGen(null); setGenerado(null); }} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}>
                    🔄 Reintentar
                  </button>
                </div>
              )}

              {!generado && !errorGen && (
                <button
                  onClick={() => generarConIA()}
                  disabled={generando || (!tema && !personajes)}
                  style={{
                    background: C.azulOscuro, color: C.goldLight, border: `1px solid ${C.gold}`,
                    borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: "bold",
                    fontFamily: "Georgia, serif", opacity: generando || (!tema && !personajes) ? 0.5 : 1,
                  }}
                >
                  {generando ? "⏳ Generando..." : `✨ Generar ${tipoInfo?.label}`}
                </button>
              )}
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => { setStep(1); setGenerado(null); setErrorGen(null); }} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
                ← Cambiar tipo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}