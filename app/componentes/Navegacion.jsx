"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/recursos-biblicos", label: "Recursos Bíblicos" },
  { href: "/linea-tiempo", label: "Línea de Tiempo" },
  { href: "/lector", label: "Lector Bíblico" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navegacion() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="w-full sm:max-w-[922px] sm:mx-auto bg-[#1a3a5c] border-b-2 border-[#d4ac0d] sm:rounded-b-lg shadow-md">
      {/* Botón hamburguesa (solo visible en vertical/móvil) */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="sm:hidden flex items-center justify-between w-full px-4 py-3 text-[#d4ac0d] font-bold font-['Georgia',serif]"
      >
        <span>☰ Menú</span>
        <span>{abierto ? "▲" : "▼"}</span>
      </button>

      {/* Lista de enlaces */}
      <ul
        className={`flex-col sm:flex sm:flex-row sm:justify-center gap-0 ${
          abierto ? "flex" : "hidden sm:flex"
        }`}
      >
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <li key={enlace.href} className="w-full sm:w-auto">
              <Link
                href={enlace.href}
                onClick={() => setAbierto(false)}
                className={`block px-6 py-3 text-sm font-bold font-['Georgia',serif] tracking-wide transition-all duration-200 text-center sm:text-left
                  ${activo
                    ? "bg-[#d4ac0d] text-[#1a3a5c]"
                    : "text-[#d4ac0d] hover:bg-[#d4ac0d]/10 hover:text-[#e8c96d]"
                  }`}
              >
                {enlace.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}