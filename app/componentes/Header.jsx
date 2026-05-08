"use client";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Ocultar el header en cualquier página del panel de administración
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="max-w-[922px] mx-auto pt-5 px-0">
      <img
        src="https://ngvfllkbdnmezikxxyzd.supabase.co/storage/v1/object/sign/Pagina%20Principal/headerfinal.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xY2Q4MzFiMy0xMTlhLTQyYTktOTE3My1mMDIzYmNhMzYyNTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQYWdpbmEgUHJpbmNpcGFsL2hlYWRlcmZpbmFsLmpwZyIsImlhdCI6MTc3ODEzOTA4MiwiZXhwIjozMzMxNDEzOTA4Mn0.0X4E2J7cCcGUeh4ClaVLO_ljTEsnMO-5xjy4u50QRRs"
        alt="Mahanaim — Campamento de Dios"
        className="w-full h-auto rounded-t-lg shadow-lg"
      />
    </header>
  );
}