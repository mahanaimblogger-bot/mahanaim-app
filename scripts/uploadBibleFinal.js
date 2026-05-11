// scripts/uploadBibleFinal.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ngvfllkbdnmezikxxyzd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmZsbGtiZG5tZXppa3h4eXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI3OTc3NywiZXhwIjoyMDkyODU1Nzc3fQ.y0Pzl6l1J7R_L9hObt0XDoQmgDi79Z6zEe0pTW-MExk'; // ⚠️ REEMPLAZA CON TU CLAVE SERVICE_ROLE (no la anon)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadBible() {
  // Leer el archivo JSON
  const filePath = path.join(__dirname, 'rvr1960_completa.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ No se encuentra el archivo rvr1960_completa.json en la carpeta scripts');
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const fullData = JSON.parse(raw);

  const booksData = fullData.books;
  if (!booksData) {
    console.error('❌ El JSON no tiene la propiedad "books"');
    return;
  }

  // Obtener los libros de Supabase (ahora con service_role debería funcionar)
  const { data: booksSupabase, error: booksError } = await supabase
    .from('books')
    .select('id, nombre');
  if (booksError) {
    console.error('❌ Error al obtener libros de Supabase:', booksError.message);
    return;
  }

  // Mapa de nombre a id
  const bookMap = new Map();
  for (const book of booksSupabase) {
    let nombreNorm = book.nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    bookMap.set(nombreNorm, book.id);
  }

  let totalInsertados = 0;
  let totalErrores = 0;
  let totalIgnorados = 0;

  for (const bookItem of booksData) {
    const nombreLibro = bookItem.name;
    let nombreNorm = nombreLibro
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const bookId = bookMap.get(nombreNorm);
    if (!bookId) {
      console.warn(`⚠️ No se encontró ID para el libro: ${nombreLibro} (normalizado: ${nombreNorm})`);
      totalIgnorados++;
      continue;
    }

    console.log(`📖 Procesando ${nombreLibro} (ID: ${bookId})...`);
    const chapters = bookItem.chapters;

    for (const chapter of chapters) {
      if (!chapter.is_chapter) continue;
      const usfm = chapter.chapter_usfm;
      const chapterNumMatch = usfm.match(/\.(\d+)$/);
      if (!chapterNumMatch) continue;
      const chapterNum = parseInt(chapterNumMatch[1], 10);

      const items = chapter.items;
      for (const item of items) {
        if (item.type === 'verse') {
          const verseNumbers = item.verse_numbers;
          if (!verseNumbers || verseNumbers.length === 0) continue;
          const verseNum = verseNumbers[0];
          const text = (item.lines || []).join(' ').trim();
          if (!text) continue;

          const { error } = await supabase
            .from('verses')
            .insert({
              book_id: bookId,
              chapter: chapterNum,
              verse: verseNum,
              text: text,
            });

          if (error) {
            console.error(`❌ Error ${nombreLibro} ${chapterNum}:${verseNum}`, error.message);
            totalErrores++;
          } else {
            totalInsertados++;
            if (totalInsertados % 500 === 0) {
              console.log(`✅ Insertados ${totalInsertados} versículos...`);
            }
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`🎉 Carga completada. Insertados: ${totalInsertados}, Errores: ${totalErrores}, Libros ignorados: ${totalIgnorados}`);
}

uploadBible();