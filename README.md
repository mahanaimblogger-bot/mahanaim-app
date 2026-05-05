# Mahanaim — Centro de Recursos Bíblicos

Plataforma de estudios bíblicos profundos por capítulo, con panel de administración, 
asistente de inteligencia artificial integrado y diseño elegante "Catedral".

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Estilos | Tailwind CSS + CSS personalizado (Paleta Catedral) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (solo panel admin) |
| IA | OpenRouter API (modelo configurable) |
| Despliegue | Vercel |

## 📁 Estructura del proyecto

mahanaim-app/
├── app/
│ ├── admin/ # Panel de administración protegido
│ │ ├── login/ # Login con Supabase Auth
│ │ ├── recursos/ # CRUD de recursos + asistente IA
│ │ │ ├── AsistenteModal.jsx # Componente del wizard de IA
│ │ │ └── nuevo/ # Página de creación de recursos
│ │ ├── libros/ # CRUD de libros
│ │ └── capitulos/ # CRUD de capítulos
│ ├── api/
│ │ └── generate/ # Endpoint interno que conecta con OpenRouter
│ ├── libro/ # Vista pública: capítulos de un libro
│ ├── recurso/ # Vista pública de un recurso individual
│ ├── estudios.css # Paleta Catedral y estilos de cajas
│ ├── globals.css # Fondo de pergamino y tipografía
│ └── page.js # Página principal con 66 libros
├── lib/
│ └── supabaseClient.js # Cliente de Supabase
├── public/ # Imágenes y recursos estáticos
├── .env.local # Variables de entorno (NO se sube a Git)
└── package.json


## 🔧 Configuración inicial

1. Clonar el repositorio:
```bash
git clone https://github.com/mahanaimblogger-bot/mahanaim-app.git
cd mahanaim-app

nstalar dependencias:
npm install

Crear archivo .env.local en la raíz con estas variables:
NEXT_PUBLIC_SUPABASE_URL=https://ngvfllkbdnmezikxxyzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qAFVH9JgX4Nl5PiW27NUwA_qSWqizeD
OPENROUTER_API_KEY=sk_live_...(buscar api q debe estar en google drive el archivo y de no conseguir en openrouter generar nueeva apikey).

Iniciar servidor de desarrollo:
npm run dev
Abrir http://localhost:3000.

🗄️ Base de datos (Supabase)
Tablas principales
Tabla	Descripción
books	66 libros de la Biblia con slug, nombre, nombre_original
chapters	Capítulos vinculados a books
resources	Recursos (estudios, cuestionarios, devocionales, etc.)
verses	Versículos RVR1960 (pendiente de poblar)
Columna modo en resources
'html': contenido HTML directo

'markdown': Markdown convertido a HTML con portada automática

Permisos
anon: SELECT en tablas públicas

authenticated: INSERT, UPDATE, DELETE en las tres tablas principales

🎨 Diseño "Paleta Catedral"
Fondo: pergamino con letras hebreas (imagen en body)

Colores: azul profundo #1a3a5c, dorado #d4ac0d, blanco cálido #fdfbf7

Tipografía: Georgia, Times New Roman, serif

Regla global: las páginas públicas NO llevan bg-[#fdfbf7] en el contenedor externo para que el pergamino se transparente en los laterales

📝 Panel de administración
URL: http://localhost:3000/admin

Login: usa credenciales de Supabase Auth

Libros: CRUD de los 66 libros

Capítulos: CRUD de capítulos por libro

Recursos: CRUD de recursos con formulario manual y asistente IA

🤖 Asistente de IA
El asistente se abre desde el botón "✨ Generar recurso con IA" en la página de nuevo recurso.

Tipos de recursos que genera
Tipo	Descripción	¿Usa IA?
🧩 Cuestionario	Test interactivo con puntuación	✅ Sí
👤 Ficha de Personaje	Biografía completa con 7 secciones	✅ Sí
📚 Glosario de Términos	Palabras clave con hebreo/griego	✅ Sí
✍️ Devocional	Reflexión, aplicación y oración	✅ Sí
🖨️ Hoja de Trabajo	Preguntas de comprensión y reflexión	✅ Sí
🧭 Plan de Lectura	Plan diario de lecturas	✅ Sí
Los recursos manuales (sermón, video, audio, etc.) se crean desde el formulario tradicional.

Arquitectura del asistente
El modal AsistenteModal.jsx captura libro, capítulo y tipo de recurso

Construye un prompt detallado y lo envía a /api/generate

El endpoint app/api/generate/route.js llama a OpenRouter

OpenRouter devuelve el JSON/HTML generado

El modal convierte el JSON a HTML formateado según el tipo de recurso

Se guarda directamente en Supabase

💰 OpenRouter — Configuración de la API
Modelo actual
openai/gpt-4o-mini (modelo de pago, excelente relación calidad/precio)

Costos aproximados
~$0.15 USD por millón de tokens de entrada

~$0.60 USD por millón de tokens de salida

Generar un recurso típico cuesta ~$0.00035 USD (menos de medio centavo)

Con $5 USD se pueden generar más de 14,000 recursos

Si se acaba el crédito
El asistente mostrará "Error al generar contenido" o "No se recibió respuesta."

Ir a openrouter.ai → Credits → Add Credits

Recargar saldo (mínimo 
1
U
S
D
,
r
e
c
o
m
e
n
d
a
d
o
1USD,recomendado5 USD)

No es necesario cambiar la API Key — la misma clave sigue funcionando

El asistente volverá a funcionar inmediatamente

Cambiar de modelo
Editar app/api/generate/route.js, línea del modelo:

js
model: "openai/gpt-4o-mini",  // cambiar por otro modelo si se desea
Modelos gratuitos alternativos (menor calidad):

google/gemini-2.0-flash-exp:free

meta-llama/llama-3.2-3b-instruct:free

📖 Prompt Maestro v5.4.3
Para estudios bíblicos profundos (Éxodo, Romanos, etc.) se usa el Prompt Maestro externamente (Claude, ChatGPT) y se pega el HTML resultante en el panel.

Ver documento completo del Prompt Maestro en el historial del proyecto.

🚢 Despliegue en Vercel
Conectar repositorio de GitHub a Vercel

Configurar variables de entorno:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

OPENROUTER_API_KEY

Deploy automático en cada push

🛠️ Solución de problemas
Problema	Causa probable	Solución
Error 404 en /libro/...	Servidor no reiniciado	Ctrl+C y npm run dev
"No se recibió respuesta."	API Key sin crédito	Recargar crédito en OpenRouter
JSON crudo en recurso	Limpieza de markdown falló	Volver a generar el recurso
Fondo de pergamino no visible	bg-[#fdfbf7] en contenedor externo	Quitar esa clase del div externo
Error de hidratación (Hydration)	Contenido HTML mal formado	Revisar contenido_html en Supabase
📋 Pendientes del proyecto
Poblar tabla verses con toda la Biblia RVR1960

Automatizar tooltips bíblicos en los estudios

Construir lector bíblico interactivo

Migrar contenido del proyecto antiguo

Agregar botones de compartir en recursos

Implementar sistema de Planes de Lectura con historial de usuario

Sección de Línea de Tiempo bíblica interactiva






