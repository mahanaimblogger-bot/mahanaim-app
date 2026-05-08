import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./estudios.css";
import Header from "./componentes/Header";
import Navegacion from "./componentes/Navegacion";
import PageBackground from "./componentes/PageBackground";
import MainWrapper from "./componentes/MainWrapper";

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
        <PageBackground>
          <Header />
          <Navegacion />
          <MainWrapper>
            {children}
          </MainWrapper>
          <footer className="bg-white/70 max-w-[922px] mx-auto text-center py-8 text-sm text-[#5d4037] border border-[#d4c4a8] rounded-xl font-['Georgia',serif]">
            © Mahanaim &quot;Campamento de Dios&quot; —{' '}
            <a
              href="https://mahanaimcampamentodivino.blogspot.com"
              className="text-[#5d4037] hover:text-[#bf360c]"
            >
              Inicio del Blog
            </a>
          </footer>
        </PageBackground>
      </body>
    </html>
  );
}