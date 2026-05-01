import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./estudios.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}