// app/personaje/layout.js
export default function PersonajeLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="max-w-[922px] mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}