'use client';

import Link from 'next/link';

export default function BookCard({ book }) {
  // Si no hay datos del libro, mostramos un placeholder (evita crashear)
  if (!book) {
    return (
      <div className="block bg-[#f5f5f5] border-2 border-[#e0e0e0] rounded-lg p-5 text-center cursor-default opacity-60">
        <p className="text-[15px] font-bold text-[#9e9e9e] font-['Georgia',serif] mb-1">
          Libro no disponible
        </p>
        <p className="text-[12px] text-[#9e9e9e] font-['Times_New_Roman',serif]">
          —
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/libro/${book.slug}`}
      className="block bg-white border-2 border-[#d4c4a8] rounded-lg p-5 text-center transition-all duration-200 hover:border-[#d4ac0d] hover:shadow-md hover:-translate-y-1 cursor-pointer"
    >
      <p className="text-[15px] font-bold text-[#1a5276] font-['Georgia',serif] mb-1">
        {book.nombre}
      </p>
      <p className="text-[12px] text-[#757575] font-['Times_New_Roman',serif] dir-rtl">
        {book.nombre_original || book.nombre}
      </p>
    </Link>
  );
}