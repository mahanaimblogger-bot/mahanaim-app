'use client';

export default function BookCard({ libroNombre, hebreo, capitulos, isAvailable, slug }) {
  const handleClick = (e) => {
    if (!isAvailable) return;
    e.preventDefault();
    // Próximamente navegaremos a la vista de capítulos usando el slug
    alert('Próximamente: vista de capítulos de ' + libroNombre);
  };

  return (
    <a
      href={isAvailable ? '#' : undefined}
      onClick={handleClick}
      className={`
        block bg-white border-2 rounded-lg py-3 px-3 text-center
        transition-all duration-200
        ${isAvailable 
          ? 'border-[#d4c4a8] cursor-pointer hover:border-[#d4ac0d] hover:shadow-[0_4px_12px_rgba(26,58,92,0.1)] hover:-translate-y-0.5' 
          : 'border-gray-200 opacity-50 cursor-default'}
      `}
    >
      <span className="block text-[15px] font-bold text-[#1a5276]" style={{ fontFamily: 'Georgia, serif' }}>
        {libroNombre}
      </span>
      {hebreo && (
        <span 
          className="block text-xs text-[#757575] mt-0.5"
          dir="rtl"
          style={{ fontFamily: '"Times New Roman", serif', unicodeBidi: 'bidi-override' }}
        >
          {hebreo}
        </span>
      )}
    </a>
  );
}