"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

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

const C = {
  bg: "#fdfbf7", surface: "#ffffff", card: "#fdfbf7", border: "#d4c4a8",
  gold: "#d4ac0d", goldLight: "#e8c96d", goldDim: "#b7950b", text: "#3e2723",
  muted: "#8d6e63", accent: "#1a5276", green: "#2d6a4f", azulOscuro: "#1a3a5c",
};

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
  const [titulo, setTitulo] = useState("");
  const [tema, setTema] = useState("");
  const [personajes, setPersonajes] = useState("");
  const [numDias, setNumDias] = useState("7");
  const [numPreguntas, setNumPreguntas] = useState("5");
  const [numTerminos, setNumTerminos] = useState("5");

  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState(null);
  const [errorGen, setErrorGen] = useState(null);
  const [extraInfo, setExtraInfo] = useState("");
  const [iteracion, setIteracion] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const tipoInfo = TIPOS.find((t) => t.id === tipo);
  const REGLA_ORTOGRAFIA =
    "**⛔ REGLA ABSOLUTA DE CORRECCIÓN ⛔**\n" +
    "Antes de entregar el texto final, REALIZÁ UNA REVISIÓN COMPLETA de todo lo escrito y CORREGÍ los siguientes errores comunes:\n\n" +
    "- Palabras mal escritas o con letras faltantes/sobrantes.\n" +
    "- Faltas de ortografía (tildes, signos de puntuación).\n" +
    "- Palabras inventadas o mezcladas con otros idiomas.\n" +
    "- Nombres propios, ciudades y términos bíblicos mal escritos.\n" +
    "- Comillas, paréntesis o signos mal cerrados.\n\n" +
    "El texto DEBE estar en ESPAÑOL PERFECTO. No se aceptarán errores tipográficos ni ortográficos.\n\n";

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
  <p>[Nombre en español y en hebreo/griego, significado, raíz lingüística. Ej: Adán (אָדָם, 'Adam') significa 'hombre', 'humanidad' o 'rojo', derivado de adamá (אֲדָמָה, 'tierra').]</p>

  <h2 class="subtitulo">👨‍👩‍👦 Familia y Origen</h2>
  <ul>
    <li><strong>Padre:</strong> [Nombre o 'No registrado'/'Creado directamente por Dios']</li>
    <li><strong>Madre:</strong> [Nombre o 'No registrada']</li>
    <li><strong>Esposa(s):</strong> [Nombre(s)]</li>
    <li><strong>Hijos:</strong> [Nombres]</li>
    <li><strong>Tribu:</strong> [Tribu o 'No aplica']</li>
    <li><strong>Lugar de origen:</strong> [Lugar]</li>
  </ul>

  <h2 class="subtitulo">⏳ Cronología Aproximada</h2>
  <p>[Período histórico, años aproximados. Ej: "Era Patriarcal, aproximadamente 4000 a.C."]</p>

  <h2 class="subtitulo">📖 Eventos Clave de su Vida</h2>
  <ol>
    <li><strong>[Nombre del evento]:</strong> [Descripción breve con referencia bíblica. Ej: "Creación de la mujer (Génesis 2:21-25)"]</li>
    <li><strong>[Nombre del evento]:</strong> [Descripción breve con referencia bíblica]</li>
    <!-- Agregar 3-5 eventos clave -->
  </ol>

  <h2 class="subtitulo">🙏 Análisis Espiritual</h2>
  <p><strong>Fortalezas:</strong> [Describir sus virtudes y actos de fe. Ej: "Caminó con Dios en el huerto antes de la caída."]</p>
  <p><strong>Debilidades y pecados:</strong> [Describir sus fallos. Ej: "Desobedeció el mandato divino de no comer del árbol."]</p>
  <p><strong>Relación con Dios:</strong> [Cómo fue su trato con Dios. Ej: "Experimentó comunión directa, pero también el juicio y la expulsión."]</p>

  <h2 class="subtitulo">✝️ Conexión con Cristo / Tipología</h2>
  <p>[Explicar si el personaje es un tipo de Cristo, aparece en Su genealogía, o anticipa Su obra redentora. Ej: "Adán es 'figura del que había de venir' (Romanos 5:14). Por el primer Adán entró el pecado y la muerte; por el postrer Adán, Cristo, la justicia y la vida eterna (1 Corintios 15:45-49)."]</p>

  <h2 class="subtitulo">📚 Referencias Bíblicas Clave</h2>
  <ul>
    <li>[Referencia 1 - Ej: Génesis 2:7-25]</li>
    <li>[Referencia 2 - Ej: Génesis 3]</li>
    <li>[Referencia 3 - Ej: Romanos 5:12-21]</li>
  </ul>
</div>

**REGLAS ESTRICTAS:**
- No uses emojis en los títulos (solo en los subtítulos donde ya están).
- Usá SOLO las clases HTML proporcionadas (contenedor, titulo-entrada, subtitulo...).
- NUNCA uses backticks (comillas invertidas) ni formateo Markdown dentro del HTML.
- Asegurate de que todo el HTML sea válido y esté correctamente cerrado.
- Usá referencias bíblicas exactas (Libro Capítulo:Versículo) y texto de la RVR1960.
- Si algún dato no es bíblico o no se sabe, indicá "No registrado".`;

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
- No uses emojis en los títulos.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido y no contenga comillas mal escapadas.
- Si usas comillas dobles dentro del HTML, escapalas con \\" para que el JSON sea válido.`;

        case "hoja":
          return `Generá una hoja de trabajo seria y exegética para ${ctxStr}.
Título: "${titulo || `Hoja de trabajo: ${ctxStr}`}"
Tema: ${tema || "análisis profundo del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "hoja",
  "titulo": "[TÍTULO]",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DE LA HOJA DE TRABAJO (Debe seguir este formato rigurosamente):**
Usá EXACTAMENTE este HTML, reemplazando solo los corchetes [] y su contenido por la información real:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DE LA HOJA]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Hoja de trabajo para ${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">📖 Preguntas de Comprensión</h2>
  <p>Responde las siguientes preguntas basándote únicamente en el texto bíblico de ${ctx.libro} ${ctx.cap}:</p>
  <ol>
    <li>[Pregunta específica sobre un evento, personaje o enseñanza del capítulo]</li>
    <li>[Pregunta específica sobre otro aspecto del capítulo]</li>
    <li>[Pregunta específica sobre otro aspecto del capítulo]</li>
    <li>[Pregunta específica sobre otro aspecto del capítulo]</li>
    <li>[Pregunta específica sobre otro aspecto del capítulo]</li>
  </ol>

  <h2 class="subtitulo">💭 Reflexión Personal</h2>
  <p>Meditá en las siguientes preguntas y escribí tus reflexiones:</p>
  <ol>
    <li>[Pregunta reflexiva que conecte el capítulo con la vida del creyente]</li>
    <li>[Pregunta reflexiva que conecte el capítulo con la vida del creyente]</li>
    <li>[Pregunta reflexiva que conecte el capítulo con la vida del creyente]</li>
  </ol>

  <h2 class="subtitulo">🔍 Búsqueda Bíblica</h2>
  <p>Leé los siguientes pasajes y anotá cómo se relacionan con ${ctx.libro} ${ctx.cap}:</p>
  <ol>
    <li><strong>[Referencia bíblica específica]</strong> — [Breve descripción de la conexión esperada]</li>
    <li><strong>[Referencia bíblica específica]</strong> — [Breve descripción de la conexión esperada]</li>
  </ol>

  <h2 class="subtitulo">✝️ Conexión con Cristo y el Evangelio</h2>
  <p>[Explicación de cómo este capítulo apunta a Cristo, su obra redentora o su enseñanza, y cómo aplica a la vida del creyente hoy.]</p>

  <h2 class="subtitulo">🛠️ Aplicación Práctica</h2>
  <p>[Una acción concreta que el lector puede realizar esta semana basada en el capítulo.]</p>
</div>

**REGLAS ESTRICTAS:**
- Las preguntas deben ser concretas y basadas en el texto bíblico, no genéricas.
- Las referencias en Búsqueda Bíblica deben ser pasajes reales que tengan relación con el capítulo.
- La aplicación práctica debe ser específica y realizable.
- Que sea una hoja de trabajo con contenido serio y para estudiosos avanzados del texto biblico
- No uses la palabra "activos" ni términos genéricos como "recursos" en las preguntas.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

        case "devocional":
          return `Generá un devocional profundo y profesional para ${ctxStr}.
Título: "${titulo || `Devocional: ${ctxStr}`}"
Tema principal: ${tema || "el mensaje central del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "devocional",
  "titulo": "[TÍTULO COMPLETO]",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL DEVOCIONAL (Debe seguir este formato rigurosamente):**
Usá EXACTAMENTE este HTML, reemplazando solo los corchetes [] y su contenido por la información real:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DEL DEVOCIONAL]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Devocional basado en ${ctx.libro} ${ctx.cap}</p>

  <div class="cita-versiculo">
    <h3>[Referencia del versículo principal, ej: Génesis 20:3-5]</h3>
    <p>"[Texto exacto del versículo en RVR1960]"</p>
  </div>

  <h2 class="subtitulo">📖 Contexto del Pasaje</h2>
  <p>[Breve explicación del contexto histórico y narrativo del capítulo. Qué está pasando, quiénes son los personajes, por qué es importante.]</p>

  <h2 class="subtitulo">💡 Reflexión</h2>
  <p>[Reflexión profunda de 3-4 párrafos que conecte el texto con la vida del creyente. Cada párrafo debe desarrollar una idea distinta, evitando repetir conceptos. Usá un tono pastoral pero con fundamento exegético. Incluí referencias cruzadas reales a otros pasajes bíblicos que enriquezcan la reflexión.]</p>

  <h2 class="subtitulo">🙏 Aplicación Personal</h2>
  <p>[Una aplicación concreta, específica y realizable para esta semana. Debe estar basada directamente en el texto del capítulo.]</p>

  <div class="caja-meditar">
    <h3>Para Meditar</h3>
    <ul>
      <li>[Pregunta que invite a la introspección basada en el capítulo]</li>
      <li>[Pregunta que invite a la introspección basada en el capítulo]</li>
      <li>[Pregunta que invite a la introspección basada en el capítulo]</li>
    </ul>
  </div>

  <h2 class="subtitulo">📝 Oración Sugerida</h2>
  <p>[Oración modelo que el lector pueda hacer suya, basada en las enseñanzas del capítulo. Debe ser reverente, personal y conectada con el texto bíblico.]</p>
</div>

**REGLAS ESTRICTAS:**
- El versículo citado debe ser textual de la RVR1960 y relevante para el capítulo.
- La reflexión debe ser profunda y exegética, no superficial ni genérica.
- Nunca uses frases como "[reflexión]" o "[aplicación]" como contenido; siempre desarrollá completamente cada sección.
- Las preguntas de "Para Meditar" deben ser concretas y basadas en el capítulo.
- La oración sugerida debe ser personal y conectada con el texto.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".
- No uses emojis en los títulos principales (solo en los subtítulos donde ya están indicados).`;

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

        // ================= NUEVOS RECURSOS =================
        case "reflexion":
          return `Generá una lista de preguntas de reflexión personal y aplicativa sobre ${ctxStr}.
Título: "${titulo || `Preguntas de Reflexión: ${ctxStr}`}"
Tema: ${tema || "el mensaje central del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con la siguiente estructura:
{
  "tipo": "reflexion",
  "titulo": "Preguntas de Reflexión: ${ctx.libro} ${ctx.cap}",
  "preguntas": [
    "Pregunta de reflexión 1...",
    "Pregunta de reflexión 2...",
    "Pregunta de reflexión 3...",
    "Pregunta de reflexión 4...",
    "Pregunta de reflexión 5..."
  ]
}

Reglas:
- Entre 5 y 7 preguntas.
- Preguntas abiertas (no de sí/no).
- Conectan el texto bíblico con la vida actual.
- Incluir una pregunta final de acción concreta.
- Lenguaje pastoral y cálido.
- Máxima calidad ortográfica.`;

        case "paralelos":
          return `Generá referencias cruzadas (paralelos bíblicos) relevantes para ${ctxStr}.
Título: "${titulo || `Paralelos Bíblicos de ${ctxStr}`}"
Tema: ${tema || "el contenido del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura:
{
  "tipo": "paralelos",
  "titulo": "Paralelos Bíblicos: ${ctx.libro} ${ctx.cap}",
  "paralelos": [
    {
      "referencia": "Génesis 1:1",
      "texto_cita": "En el principio creó Dios los cielos y la tierra.",
      "explicacion": "Conexión con la creación..."
    }
  ]
}

REGLAS IMPORTANTES:
- Máximo 6 paralelos.
- Incluir paralelos en el Antiguo y Nuevo Testamento cuando sea posible.
- El campo "texto_cita" debe contener el texto bíblico exacto según la versión RVR1960 (o una parte relevante del versículo).
- La explicación debe conectar teológica o temáticamente el pasaje citado con ${ctx.libro} ${ctx.cap}.
- Cada explicación debe ser clara y concisa (2-3 líneas).
- Máxima calidad ortográfica y fidelidad al texto bíblico.`;

        case "palabras_clave":
          return `Generá un estudio de palabras clave en hebreo/griego para ${ctxStr}.
Título: "${titulo || `Estudio de Palabras Clave: ${ctxStr}`}"
Tema: ${tema || "términos teológicos importantes del capítulo"}
Cantidad de términos: ${numTerminos}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura:
{
  "tipo": "palabras_clave",
  "titulo": "Estudio de Palabras Clave: ${ctx.libro} ${ctx.cap}",
  "terminos": [
    {
      "termino_original": "אֱלֹהִים",
      "transliteracion": "Elohim",
      "strong": "H430",
      "significado": "Dios, dioses, jueces, divino",
      "contexto": "Uso en el capítulo y significado teológico..."
    }
  ]
}

Reglas:
- Entre ${numTerminos} y ${numTerminos} términos (la cantidad exacta solicitada).
- Para el AT usar hebreo, para el NT usar griego (indicar idioma).
- Incluir número de Strong (si no se conoce, escribir "No disponible").
- El contexto debe explicar cómo la palabra enriquece la comprensión del pasaje.
- Priorizar términos con riqueza teológica.`;

        // ─── NUEVOS CASOS ───
        case "bosquejo":
          return `Generá un bosquejo homilético completo para ${ctxStr}.
Título: "${titulo || `Bosquejo Homilético de ${ctxStr}`}"
Tema: ${tema || "el capítulo completo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "bosquejo",
  "titulo": "Bosquejo Homilético: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL BOSQUEJO:**
Usá EXACTAMENTE este formato HTML:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DEL BOSQUEJO]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Bosquejo homilético para ${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">🎯 Tema Central</h2>
  <p>[Frase que resume el tema central del capítulo]</p>

  <h2 class="subtitulo">📖 Pasaje Base</h2>
  <p>${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">🗣️ Bosquejo</h2>
  <ol>
    <li><strong>[Punto principal I]</strong>
      <ul>
        <li>[Subpunto A]</li>
        <li>[Subpunto B]</li>
      </ul>
    </li>
    <li><strong>[Punto principal II]</strong>
      <ul>
        <li>[Subpunto A]</li>
        <li>[Subpunto B]</li>
      </ul>
    </li>
    <li><strong>[Punto principal III]</strong>
      <ul>
        <li>[Subpunto A]</li>
        <li>[Subpunto B]</li>
      </ul>
    </li>
  </ol>

  <h2 class="subtitulo">💡 Ilustración sugerida</h2>
  <p>[Una ilustración o anécdota que se relacione con el tema central]</p>

  <h2 class="subtitulo">🙏 Aplicación</h2>
  <p>[Cómo aplicar el mensaje del capítulo a la vida del creyente hoy]</p>
</div>

**REGLAS ESTRICTAS:**
- El bosquejo debe tener 3 puntos principales con sus respectivos subpuntos.
- La ilustración sugerida debe ser pertinente y edificante.
- La aplicación debe ser concreta y basada en el texto.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

        case "sermon":
          return `Generá un sermón completo basado en ${ctxStr}.
Título: "${titulo || `Sermón: ${ctxStr}`}"
Tema: ${tema || "el mensaje central del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "sermon",
  "titulo": "Sermón: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL SERMÓN:**
Usá EXACTAMENTE este formato HTML:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DEL SERMÓN]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Sermón basado en ${ctx.libro} ${ctx.cap}</p>

  <div class="cita-versiculo">
    <h3>[Referencia del texto principal]</h3>
    <p>"[Texto bíblico principal en RVR1960]"</p>
  </div>

  <h2 class="subtitulo">📖 Introducción</h2>
  <p>[Introducción que capte la atención y presente el tema]</p>

  <h2 class="subtitulo">🗣️ Desarrollo</h2>
  <p>[Cuerpo del sermón, organizado en párrafos claros]</p>

  <h2 class="subtitulo">🙏 Conclusión y Llamado</h2>
  <p>[Conclusión que resuma el mensaje y haga un llamado a la acción]</p>
</div>

**REGLAS ESTRICTAS:**
- El sermón debe ser expositivo, fiel al texto bíblico.
- Debe incluir introducción, desarrollo y conclusión.
- El llamado final debe ser claro y basado en el pasaje.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

                case "infografia":
          return `Generá una infografía doctrinal profunda en HTML para ${ctxStr}.
Título: "${titulo || `Infografía Doctrinal de ${ctxStr}`}"
Tema: ${tema || "las doctrinas principales del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "infografia",
  "titulo": "Infografía Doctrinal: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DE LA INFOGRAFÍA (DEBE SER PROFUNDA Y TIPOLÓGICA):**
Usá EXACTAMENTE este formato HTML, pero con un análisis teológico de peso:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO DE LA INFOGRAFÍA]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Infografía doctrinal basada en ${ctx.libro} ${ctx.cap}</p>

  <div class="tabla-comparativa"><table style="width:100%; border-collapse:collapse; font-size:0.9em; color:#3e2723; font-family:Georgia,serif;">
    <thead><tr><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Doctrina</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Fundamento Bíblico</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Desarrollo Teológico (incluyendo tipología y conexiones redentoras)</th></tr></thead>
    <tbody>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Doctrina 1]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Referencia bíblica]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Explicación que conecte con el plan de salvación, la persona de Cristo o el desarrollo del Pacto]</td></tr>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Doctrina 2]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Referencia bíblica]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Explicación profunda]</td></tr>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Doctrina 3]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Referencia bíblica]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Explicación profunda]</td></tr>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Doctrina 4]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Referencia bíblica]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Explicación profunda]</td></tr>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Doctrina 5]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Referencia bíblica]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Explicación profunda]</td></tr>
    </tbody>
  </table></div>
</div>

**REGLAS ESTRICTAS:**
- Identificar entre 3 y 5 doctrinas realmente significativas. Si el capítulo incluye la promesa del hijo (ej: Isaac), conéctala con Cristo (el Hijo prometido) y la fe (Romanos 4).
- La columna "Desarrollo Teológico" debe ser la más extensa e incluir referencias cruzadas (por ejemplo, Hebreos 11, Romanos 4, Gálatas).
- No se limite a hechos superficiales; busca la raíz teológica detrás de la narrativa.
- Todo el HTML debe estar dentro del string "contenido_html".`;

        case "citas_teologos":
          return `Generá una recopilación de citas de teólogos y eruditos bíblicos sobre ${ctxStr}.
Título: "${titulo || `Citas de Teólogos sobre ${ctxStr}`}"
Tema: ${tema || "el capítulo completo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "citas_teologos",
  "titulo": "Citas de Teólogos: ${ctx.libro} ${ctx.cap}",
  "citas": [
    {
      "autor": "Nombre del teólogo",
      "obra": "Obra de referencia (ej: Comentario Bíblico)",
      "cita": "Texto de la cita textual."
    }
  ]
}

**REGLAS ESTRICTAS:**
- Entre 3 y 5 citas.
- SOLO usar teólogos y obras REALES y VERIFICABLES.
- NUNCA inventar nombres ni citas. Si no estás seguro, no incluyas la cita.
- La cita debe ser textual (o parafraseada fielmente) y pertinente al capítulo.
- Incluir el nombre del teólogo y la obra de referencia.
- Máxima calidad ortográfica.`;

        case "citas_libros":
          return `Generá una recopilación de citas de libros cristianos (no bíblicos) relevantes a ${ctxStr}.
Título: "${titulo || `Citas de Libros sobre ${ctxStr}`}"
Tema: ${tema || "el capítulo completo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "citas_libros",
  "titulo": "Citas de Libros: ${ctx.libro} ${ctx.cap}",
  "citas": [
    {
      "autor": "Nombre del autor",
      "titulo_libro": "Título del libro",
      "cita": "Texto de la cita textual."
    }
  ]
}

**REGLAS ESTRICTAS:**
- Entre 3 y 5 citas.
- SOLO usar libros y autores REALES y VERIFICABLES.
- NUNCA inventar autores ni citas. Si no estás seguro, no incluyas la cita.
- La cita debe ser textual (o parafraseada fielmente) y pertinente al capítulo.
- Máxima calidad ortográfica.`;

        case "contexto_arqueologico":
          return `Generá un contexto histórico y arqueológico para ${ctxStr}.
Título: "${titulo || `Contexto Histórico-Arqueológico de ${ctxStr}`}"
Tema: ${tema || "el contexto histórico y cultural del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "contexto_arqueologico",
  "titulo": "Contexto Histórico-Arqueológico: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL CONTEXTO:**
Usá EXACTAMENTE este formato HTML:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Contexto histórico y arqueológico de ${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">⏳ Contexto Histórico</h2>
  <p>[Explicación del período histórico en que ocurren los hechos del capítulo, incluyendo datos de cronología, política, cultura y sociedad.]</p>

  <h2 class="subtitulo">🏛️ Contexto Arqueológico</h2>
  <p>[Información sobre hallazgos arqueológicos relevantes al capítulo: ciudades, objetos, inscripciones, costumbres, etc.]</p>

  <h2 class="subtitulo">📖 Implicaciones para la Interpretación</h2>
  <p>[Cómo el contexto histórico y arqueológico enriquece la comprensión del texto bíblico.]</p>
</div>

**REGLAS ESTRICTAS:**
- Usar datos históricos y arqueológicos REALES y VERIFICABLES.
- NUNCA inventar hallazgos arqueológicos.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

        case "diagrama_estructura":
          return `Generá un diagrama de estructura literaria para ${ctxStr}.
Título: "${titulo || `Diagrama de Estructura Literaria de ${ctxStr}`}"
Tema: ${tema || "la estructura literaria del capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "diagrama_estructura",
  "titulo": "Diagrama de Estructura Literaria: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DEL DIAGRAMA:**
Usá EXACTAMENTE este formato HTML:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Diagrama de estructura literaria de ${ctx.libro} ${ctx.cap}</p>

  <h2 class="subtitulo">📐 Tipo de Estructura</h2>
  <p>[Indicar si es quiasmo, paralelismo, estructura concéntrica, etc.]</p>

  <h2 class="subtitulo">🗺️ Diagrama</h2>
  <pre style="background:#fdfbf7; padding:15px; border:1px solid #d4c4a8; border-radius:8px; font-family:monospace; font-size:0.85em; white-space:pre-wrap;">
[Diagrama textual mostrando la estructura con indentaciones y letras]
Ejemplo:
A - Introducción
  B - Primer discurso
    C - Punto central
  B' - Segundo discurso
A' - Conclusión
  </pre>

  <h2 class="subtitulo">💡 Significado Teológico de la Estructura</h2>
  <p>[Explicación de por qué el autor usó esta estructura y qué enseña teológicamente.]</p>
</div>

**REGLAS ESTRICTAS:**
- Identificar correctamente la estructura literaria.
- El diagrama debe ser claro y representado textualmente.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

        case "cronologia":
          return `Generá una cronología detallada del capítulo ${ctxStr}.
Título: "${titulo || `Cronología del Capítulo ${ctx.libro} ${ctx.cap}`}"
Tema: ${tema || "los eventos ordenados cronológicamente"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "cronologia",
  "titulo": "Cronología del Capítulo: ${ctx.libro} ${ctx.cap}",
  "contenido_html": "[HTML COMPLETO AQUÍ]"
}

**ESTRUCTURA DE LA CRONOLOGÍA:**
Usá EXACTAMENTE este formato HTML:

<div class="contenedor-blog">
  <h1 class="titulo-entrada">[TÍTULO]</h1>
  <p class="text-[#5d4037] italic text-center mb-6">Cronología de los eventos de ${ctx.libro} ${ctx.cap}</p>

  <div class="tabla-comparativa"><table style="width:100%; border-collapse:collapse; font-size:0.9em; color:#3e2723; font-family:Georgia,serif;">
    <thead><tr><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Orden</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Evento</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Referencia</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Detalle</th></tr></thead>
    <tbody>
      <tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">1</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Nombre del evento]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Versículo(s)]</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">[Breve descripción]</td></tr>
      <!-- Repetir por cada evento -->
    </tbody>
  </table></div>
</div>

**REGLAS ESTRICTAS:**
- Listar los eventos del capítulo en orden cronológico.
- Cada evento debe tener su referencia bíblica exacta.
- Todo el HTML debe estar dentro del string "contenido_html".
- Asegurate de que el JSON sea válido. Si usas comillas dobles dentro del HTML, escapalas con \\".`;

        case "conexion_at":
          return `Generá una sección de conexión con el Antiguo Testamento para ${ctxStr} (que es un pasaje del Nuevo Testamento).
Título: "${titulo || `Conexión con el A.T. en ${ctxStr}`}"
Tema: ${tema || "las conexiones del capítulo con el Antiguo Testamento"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "conexion_at",
  "titulo": "Conexión con el A.T.: ${ctx.libro} ${ctx.cap}",
  "conexiones": [
    {
      "referencia_at": "Referencia del AT",
      "texto_cita": "Cita textual del AT en RVR1960",
      "explicacion": "Cómo se relaciona con ${ctx.libro} ${ctx.cap}"
    }
  ]
}

**REGLAS ESTRICTAS:**
- Incluir entre 3 y 5 conexiones.
- Usar referencias REALES y VERIFICABLES del Antiguo Testamento.
- La cita debe ser textual de la RVR1960.
- La explicación debe ser clara y concisa.
- Máxima calidad ortográfica.`;

                       case "profecias":
          return `Generá una lista de profecías cumplidas o por cumplirse relacionadas con ${ctxStr}.
Título: "${titulo || `Profecías en ${ctxStr}`}"
Tema: ${tema || "las profecías presentes en el capítulo"}${extraLine}

Devolvé SOLO un objeto JSON con esta estructura exacta:
{
  "tipo": "profecias",
  "titulo": "Profecías: ${ctx.libro} ${ctx.cap}",
  "profecias": [
    {
      "profecia": "Texto de la profecía o su descripción",
      "referencia_profecia": "Referencia bíblica de la profecía",
      "estado": "Cumplida / Parcialmente cumplida / Por cumplirse",
      "referencia_cumplimiento": "Referencia bíblica del cumplimiento (si aplica)",
      "explicacion": "Explicación profunda de la profecía, su cumplimiento y su relevancia teológica, conectando con el plan redentor de Dios."
    }
  ]
}

**REGLAS ESTRICTAS PARA UNA DETECCIÓN PROFUNDA:**
- Incluir al menos 2 profecías. Busca incluso aquellas que están "escondidas" o que son tipológicas (ej: el hijo de la promesa, la tierra prometida, la bendición a las naciones).
- Las profecías deben ser REALES y VERIFICABLES. No inventes ninguna.
- El estado debe ser claramente indicado.
- La explicación debe ir más allá de lo obvio: conecta la profecía con el Cristo, con el plan de salvación y con otros pasajes bíblicos.
- Para Génesis 18, busca profecías sobre Isaac (cumplida), la destrucción de Sodoma (cumplida), la intercesión de Abraham (modelo de Cristo), y la promesa de que "todas las naciones serán benditas" (cumplida en Cristo).
- Máxima calidad ortográfica y fidelidad al texto bíblico.`;

        default:
          return null;
      }
    },
    [tipo, titulo, tema, personajes, numDias, numPreguntas, numTerminos, ctx]
  );
  const generarConIA = useCallback(
    async (extra = "") => {
      setGenerando(true);
      setErrorGen(null);
      setGenerado(null);

      try {
        const prompt = REGLA_ORTOGRAFIA + buildPrompt(extra);
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

  // ─── FUNCIONES FORMATEADORAS CORREGIDAS ───
    const formatReflexionHtml = (json) => {
    const preguntas = json.preguntas || [];
    if (preguntas.length === 0) return `<div class="contenedor-blog"><p>No se generaron preguntas.</p></div>`;

    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Preguntas de Reflexión")}</h1>`;
    html += `<div class="caja-meditar" style="margin-top: 1rem;">`;
    html += `<h3>💭 Para Meditar</h3><ul>`;
    preguntas.forEach((p) => {
      html += `<li class="text-gray-700 leading-relaxed">${escapeHtml(p)}</li>`;
    });
    html += `</ul></div>`;
    html += `<p style="text-align: center; font-style: italic; color: #8d6e63; margin-top: 20px;">💭 Tómate un momento para escribir tus respuestas en un cuaderno de estudio.</p>`;
    html += `</div>`;
    return html;
  };

    const formatParalelosHtml = (json) => {
    const paralelos = json.paralelos || [];
    if (paralelos.length === 0) return `<div class="contenedor-blog"><p>No se encontraron paralelos.</p></div>`;

    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Paralelos Bíblicos")}</h1>`;
    html += `<div class="tabla-comparativa"><table style="width:100%; border-collapse:collapse; font-size:0.9em; color:#3e2723; font-family:Georgia,serif;">`;
    html += `<thead><tr><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Referencia</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Cita bíblica</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Conexión con ${ctx.libro} ${ctx.cap}</th></tr></thead><tbody>`;
    paralelos.forEach((p) => {
      html += `<tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-weight:bold; font-size:0.85em;">${escapeHtml(p.referencia)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-style:italic; font-size:0.85em;">${escapeHtml(p.texto_cita)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(p.explicacion)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
  };

    const formatPalabrasClaveHtml = (json) => {
    const terminos = json.terminos || [];
    if (terminos.length === 0) return `<div class="contenedor-blog"><p>No se generaron términos.</p></div>`;

    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Estudio de Palabras Clave")}</h1>`;
    terminos.forEach((t) => {
      html += `<div class="caja-linguistica" style="margin-bottom: 18px;">`;
      html += `<h4>`;
      html += `<span class="palabra-original">${escapeHtml(t.termino_original)}</span> — ${escapeHtml(t.transliteracion)}`;
      if (t.strong && t.strong !== "No disponible") {
        html += `<span style="margin-left: 20px; font-size: 0.75em; background: #1a3a5c; color: #d4ac0d; padding: 2px 8px; border-radius: 10px;">Strong ${escapeHtml(t.strong)}</span>`;
      }
      html += `</h4>`;
      html += `<p><strong>Significado:</strong> ${escapeHtml(t.significado)}</p>`;
      html += `<p><strong>Contexto:</strong> ${escapeHtml(t.contexto)}</p>`;
      html += `</div>`;
    });
    html += `</div>`;
    return html;
  };

  // Formateadores para los nuevos recursos (cuando el JSON no venga con contenido_html directo)
  const formatCitasHtml = (json, tipoLabel) => {
    const citas = json.citas || [];
    if (citas.length === 0) return `<div class="contenedor-blog"><p>No se encontraron citas.</p></div>`;
    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || tipoLabel)}</h1>`;
    citas.forEach((c) => {
      html += `<div class="caja-linguistica" style="margin-bottom:16px;">`;
      html += `<p><strong>${escapeHtml(c.autor || c.autor_libro || "")}</strong>${c.obra ? ` — <em>${escapeHtml(c.obra)}</em>` : ""}${c.titulo_libro ? ` — <em>${escapeHtml(c.titulo_libro)}</em>` : ""}</p>`;
      html += `<p style="margin-top:6px;">“${escapeHtml(c.cita)}”</p>`;
      html += `</div>`;
    });
    html += `</div>`;
    return html;
  };

  const formatConexionATHtml = (json) => {
    const conexiones = json.conexiones || [];
    if (conexiones.length === 0) return `<div class="contenedor-blog"><p>No se encontraron conexiones.</p></div>`;
    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Conexión con el A.T.")}</h1>`;
    html += `<div class="tabla-comparativa"><table style="width:100%; border-collapse:collapse; font-size:0.9em; color:#3e2723; font-family:Georgia,serif;">`;
    html += `<thead><tr><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Ref. A.T.</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Texto A.T.</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Conexión con ${ctx.libro} ${ctx.cap}</th></tr></thead><tbody>`;
    conexiones.forEach((c) => {
      html += `<tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-weight:bold; font-size:0.85em;">${escapeHtml(c.referencia_at)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-style:italic; font-size:0.85em;">${escapeHtml(c.texto_cita)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(c.explicacion)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
  };

  const formatProfeciasHtml = (json) => {
    const profecias = json.profecias || [];
    if (profecias.length === 0) return `<div class="contenedor-blog"><p>No se encontraron profecías.</p></div>`;
    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Profecías")}</h1>`;
    html += `<div class="tabla-comparativa"><table style="width:100%; border-collapse:collapse; font-size:0.9em; color:#3e2723; font-family:Georgia,serif;">`;
    html += `<thead><tr><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Profecía</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Ref. Profecía</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Estado</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Cumplimiento</th><th style="background:#1a3a5c; color:#d4ac0d; padding:8px 10px; text-align:left; font-weight:bold; font-size:0.85em; border:1px solid #3e5a7a;">Explicación</th></tr></thead><tbody>`;
    profecias.forEach((p) => {
      html += `<tr><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(p.profecia)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-weight:bold; font-size:0.85em;">${escapeHtml(p.referencia_profecia)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(p.estado)}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(p.referencia_cumplimiento || "—")}</td><td style="padding:6px 8px; border:1px solid #d4c4a8; vertical-align:top; font-size:0.85em;">${escapeHtml(p.explicacion)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
  };

  const escapeHtml = (str) => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const formatQuizInteractivo = (json) => {
    const preguntas = json.preguntas || [];
    if (preguntas.length === 0) return `<div class="contenedor-blog"><p>No se encontraron preguntas.</p></div>`;

    let html = `<div class="contenedor-blog">`;
    html += `<h1 class="titulo-entrada">${escapeHtml(json.titulo || "Cuestionario Bíblico")}</h1>`;
    html += `<p class="text-[#5d4037] italic text-center mb-6">Responde las siguientes preguntas seleccionando la opción correcta.</p>`;

    preguntas.forEach((p, i) => {
      const preguntaTexto = p.pregunta || "Pregunta sin texto";
      html += `<div class="quiz-pregunta-card bg-[#fdfbf7] p-4 rounded shadow-sm border border-[#d4c4a8] mb-4">`;
      html += `<p class="font-bold text-[#1a5276] mb-3">${i + 1}. ${escapeHtml(preguntaTexto)}</p>`;
      html += `<div class="space-y-2">`;

      const opciones = p.opciones || [];
      opciones.forEach((op, j) => {
        const opcionTexto = op.texto || op.text || "Opción sin texto";
        const esCorrecta = op.correcta || op.correcto || op.isCorrect || op.correct || false;
        html += `<label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-[#fef9e6] rounded transition">`;
        html += `<input type="radio" name="pregunta-${i}" value="${j}" data-correcta="${esCorrecta}" class="w-4 h-4 text-[#d4ac0d]">`;
        html += `<span class="text-gray-700">${escapeHtml(opcionTexto)}</span>`;
        html += `</label>`;
      });

      html += `</div></div>`;
    });

    html += `<div class="text-center mt-6">`;
    html += `<button class="quiz-verificar bg-[#1a3a5c] hover:bg-[#2d5a3d] text-[#d4ac0d] font-bold py-2 px-6 rounded border border-[#d4ac0d] transition cursor-pointer">Verificar respuestas</button>`;
    html += `</div>`;
    html += `<div class="quiz-resultado mt-4 text-center font-bold text-lg"></div>`;

    html += `<script>
      (function() {
        const btn = document.querySelector('.quiz-verificar');
        const resultado = document.querySelector('.quiz-resultado');
        if (!btn || !resultado) return;
        btn.addEventListener('click', function() {
          let correctas = 0;
          const preguntasCards = document.querySelectorAll('.quiz-pregunta-card');
          preguntasCards.forEach((card, idx) => {
            const seleccionada = card.querySelector('input[type="radio"]:checked');
            if (seleccionada && seleccionada.getAttribute('data-correcta') === 'true') {
              correctas++;
            }
          });
          const total = preguntasCards.length;
          const porcentaje = Math.round((correctas / total) * 100);
          
          let mensaje = '';
          if (porcentaje === 100) mensaje = '🎉 ¡Excelente! Has comprendido muy bien este pasaje. Sigue así profundizando en la Palabra.';
          else if (porcentaje >= 80) mensaje = '🙌 Muy bien. Has captado lo esencial. Revisa las preguntas que fallaste para seguir creciendo.';
          else if (porcentaje >= 50) mensaje = '📖 Buen intento. Te recomiendo volver a leer el capítulo y luego intentarlo de nuevo.';
          else mensaje = '💪 No te desanimes. Este es un buen momento para estudiar el capítulo con más calma. ¡Tú puedes!';
          
          resultado.innerHTML = correctas + ' de ' + total + ' correctas (' + porcentaje + '%)<br><span class="text-sm block mt-2">' + mensaje + '</span>';
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

    // Casos con preguntas
    if (generado.preguntas && (tipo === "quiz" || tipo === "reflexion")) {
      if (tipo === "quiz") htmlFinal = formatQuizInteractivo(generado);
      else if (tipo === "reflexion") htmlFinal = formatReflexionHtml(generado);
    }
    // Casos con paralelos
    else if (generado.paralelos && tipo === "paralelos") {
      htmlFinal = formatParalelosHtml(generado);
    }
    // Casos con términos
    else if (generado.terminos && tipo === "palabras_clave") {
      htmlFinal = formatPalabrasClaveHtml(generado);
    }
    // Casos con citas (teólogos o libros)
    else if (generado.citas && (tipo === "citas_teologos" || tipo === "citas_libros")) {
      htmlFinal = formatCitasHtml(generado, tipoInfo?.label);
    }
    // Casos con conexiones AT
    else if (generado.conexiones && tipo === "conexion_at") {
      htmlFinal = formatConexionATHtml(generado);
    }
    // Casos con profecías
    else if (generado.profecias && tipo === "profecias") {
      htmlFinal = formatProfeciasHtml(generado);
    }
    // Si ya tiene contenido_html
    else if (generado.contenido_html) {
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
        let contenidoLimpio = generado.contenido_html.replace(/```json|```/g, "").trim();
        contenidoLimpio = contenidoLimpio
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\\n/g, '');
        htmlFinal = contenidoLimpio;
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
      case "reflexion":
        return formatReflexionHtml(json);
      case "paralelos":
        return formatParalelosHtml(json);
      case "palabras_clave":
        return formatPalabrasClaveHtml(json);
      case "citas_teologos":
      case "citas_libros":
        return formatCitasHtml(json, TIPOS.find(t => t.id === json.tipo)?.label || "Citas");
             case "conexion_at":
          return formatConexionATHtml(json);
        case "profecias":
          return formatProfeciasHtml(json);
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
        case "bosquejo":
        case "sermon":
        case "infografia":
        case "contexto_arqueologico":
        case "diagrama_estructura":
        case "cronologia":
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

            {tipo === "palabras_clave" && (
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Cantidad de términos</label>
                <select style={selectStyle} value={numTerminos} onChange={(e) => setNumTerminos(e.target.value)}>
                  {[3, 4, 5, 6, 7, 8, 10].map((n) => <option key={n} value={n}>{n} términos</option>)}
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
                  disabled={generando || (!tema && !personajes && tipo !== "reflexion" && tipo !== "paralelos" && tipo !== "palabras_clave")}
                  style={{
                    background: C.azulOscuro, color: C.goldLight, border: `1px solid ${C.gold}`,
                    borderRadius: 7, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: "bold",
                    fontFamily: "Georgia, serif", opacity: generando ? 0.5 : 1,
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