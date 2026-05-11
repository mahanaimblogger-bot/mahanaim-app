import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // ← clave anónima
);

export async function POST(request) {
  const { names } = await request.json();
  if (!names || !Array.isArray(names)) {
    return NextResponse.json({ error: 'Se requiere un array de nombres' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('persons')
    .select('name, slug')
    .in('name', names);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ persons: data || [] });
}