import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verseStart = searchParams.get('verseStart');
  const verseEnd = searchParams.get('verseEnd');

  if (!book || !chapter || !verseStart) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  // Obtener el book_id
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .select('id')
    .eq('slug', book.toLowerCase())
    .single();

  if (bookError || !bookData) {
    return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
  }

  let query = supabase
    .from('verses')
    .select('verse, text')
    .eq('book_id', bookData.id)
    .eq('chapter', parseInt(chapter));

  if (verseEnd) {
    query = query.gte('verse', parseInt(verseStart)).lte('verse', parseInt(verseEnd));
  } else {
    query = query.eq('verse', parseInt(verseStart));
  }

  const { data: verses, error: versesError } = await query.order('verse', { ascending: true });

  if (versesError) {
    return NextResponse.json({ error: versesError.message }, { status: 500 });
  }

  const text = verses.map(v => `${v.verse}. ${v.text}`).join(' ');
  return NextResponse.json({ text });
}