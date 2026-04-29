import { supabase } from '@/lib/supabaseClient';
import BookCard from './BookCard';

const secciones = {
  "Pentateuco": ["Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio"],
  "Libros Históricos": ["Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester"],
  "Libros Poéticos y Sapienciales": ["Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares"],
  "Profetas Mayores": ["Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel"],
  "Profetas Menores": ["Oseas", "Joel", "Amós", "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías"],
  "Evangelios": ["Mateo", "Marcos", "Lucas", "Juan"],
  "Historia de la Iglesia Primitiva": ["Hechos"],
  "Epístolas Paulinas": ["Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón"],
  "Epístolas Generales": ["Hebreos", "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan", "3 Juan", "Judas"],
  "Literatura Apocalíptica": ["Apocalipsis"]
};

const nombresHebreos = {
  "Génesis":"בראשית","Éxodo":"שמות","Levítico":"ויקרא","Números":"במדבר","Deuteronomio":"דברים",
  "Josué":"יהושע","Jueces":"שופטים","Rut":"רות","1 Samuel":"שמואל א","2 Samuel":"שמואל ב",
  "1 Reyes":"מלכים א","2 Reyes":"מלכים ב","1 Crónicas":"דברי הימים א","2 Crónicas":"דברי הימים ב",
  "Esdras":"עזרא","Nehemías":"נחמיה","Ester":"אסתר","Job":"איוב","Salmos":"תהילים",
  "Proverbios":"משלי","Eclesiastés":"קהלת","Cantares":"שיר השירים","Isaías":"ישעיהו",
  "Jeremías":"ירמיהו","Lamentaciones":"איכה","Ezequiel":"יחזקאל","Daniel":"דניאל",
  "Oseas":"הושע","Joel":"יואל","Amós":"עמוס","Abdías":"עובדיה","Jonás":"יונה",
  "Miqueas":"מיכה","Nahúm":"נחום","Habacuc":"חבקוק","Sofonías":"צפניה","Hageo":"חגי",
  "Zacarías":"זכריה","Malaquías":"מלאכי","Mateo":"מתתיהו","Marcos":"מרקוס","Lucas":"לוקס",
  "Juan":"יוחנן","Hechos":"מעשי השליחים","Romanos":"רומים","1 Corintios":"קורינתים א",
  "2 Corintios":"קורינתים ב","Gálatas":"גלטיא","Efesios":"אפסים","Filipenses":"פיליפים",
  "Colosenses":"קולוסיאים","1 Tesalonicenses":"תסלוניקים א","2 Tesalonicenses":"תסלוניקים ב",
  "1 Timoteo":"טימותיאוס א","2 Timoteo":"טימותיאוס ב","Tito":"טיטוס","Filemón":"פילמון",
  "Hebreos":"עברים","Santiago":"יעקב","1 Pedro":"כיפא א","2 Pedro":"כיפא ב",
  "1 Juan":"יוחנן א","2 Juan":"יוחנן ב","3 Juan":"יוחנן ג","Judas":"יהודה","Apocalipsis":"חזון יוחנן"
};

export default async function Home() {
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('orden', { ascending: true });

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: '#fdfbf7',
        backgroundImage: 'url("https://blogger.googleusercontent.com/img/a/AVvXsEh8_05dG7sOWU0iLgSFju4bHHCBSfEwjnGYu9TqTqYqGmj1eL8je-oh1lSVwMle4GW1fxTOgY59unrm2t-vgIyT0lA8uZLwiqKzuZ6DUc_rlWkHok-Ayw5Ov-f5vQ1Q_qHv1pJ68lzXCxf-mhhUIlaOc-WKivI-rp9bTwQlsW7BUic6578UGPWupnRwn_s=s1600")',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
      }}
    >
      {/* Logo superior */}
      <div className="max-w-[922px] mx-auto">
        <img 
          src="https://blogger.googleusercontent.com/img/a/AVvXsEjiOoSuMMmUakxLDOSNtXiJtzYe8BhR8Yy9g6mE6bTsEJNFru_n7E6fri7_VB-zarxqQmLZOUo3g4llrx7ZIqz-6uj8T58YgxDzZ4ZLqfME_Y4zXisuLhDEhgIDKKe3e3eaDQ5avWmncc0cx5cMfsxwiXu3bgsPrCvBGLOMynNacdX1YOTGPNJG7TOmIx0=s576" 
          alt="Mahanaim - Campamento de Dios" 
          className="w-full h-auto block"
        />
      </div>

      {/* Barra de navegación */}
      <nav className="bg-[#8d6e63] py-2 px-5 flex items-center justify-between shadow-md max-w-[922px] mx-auto">
        <a href="https://mahanaimcampamentodivino.blogspot.com" 
           className="text-[#efebe9] text-sm font-medium hover:text-white transition px-3 py-1 rounded hover:bg-white/10"
           style={{ fontFamily: 'Georgia, serif' }}>
          ← Volver al Inicio
        </a>
        <span className="text-lg text-[#d4ac0d] font-bold" style={{ fontFamily: 'Georgia, serif' }}>
          Mahanaim
        </span>
      </nav>

      {/* Contenedor principal (fondo blanco) */}
      <div className="max-w-[922px] mx-auto px-0 pb-10">
        <div className="bg-[#fdfbf7] border border-[#d4c4a8] p-5">
          
          {/* Banner (ahora dentro del contenedor blanco) */}
          <div className="text-center mb-6">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1470&auto=format&fit=crop" 
              alt="Biblioteca Antigua y Escrituras" 
              className="w-full h-auto rounded-lg border-4 border-[#5d4037] shadow-lg"
            />
            <h1 className="text-2xl sm:text-4xl text-center text-[#1b5e20] uppercase tracking-wider my-2" 
              style={{ fontFamily: 'Georgia, serif' }}>
              Centro de Recursos Bíblicos
            </h1>
            <p className="text-[#5d4037] italic text-center">
              Estudios, sermones, videos y materiales para enseñar
            </p>
          </div>

          {/* Breadcrumb */}
          <div className="bg-white border border-[#d4c4a8] rounded px-4 py-2 mb-5 text-sm">
            <span className="text-[#8d6e63]">Recursos Bíblicos</span>
          </div>

          {/* Secciones bíblicas */}
          <div className="flex flex-col gap-12">
            {Object.keys(secciones).map((seccion) => (
              <div key={seccion} 
                className="bg-white border-l-[6px] border-[#8d6e63] rounded-lg p-4 shadow-sm">
                <h2 className="text-[#bf360c] text-xl font-bold border-b border-gray-200 pb-1 mb-4">
                  {seccion}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {secciones[seccion].map((libroNombre) => {
                    const libroData = books ? books.find(b => b.nombre === libroNombre) : null;
                    const hebreo = nombresHebreos[libroNombre] || '';
                    const isAvailable = !!libroData;

                    return (
                      <BookCard
                        key={libroNombre}
                        libroNombre={libroNombre}
                        hebreo={hebreo}
                        capitulos={libroData ? libroData.capitulos : null}
                        isAvailable={isAvailable}
                        slug={libroData ? libroData.slug : ''}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (contenedor secundario sin espacio) */}
        <div className="bg-[#fdfbf7] border border-t-0 border-[#d4c4a8] p-0">
          <footer className="text-center py-5 text-[13px] text-[#8d6e63] border-t border-[#d4c4a8] mx-5"
            style={{ fontFamily: 'Georgia, serif' }}>
            © Mahanaim "Campamento de Dios" — <a href="https://mahanaimcampamentodivino.blogspot.com" className="text-[#5d4037] hover:text-[#bf360c]">Inicio del Blog</a>
          </footer>
        </div>
      </div>
    </div>
  );
}