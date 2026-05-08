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
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('https://blogger.googleusercontent.com/img/a/AVvXsEh8_05dG7sOWU0iLgSFju4bHHCBSfEwjnGYu9TqTqYqGmj1eL8je-oh1lSVwMle4GW1fxTOgY59unrm2t-vgIyT0lA8uZLwiqKzuZ6DUc_rlWkHok-Ayw5Ov-f5vQ1Q_qHv1pJ68lzXCxf-mhhUIlaOc-WKivI-rp9bTwQlsW7BUic6578UGPWupnRwn_s=s1600')",
        backgroundRepeat: "repeat",
      }}
    >
      {children}
    </div>
  );
}