'use client';

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 bg-[#1a3a5c] text-[#d4ac0d] border-2 border-[#d4ac0d] px-4 py-2 rounded-lg font-bold hover:bg-[#2d4a6c] transition cursor-pointer shadow-sm font-['Georgia',serif]"
      title="Descargar o imprimir este recurso en PDF"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
      </svg>
      Descargar PDF
    </button>
  );
}
