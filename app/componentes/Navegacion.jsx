"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/recursos-biblicos", label: "Recursos Bíblicos" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navegacion() {
  const pathname = usePathname();

  return (
    <nav className="max-w-[922px] mx-auto bg-[#1a3a5c] border-b-2 border-[#d4ac0d] rounded-b-lg shadow-md">
      <ul className="flex justify-center gap-0">
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className={`block px-6 py-3 text-sm font-bold font-['Georgia',serif] tracking-wide transition-all duration-200
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