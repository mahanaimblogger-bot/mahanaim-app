import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./estudios.css";
import Navegacion from "./componentes/Navegacion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mahanaim - Centro de Recursos Bíblicos",
  description: "Estudios bíblicos profundos, sermones, videos y materiales para enseñar la Palabra de Dios.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Contenedor principal con fondo de pergamino */}
        <div
          className="min-h-screen"
          style={{
            backgroundImage: "url('https://blogger.googleusercontent.com/img/a/AVvXsEh8_05dG7sOWU0iLgSFju4bHHCBSfEwjnGYu9TqTqYqGmj1eL8je-oh1lSVwMle4GW1fxTOgY59unrm2t-vgIyT0lA8uZLwiqKzuZ6DUc_rlWkHok-Ayw5Ov-f5vQ1Q_qHv1pJ68lzXCxf-mhhUIlaOc-WKivI-rp9bTwQlsW7BUic6578UGPWupnRwn_s=s1600')",
            backgroundRepeat: "repeat",
          }}
        >
          {/* Header con imagen */}
          <header className="max-w-[922px] mx-auto pt-5 px-0">
            <img
              src="https://ngvfllkbdnmezikxxyzd.supabase.co/storage/v1/object/sign/Pagina%20Principal/headerfinal.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xY2Q4MzFiMy0xMTlhLTQyYTktOTE3My1mMDIzYmNhMzYyNTYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQYWdpbmEgUHJpbmNpcGFsL2hlYWRlcmZpbmFsLmpwZyIsImlhdCI6MTc3ODEzOTA4MiwiZXhwIjozMzMxNDEzOTA4Mn0.0X4E2J7cCcGUeh4ClaVLO_ljTEsnMO-5xjy4u50QRRs"
              alt="Mahanaim — Campamento de Dios"
              className="w-full h-auto rounded-t-lg shadow-lg"
            />
          </header>

          {/* Menú de navegación */}
          <Navegacion />

          {/* Contenido de cada página */}
          <main className="max-w-[922px] mx-auto px-0">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white/70 max-w-[922px] mx-auto text-center py-8 text-sm text-[#5d4037] border border-[#d4c4a8] rounded-xl font-['Georgia',serif]">
            © Mahanaim &quot;Campamento de Dios&quot; —{' '}
            <a
              href="https://mahanaimcampamentodivino.blogspot.com"
              className="text-[#5d4037] hover:text-[#bf360c]"
            >
              Inicio del Blog
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}