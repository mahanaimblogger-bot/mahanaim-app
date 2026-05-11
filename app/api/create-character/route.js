// app/api/create-character/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { name, bookId, chapterNum } = await request.json();
    if (!name || !bookId || !chapterNum) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // 1. Obtener el chapter_id real
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('book_id', parseInt(bookId))
      .eq('numero', parseInt(chapterNum))
      .single();
    if (chapterError || !chapter) {
      return NextResponse.json({ error: 'Capítulo no encontrado' }, { status: 404 });
    }

    // 2. Obtener contexto del libro
    const { data: book } = await supabase
      .from('books')
      .select('nombre')
      .eq('id', parseInt(bookId))
      .single();
    const ctxStr = book ? `${book.nombre} ${chapterNum}` : `el capítulo ${chapterNum}`;

    // 3. Verificar si el personaje ya existe en persons
    const { data: existingPerson } = await supabase
      .from('persons')
      .select('id, slug, name')
      .eq('name', name)
      .maybeSingle();

    let slug;
    if (existingPerson) {
      slug = existingPerson.slug;
      // Buscar si ya tiene un recurso de tipo personaje
      const { data: existingResource } = await supabase
        .from('resources')
        .select('id')
        .eq('tipo', 'personaje')
        .ilike('titulo', `%${name}%`)
        .maybeSingle();
      if (existingResource) {
        return NextResponse.json({ success: true, resourceId: existingResource.id, alreadyExists: true });
      }
    } else {
      // Crear slug
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
    }

    // 4. Prompt completo para generar la ficha (idéntico al del asistente admin)
    const prompt = `
      Generá una ficha bíblica COMPLETA en HTML para el personaje "${name}" mencionado en ${ctxStr}.

      **IMPORTANTE:** Devolvé SOLO un objeto JSON con la siguiente estructura. No uses markdown. Todo el contenido HTML debe estar dentro del campo "contenido_html".

      {
        "tipo": "personaje",
        "titulo": "Ficha de Personaje: ${name}",
        "contenido_html": "[HTML COMPLETO AQUÍ]"
      }

      **ESTRUCTURA DE LA FICHA (DEBE CONTENER TODAS ESTAS SECCIONES EXACTAMENTE CON ESTAS CLASES):**
      Usá el siguiente formato de ejemplo, REEMPLAZANDO toda la información de ejemplo por los datos reales del personaje.

      <div class="contenedor-blog">
        <h1 class="titulo-entrada">Ficha de Personaje: ${name}</h1>

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
      - Si algún dato no es bíblico o no se sabe, indicá "No registrado".
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '{}';
    content = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(content);
    const htmlContent = parsed.contenido_html;
    const titulo = parsed.titulo || `Ficha de Personaje: ${name}`;

    // 5. Guardar en persons si no existía
    if (!existingPerson) {
      const { error: personError } = await supabase
        .from('persons')
        .insert({ name, slug, description: 'Personaje bíblico' });
      if (personError && personError.code !== '23505') {
        return NextResponse.json({ error: `Persons: ${personError.message}` }, { status: 500 });
      }
    }

    // 6. Insertar en resources
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .insert({
        chapter_id: chapter.id,
        tipo: 'personaje',
        titulo: titulo,
        contenido_html: htmlContent,
        publicado: true,
      })
      .select()
      .single();

    if (resourceError) {
      return NextResponse.json({ error: `Resources: ${resourceError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, resourceId: resource.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}