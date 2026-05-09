// app/linea-tiempo/page.js
import { createClient } from '@supabase/supabase-js';
import TimelineManual from './TimelineManual';
import TimelineControls from './TimelineControls';

const supabaseUrl = 'https://ngvfllkbdnmezikxxyzd.supabase.co';
const supabaseAnonKey = 'sb_publishable_qAFVH9JgX4Nl5PiW27NUwA_qSWqizeD';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTimelineEvents() {
  const { data, error } = await supabase.from('timeline_events').select('*').order('start_year');
  if (error) return [];
  return data || [];
}

export default async function TimelinePage() {
  const events = await getTimelineEvents();

  return (
    <div className="w-full min-h-screen bg-warm-white">
      <h1 className="text-4xl font-serif text-center text-deep-blue pt-8 pb-4">
        Línea de Tiempo Bíblica
      </h1>
      <TimelineControls />
      <TimelineManual events={events} />
    </div>
  );
}