import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import BookCard from '../BookCard';
import Image from 'next/image';

const secciones = {
  "Pentateuco": [
    "genesis", "exodo", "levitico", "numeros", "deuteronomio"
  ],
  "Libros Históricos": [
    "josue", "jueces", "rut", "1-samuel", "2-samuel", "1-reyes", "2-reyes",
    "1-cronicas", "2-cronicas", "esdras", "nehemias", "ester"
  ],
  "Libros Poéticos y Sapienciales": [
    "job", "salmos", "proverbios", "eclesiastes", "cantares"
  ],
  "Profetas Mayores": [
    "isaias", "jeremias", "lamentaciones", "ezequiel", "daniel"
  ],
  "Profetas Menores": [
    "oseas", "joel", "amos", "abdias", "jonas", "miqueas", "nahum",
    "habacuc", "sofonias", "hageo", "zacarias", "malaquias"
  ],
  "Evangelios": [
    "mateo", "marcos", "lucas", "juan"
  ],
  "Historia de la Iglesia Primitiva": [
    "hechos"
  ],
  "Epístolas Paulinas": [
    "romanos", "1-corintios", "2-corintios", "galatas", "efesios",
    "filipenses", "colosenses", "1-tesalonicenses", "2-tesalonicenses",
    "1-timoteo", "2-timoteo", "tito", "filemon"
  ],
  "Epístolas Generales": [
    "hebreos", "santiago", "1-pedro", "2-pedro", "1-juan", "2-juan",
    "3-juan", "judas"
  ],
  "Literatura Apocalíptica": [
    "apocalipsis"
  ]
};

export default async function Home() {
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('orden', { ascending: true });

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Error al cargar los libros.
      </div>
    );
  }

  const booksBySlug = {};
  books.forEach((book) => {
    booksBySlug[book.slug] = book;
  });

  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8] rounded-xl">
          {/* Banner */}
          <div className="text-center mb-6">
            <Image
  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1470&auto=format&fit=crop"
  alt="Biblioteca Antigua y Escrituras"
  width={922}
  height={300}
  className="w-full h-auto rounded-lg border-4 border-[#5d4037] shadow-lg"
/>
            <h1 className="text-3xl text-[#1b5e20] uppercase tracking-wider mt-3">
              Centro de Recursos Bíblicos
            </h1>
            <p className="text-[#5d4037] italic">
              Estudios, sermones, videos y materiales para enseñar
            </p>
          </div>

          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
            <Link href="/" className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
              Inicio
            </Link>
            <span className="text-[#9e9e9e] mx-2">›</span>
            <span className="text-[#8d6e63]">Recursos Bíblicos</span>
          </div>

          {/* Secciones y libros */}
          {Object.entries(secciones).map(([nombreSeccion, slugs]) => (
            <div
              key={nombreSeccion}
              className="mb-8 p-4 bg-white rounded-lg border border-[#d4c4a8] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h2 className="text-[#1a5276] text-xl font-bold border-b border-[#d4ac0d]/30 pb-2 mb-4">
                {nombreSeccion}
              </h2>

              <div className="flex flex-wrap gap-3">
                {slugs.map((slug) => {
                  const libro = booksBySlug[slug];
                  return <BookCard key={slug} book={libro || null} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}