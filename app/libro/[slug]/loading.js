// app/libro/[slug]/loading.js

export default function Loading() {
  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8] rounded-xl">
          {/* Breadcrumb esqueleto */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>

          {/* Botón volver esqueleto */}
          <div className="h-10 bg-gray-200 rounded w-32 mb-5 animate-pulse"></div>

          {/* Título esqueleto */}
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b-2 border-[#d4ac0d]">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Cuadrícula de capítulos (6 tarjetas de ejemplo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-2 border-[#e8e8e8] rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}