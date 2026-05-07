"use client";
import Link from "next/link";

export default function BookCard({ book }) {
  if (!book) {
    return (
      <div className="block group rounded-xl bg-[#1a3a5c] border border-[#d4ac0d]/10 p-6 opacity-50">
        <h3 className="text-xl font-semibold text-[#fdfbf7] font-serif">Sin datos</h3>
      </div>
    );
  }

  return (
    <Link
      href={`/libro/${book.slug}`}
      className="block group rounded-xl bg-[#1a3a5c] border-2 border-transparent hover:border-[#d4ac0d] p-6 transition-all duration-200 hover:shadow-[0_4px_15px_rgba(26,58,92,0.3)] hover:translate-x-1"
    >
      {/* Nombre en español */}
      <h3 className="text-xl font-semibold text-[#fdfbf7] group-hover:text-[#d4ac0d] transition-colors font-serif">
        {book.nombre}
      </h3>

      {/* Nombre original (hebreo/griego) */}
      {book.nombre_original && (
        <p className="mt-2 text-base font-normal text-[#d4ac0d]/70 italic tracking-wide font-serif">
          {book.nombre_original}
        </p>
      )}
    </Link>
  );
}