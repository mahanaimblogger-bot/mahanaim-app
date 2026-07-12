"use client";
import { usePathname } from "next/navigation";

export default function MainWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <main className={isAdmin ? "" : "w-full px-3 sm:max-w-[922px] sm:mx-auto sm:px-0"}>
      {children}
    </main>
  );
}