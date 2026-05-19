// app/componentes/Breadcrumb.jsx
import Link from 'next/link';

export default function Breadcrumb({ items }) {
  const baseUrl = 'https://mahanaim.app'; // Cambia por tu dominio final

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.href ? `${baseUrl}${item.href}` : undefined
    })).filter(i => i.item)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-white border border-[#d4c4a8] rounded p-2.5 mb-5 text-sm">
        {items.map((item, index) => (
          <span key={index}>
            {index > 0 && <span className="text-[#9e9e9e] mx-2">›</span>}
            {item.href ? (
              <Link href={item.href} className="text-[#5d4037] hover:text-[#bf360c] border-b border-dotted border-[#8d6e63]">
                {item.name}
              </Link>
            ) : (
              <span className="text-[#8d6e63]">{item.name}</span>
            )}
          </span>
        ))}
      </div>
    </>
  );
}