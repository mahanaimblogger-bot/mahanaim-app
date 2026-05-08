"use client";
import { usePathname } from "next/navigation";

export default function MainWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <main className={isAdmin ? "" : "max-w-[922px] mx-auto px-0"}>
      {children}
    </main>
  );
}