"use client";
import { usePathname } from "next/navigation";

export default function PageBackground({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      {children}
    </div>
  );
}