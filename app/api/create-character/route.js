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

    // Convertir a números
    const bookIdNum = parseInt(bookId, 10);
    const chapterNumNum = parseInt(chapterNum, 10);

    // Buscar el chapter_id real
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id')
      .eq('book_id', bookIdNum)
      .eq('numero', chapterNumNum)
      .single();

    if (chapterError || !chapter) {
      console.error('Error buscando capítulo:', chapterError);
      return NextResponse.json({ error: 'Capítulo no encontrado' }, { status: 404 });
    }

    const chapterId = chapter.id;

    // 2. Generar biografía con IA
    const prompt = `Genera una ficha bíblica para "${name}" en español. Devuelve solo un objeto JSON {"biography": "texto biográfico de 150-200 palabras"} sin markdown.`;

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
    const { biography } = JSON.parse(content);

    // 3. Crear slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    // 4. Insertar en persons
    const { error: personError } = await supabase
      .from('persons')
      .insert({ name, slug, description: biography });

    if (personError) {
      return NextResponse.json({ error: personError.message }, { status: 500 });
    }

    // 5. Insertar en resources (tipo 'personaje')
    const htmlContent = `<div class="caja-personaje"><h3>${name}</h3><p>${biography.replace(/\n/g, '</p><p>')}</p></div>`;

    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .insert({
        chapter_id: chapterId,
        tipo: 'personaje',
        titulo: name,
        contenido_html: htmlContent,
        publicado: true,
      })
      .select()
      .single();

    if (resourceError) {
      return NextResponse.json({ error: resourceError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, resourceId: resource.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}