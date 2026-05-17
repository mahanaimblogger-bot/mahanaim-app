// app/libro/[slug]/capitulo/[numero]/loading.js

export default function Loading() {
  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8] rounded-xl">
          {/* Breadcrumb esqueleto */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>

          {/* Botones esqueleto */}
          <div className="flex justify-between items-center gap-4 mb-5">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Título esqueleto */}
          <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6 animate-pulse"></div>

          {/* Cuadrícula de recursos (6 tarjetas de ejemplo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-2 border-[#e8e8e8] rounded-xl p-6 text-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}