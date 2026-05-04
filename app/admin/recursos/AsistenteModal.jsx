"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const TIPOS = [
  { id: "quiz", icon: "🧩", label: "Cuestionario" },
  { id: "personaje", icon: "👤", label: "Ficha de Personaje" },
  { id: "glosario", icon: "📚", label: "Glosario de Términos" },
  { id: "devocional", icon: "✍️", label: "Devocional" },
  { id: "hoja", icon: "🖨️", label: "Hoja de Trabajo" },
  { id: "plan", icon: "🧭", label: "Plan de Lectura" },
];

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
          return `Generá una ficha bíblica COMPLETA en HTML para el personaje "${personajes || titulo}" mencionado en ${ctxStr}.${extraLine}

**IMPORTANTE:** Devolvé SOLO un objeto JSON con la siguiente estructura. No uses markdown. Todo el contenido HTML debe estar dentro del campo "contenido_html".

{
  "tipo": "personaje",
  "titulo": "Ficha de Personaje: [nombre]",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DE LA FICHA (DEBE CONTENER TODAS ESTAS SECCIONES EXACTAMENTE CON ESTAS CLASES):**
Usá el siguiente formato de ejemplo, REEMPLAZANDO toda la información de ejemplo por los datos reales del personaje.

<div class="contenedor-blog">
  <h1 class="titulo-entrada">Ficha de Personaje: [Nombre del Personaje]</h1>

  <h2 class="subtitulo">📜 Nombre y Etimología</h2>
  <p>[Nombre en español y en hebreo/griego, significado, raíz lingüística.]</p>

  <h2 class="subtitulo">👨‍👩‍👦 Familia y Origen</h2>
  <ul>
    <li><strong>Padre:</strong> [Nombre o 'Creado directamente por Dios']</li>
    <li><strong>Madre:</strong> [Nombre o 'No registrada']</li>
    <li><strong>Esposa(s):</strong> [Nombre(s)]</li>
    <li><strong>Hijos:</strong> [Nombres]</li>
  </ul>

  <h2 class="subtitulo">⏳ Cronología</h2>
  <p>[Período aproximado]</p>

  <h2 class="subtitulo">📖 Eventos Clave</h2>
  <ol>
    <li><strong>[Evento]:</strong> [Descripción]</li>
  </ol>

  <h2 class="subtitulo">🙏 Análisis Espiritual</h2>
  <p><strong>Fortalezas:</strong> [Texto]</p>
  <p><strong>Debilidades:</strong> [Texto]</p>

  <h2 class="subtitulo">✝️ Conexión con Cristo</h2>
  <p>[Tipología o referencia]</p>

  <h2 class="subtitulo">📚 Referencias Clave</h2>
  <ul>
    <li>[Ref 1]</li>
    <li>[Ref 2]</li>
  </ul>
</div>`;

        case "glosario":
          return `Generá un glosario de términos bíblicos en HTML para ${ctxStr}.
Tema: ${tema || "términos clave del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "glosario",
  "titulo": "Glosario: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL GLOSARIO (DEBE CONTENER AL MENOS 5 TÉRMINOS):**
Usá EXACTAMENTE este formato:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">Glosario de Términos: ${ctx.libro} ${ctx.cap}</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Palabras clave del capítulo con su significado original y contextual.</p>

  <!-- Repetí este bloque por cada término -->
  <div class="apendice-nota" style="margin-bottom:18px;">
    <h4 style="color:#1a5276; margin-bottom:4px; border-bottom:1px dotted #d4ac0d; padding-bottom:4px;">
      <span class="palabra-original">[PALABRA ORIGINAL]</span> — <strong>[Transliteración]</strong>
    </h4>
    <p><strong>Significado:</strong> [Definición]</p>
    <p><strong>Contexto bíblico:</strong> [Explicación de cómo se usa en el capítulo y en otras partes de la Biblia]</p>
  </div>
  <!-- Fin del bloque por término -->

</div>

**REGLAS:**
- Incluí al menos 5 términos relevantes.
- Asegurate de que las palabras originales sean correctas (hebreo/griego).
- No uses emojis en los títulos.
- Todo el HTML debe estar dentro del string "contenido_html".`;

        case "hoja":
          return `Generá una hoja de trabajo para ${ctxStr}.
Título: "${titulo || `Hoja de trabajo: ${ctxStr}`}"
Tema: ${tema || "el capítulo completo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "hoja",
  "titulo": "[TÍTULO]",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DE LA HOJA DE TRABAJO:**
Usá EXACTAMENTE este formato:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DE LA HOJA]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Hoja de trabajo para ${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">📖 Preguntas de Comprensión</h2>
  <ol>
    <li>[Pregunta 1]</li>
    <li>[Pregunta 2]</li>
    <li>[Pregunta 3]</li>
    <li>[Pregunta 4]</li>
    <li>[Pregunta 5]</li>
  </ol>

  <h2 class="subtitulo">💭 Reflexión Personal</h2>
  <ol>
    <li>[Pregunta reflexiva 1]</li>
    <li>[Pregunta reflexiva 2]</li>
    <li>[Pregunta reflexiva 3]</li>
  </ol>

  <h2 class="subtitulo">🔍 Búsqueda Bíblica</h2>
  <ol>
    <li>[Actividad 1: buscar y leer un pasaje relacionado]</li>
    <li>[Actividad 2]</li>
  </ol>

  <h2 class="subtitulo">✝️ Conexión con el Nuevo Testamento</h2>
  <p>[Párrafo que explique cómo este capítulo se conecta con el evangelio o la vida cristiana]</p>
</div>

**REGLAS:**
- 5 preguntas de comprensión, 3 de reflexión, 2 de búsqueda, 1 de conexión con el NT.
- No uses emojis en los títulos principales.
- Todo el HTML debe estar dentro del string "contenido_html".`;

        case "devocional":
          return `Generá un devocional completo para ${ctxStr}.
Título: "${titulo || `Devocional de ${ctxStr}`}"
Tema principal: ${tema || "el mensaje central del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON:
{
  "tipo": "devocional",
  "titulo": "...",
  "contenido_html": "[reflexión]",
  "aplicacion_html": "[aplicación]"
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

        if (data.text) {
          try {
            let clean = data.text.trim();
            clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
            clean = clean.replace(/(\}\s*\{)/g, "},{");
            clean = clean.replace(/,\s*([\]}])/g, "$1");

            try {
              const parsed = JSON.parse(clean);
              setGenerado(parsed);
            } catch {
              setGenerado({ tipo, titulo: titulo || tipoInfo?.label, contenido_html: clean });
            }
          } catch {
            setGenerado({ tipo, titulo: titulo || tipoInfo?.label, contenido_html: data.text.replace(/```json|```/g, "").trim() });
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

  const formatQuizInteractivo = (json) => {
    const preguntas = json.preguntas || [];
    if (preguntas.length === 0) return `<h2>${json.titulo || "Cuestionario"}</h2><p>No se encontraron preguntas.</p>`;

    let html = `<div class="quiz-interactivo">`;
    html += `<h2>${json.titulo || "Cuestionario"}</h2>`;

    preguntas.forEach((p, i) => {
      const preguntaTexto = p.pregunta || "Pregunta sin texto";
      html += `<div class="quiz-pregunta" data-pregunta="${i}">`;
      html += `<p><strong>${i + 1}. ${preguntaTexto}</strong></p><ul class="quiz-opciones">`;

      const opciones = p.opciones || [];
      opciones.forEach((op, j) => {
        const opcionTexto = op.texto || op.text || "Opción sin texto";
        const esCorrecta = op.correcta || op.correcto || op.isCorrect || op.correct || false;
        html += `<li><label><input type="radio" name="pregunta-${i}" value="${j}" data-correcta="${esCorrecta}"> ${opcionTexto}</label></li>`;
      });

      html += `</ul></div>`;
    });

    html += `<button class="quiz-verificar" style="margin-top:20px; padding:10px 20px; background:#1a3a5c; color:#d4ac0d; border:2px solid #d4ac0d; border-radius:8px; cursor:pointer; font-family:Georgia,serif; font-weight:bold;">Verificar respuestas</button>`;
    html += `<div class="quiz-resultado" style="margin-top:16px; font-weight:bold; font-family:Georgia,serif;"></div>`;

    html += `<script>
      (function() {
        const btn = document.querySelector('.quiz-verificar');
        const resultado = document.querySelector('.quiz-resultado');
        if (!btn || !resultado) return;

        btn.addEventListener('click', function() {
          let correctas = 0;
          const preguntas = document.querySelectorAll('.quiz-pregunta');
          preguntas.forEach(function(pregunta) {
            const seleccionada = pregunta.querySelector('input[type="radio"]:checked');
            if (seleccionada && seleccionada.getAttribute('data-correcta') === 'true') {
              correctas++;
            }
          });
          const total = preguntas.length;
          const porcentaje = Math.round((correctas / total) * 100);
          resultado.textContent = correctas + ' de ' + total + ' correctas (' + porcentaje + '%)';

          resultado.style.color = porcentaje === 100 ? '#2d6a4f' : porcentaje >= 50 ? '#b7950b' : '#c0392b';
        });
      })();
    </script>`;

    html += `</div>`;
    return html;
  };

  const guardarRecurso = async () => {
    if (!generado) return;
    setGuardando(true);

    let htmlFinal = "";

    if (generado.preguntas) {
      htmlFinal = formatQuizInteractivo(generado);
    } else if (generado.contenido_html) {
      if (tipo === "quiz") {
        const contenido = generado.contenido_html.trim();
        if (contenido.startsWith("{")) {
          try {
            const parsed = JSON.parse(contenido);
            htmlFinal = formatQuizInteractivo(parsed);
          } catch {
            htmlFinal = contenido;
          }
        } else {
          htmlFinal = contenido;
        }
      } else {
        htmlFinal = generado.contenido_html.replace(/```json|```/g, "").trim();
      }
    } else {
      htmlFinal = formatContenidoHtml(generado);
    }

    const payload = {
      titulo: generado.titulo || titulo || tipoInfo?.label,
      tipo,
      contenido_html: htmlFinal,
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

  const formatContenidoHtml = (json) => {
    if (json.contenido_html) return json.contenido_html;

    switch (json.tipo) {
      case "quiz":
        return formatQuizInteractivo(json);
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
        return (json.contenido_html || "") + (json.aplicacion_html ? `<h3>Aplicación</h3>${json.aplicacion_html}` : "");
      case "personaje":
      case "glosario":
      case "hoja":
        return json.contenido_html || `<h2>${json.titulo || "Sin título"}</h2><p>Contenido generado, pero no hay vista previa automática.</p>`;
      default:
        return `<pre>${JSON.stringify(json, null, 2)}</pre>`;
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