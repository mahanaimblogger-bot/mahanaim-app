"use client";
import Image from 'next/image';
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Ocultar el header en cualquier página del panel de administración
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="max-w-[922px] mx-auto pt-5 px-0">
      <Image
  src="https://ngvfllkbdnmezikxxyzd.supabase.co/storage/v1/object/public/mahanaim-public/headerfinal.jpg"
  alt="Mahanaim — Campamento de Dios"
  width={922}
  height={200}
  className="w-full h-auto rounded-t-lg shadow-lg"
  priority
/>
    </header>
  );
}