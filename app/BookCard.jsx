"use client";
import Link from "next/link";

export default function BookCard({ book }) {
  return (
    <Link
      href={`/libro/${book.slug}`}
      className="block group rounded-xl bg-[#0f1e2c] border border-[#d4ac0d]/10 hover:border-[#d4ac0d]/30 p-6 transition-all hover:shadow-lg hover:shadow-[#d4ac0d]/5"
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

      {/* Sección bíblica (opcional) */}
      {book.seccion && (
        <p className="mt-3 text-xs uppercase tracking-widest text-[#d4ac0d]/50">
          {book.seccion}
        </p>
      )}
    </Link>
  );
}