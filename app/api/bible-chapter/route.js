// app/api/bible-chapter/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookSlug = searchParams.get('book');
  const chapter = searchParams.get('chapter');

  if (!bookSlug || !chapter) {
    return NextResponse.json({ error: 'Faltan parámetros: book y chapter' }, { status: 400 });
  }

  // Mapeo de slugs a nombres en inglés (como espera la API)
  const bookMap = {
    genesis: 'Genesis',
    exodo: 'Exodus',
    levitico: 'Leviticus',
    numeros: 'Numbers',
    deuteronomio: 'Deuteronomy',
    josue: 'Joshua',
    jueces: 'Judges',
    rut: 'Ruth',
    // puedes agregar más
  };

  const bookEnglish = bookMap[bookSlug.toLowerCase()];
  if (!bookEnglish) {
    return NextResponse.json({ error: 'Libro no soportado aún' }, { status: 400 });
  }

  // Construir referencia correcta: "Genesis 1"
  const reference = `${bookEnglish} ${chapter}`;
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=rvr1960`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    // Extraer el texto plano del capítulo
    const text = data.verses?.map(v => v.text).join(' ') || '';
    return NextResponse.json({ text, book: data.reference });
  } catch (error) {
    console.error('Error fetching bible:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}