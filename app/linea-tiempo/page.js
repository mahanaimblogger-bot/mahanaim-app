import { createClient } from '@supabase/supabase-js';
import Breadcrumb from '@/app/componentes/Breadcrumb';
import TimelineWrapper from './TimelineWrapper';

const supabaseUrl = 'https://ngvfllkbdnmezikxxyzd.supabase.co';
const supabaseAnonKey = 'sb_publishable_qAFVH9JgX4Nl5PiW27NUwA_qSWqizeD';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTimelineEvents() {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .order('start_year', { ascending: true });
  if (error) return [];
  return data || [];
}

export default async function TimelinePage() {
  const events = await getTimelineEvents();

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7]">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <Breadcrumb items={[
          { name: 'Inicio', href: '/' },
          { name: 'Línea de Tiempo', href: null }
        ]} />
        <h1 className="text-4xl font-serif text-center text-[#1a5276] pt-4 pb-2">
          Línea de Tiempo Bíblica
        </h1>
        <p className="text-center text-[#5d4037] mb-8">
          Explora los eventos más importantes de la historia bíblica
        </p>

        <TimelineWrapper events={events} />

      </div>
    </div>
  );
}