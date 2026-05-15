export const metadata = {
  title: 'Inicio | Mahanaim - Centro de Recursos Bíblicos',
  description: 'Bienvenido a Mahanaim, plataforma de estudios bíblicos profundos, sermones y recursos para enseñar la Palabra de Dios.',
  keywords: 'Biblia, estudios bíblicos, sermones, recursos cristianos, Mahanaim',
  openGraph: {
    title: 'Mahanaim - Centro de Recursos Bíblicos',
    description: 'Estudios bíblicos profundos, sermones y materiales para enseñar la Palabra de Dios.',
    type: 'website',
  },
}

export default function Inicio() {
  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0 pb-10">
        <div className="bg-[#f2e8d5] p-8 border border-[#d4c4a8] rounded-xl text-center">
          <h2 className="text-3xl font-bold text-[#1a3a5c] mb-4">
            Bienvenido a Mahanaim
          </h2>
          <p className="text-lg text-[#5d4037] leading-relaxed">
            Un lugar en la web para profundizar en el estudio de las Sagradas Escrituras.
          </p>
        </div>
      </div>
    </div>
  );
}