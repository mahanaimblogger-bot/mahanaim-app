// app/api/chapter-text/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Clave service_role (con permisos totales) – solo se ejecuta en el servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // 👈 esta variable de entorno la crearemos
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  const chapter = searchParams.get('chapter');

  if (!bookId || !chapter) {
    return NextResponse.json({ error: 'Faltan bookId o chapter' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('verses')
    .select('text')
    .eq('book_id', parseInt(bookId))
    .eq('chapter', parseInt(chapter))
    .order('verse', { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const chapterText = data.map(v => v.text).join(' ');
  return NextResponse.json({ text: chapterText });
}