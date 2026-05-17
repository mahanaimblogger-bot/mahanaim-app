// app/recursos-biblicos/loading.js

export default function Loading() {
  return (
    <div className="min-h-screen font-['Georgia',serif] text-[#3e2723]">
      <div className="max-w-[922px] mx-auto px-0">
        <div className="bg-[#fdfbf7] p-5 border border-[#d4c4a8] rounded-xl">
          {/* Breadcrumb esqueleto */}
          <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Banner esqueleto */}
          <div className="text-center mb-6">
            <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
          </div>

          {/* Secciones esqueleto (3 secciones de ejemplo) */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-8 p-4 bg-white rounded-lg border border-[#d4c4a8]">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="flex flex-wrap gap-3">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="w-28 h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}