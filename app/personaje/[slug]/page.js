// app/personaje/[slug]/page.js
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export default async function PersonajePage({ params }) {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. Obtener el nombre real del personaje usando el slug
  const { data: person, error: personError } = await supabase
    .from('persons')
    .select('name')
    .eq('slug', slug)
    .single();

  if (personError || !person) {
    notFound();
  }

  const nombrePersonaje = person.name;

  // 2. Buscar el recurso de tipo 'personaje' cuyo título contenga el nombre
  const { data: recursos, error: recursosError } = await supabase
    .from('resources')
    .select('id, contenido_html, titulo')
    .eq('tipo', 'personaje')
    .ilike('titulo', `%${nombrePersonaje}%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (recursosError || !recursos || recursos.length === 0) {
    notFound();
  }

  const ficha = recursos[0];

  // 3. Mostrar la ficha completa (contenido HTML generado por IA)
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div dangerouslySetInnerHTML={{ __html: ficha.contenido_html }} />
      <div className="mt-8 text-center">
        <a href="/recursos-biblicos" className="text-[#d4ac0d] hover:underline">
          ← Volver a Recursos Bíblicos
        </a>
      </div>
    </div>
  );
}