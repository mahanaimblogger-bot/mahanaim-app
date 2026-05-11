// scripts/uploadEvangelios.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ngvfllkbdnmezikxxyzd.supabase.co';
// 👇 Pega aquí tu clave service_role (entre comillas simples)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndmZsbGtiZG5tZXppa3h4eXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI3OTc3NywiZXhwIjoyMDkyODU1Nzc3fQ.y0Pzl6l1J7R_L9hObt0XDoQmgDi79Z6zEe0pTW-MExk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// IDs de los evangelios en tu tabla books (verifica que sean correctos)
const EVANGELIOS = {
  'Mateo': 42,
  'Marcos': 43,
  'Lucas': 44,
  'Juan': 45
};

async function uploadEvangelios() {
  const filePath = path.join(__dirname, 'rvr1960_completa.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ No se encuentra el archivo rvr1960_completa.json en la carpeta scripts');
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const fullData = JSON.parse(raw);
  const booksData = fullData.books;

  let totalInsertados = 0;
  let totalErrores = 0;

  for (const bookItem of booksData) {
    const nombreLibro = bookItem.name; // "S. Mateo", "S. Marcos", ...
    // Quitar "S. " para obtener "Mateo", "Marcos", etc.
    let nombreLimpio = nombreLibro.replace(/^S\.\s*/, '');
    const bookId = EVANGELIOS[nombreLimpio];
    if (!bookId) continue; // solo procesa evangelios

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
            // Si es duplicado (unique constraint), lo ignoramos
            if (error.code === '23505') {
              console.log(`ℹ️ Ya existía ${nombreLimpio} ${chapterNum}:${verseNum}`);
            } else {
              console.error(`❌ Error ${nombreLimpio} ${chapterNum}:${verseNum}`, error.message);
              totalErrores++;
            }
          } else {
            totalInsertados++;
            if (totalInsertados % 200 === 0) {
              console.log(`✅ Insertados ${totalInsertados} versículos de evangelios...`);
            }
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`🎉 Evangelios completados. Insertados: ${totalInsertados}, Errores: ${totalErrores}`);
}

uploadEvangelios();