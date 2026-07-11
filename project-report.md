# Reporte del proyecto Mahanaim

Generado el: 11/7/2026, 04:37:05

## Información de Git
- Rama actual: fase8-despliegue
- Último commit: 801ec80 - Ajuste: enlaces abren WikiModal en lugar de Wikipedia (Joseito, 3 weeks ago)

## Dependencias principales (package.json)
- Next.js: 16.2.4
- React: 19.2.4
- Supabase: ^2.105.1
- Otras: dompurify, marked, react-dom, resend, vis-timeline

## Archivos clave (contenido)

### next.config.mjs
```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ngvfllkbdnmezikxxyzd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    imgOptTimeoutInSeconds: 30,
  },
};

export default nextConfig;
```

### package.json
```json
{
  "name": "mahanaim-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.105.1",
    "dompurify": "^3.4.3",
    "marked": "^18.0.2",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "resend": "^6.12.3",
    "vis-timeline": "^8.5.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}

```

### Otros archivos (75 archivos)

- .env.local (537 caracteres)
- app\admin\capitulos\nuevo\page.js (6239 caracteres)
- app\admin\capitulos\page.js (7483 caracteres)
- app\admin\capitulos\[id]\page.js (6952 caracteres)
- app\admin\libros\nuevo\page.js (8666 caracteres)
- app\admin\libros\page.js (6311 caracteres)
- app\admin\libros\[id]\page.js (9626 caracteres)
- app\admin\login\page.js (3291 caracteres)
- app\admin\page.js (4035 caracteres)
- app\admin\personajes\page.js (5406 caracteres)
- app\admin\recursos\AsistenteModal.jsx (64146 caracteres)
- app\admin\recursos\nuevo\page.js (13603 caracteres)
- app\admin\recursos\page.js (9635 caracteres)
- app\admin\recursos\[id]\page.js (17814 caracteres)
- app\api\bible-chapter\route.js (1670 caracteres)
- app\api\bible-verse\route.js (1459 caracteres)
- app\api\chapter-text\route.js (1126 caracteres)
- app\api\contact\route.js (1455 caracteres)
- app\api\create-character\route.js (7763 caracteres)
- app\api\detect-characters\route.js (1637 caracteres)
- app\api\generate\route.js (2110 caracteres)
- app\api\persons\check\route.js (768 caracteres)
- app\BookCard.jsx (1062 caracteres)
- app\componentes\AudioPlayer.jsx (4721 caracteres)
- app\componentes\Breadcrumb.jsx (1274 caracteres)
- app\componentes\Header.jsx (659 caracteres)
- app\componentes\MainWrapper.jsx (323 caracteres)
- app\componentes\Navegacion.jsx (1348 caracteres)
- app\componentes\PageBackground.jsx (783 caracteres)
- app\componentes\ShareButtons.jsx (2193 caracteres)
- app\contacto\page.js (7109 caracteres)
- app\estudios.css (17703 caracteres)
- app\globals.css (3165 caracteres)
- app\layout.js (1604 caracteres)
- app\lector\layout.js (152 caracteres)
- app\lector\page.js (1334 caracteres)
- app\lector\[slug]\page.js (2000 caracteres)
- app\lector\[slug]\[chapter]\page.js (12674 caracteres)
- app\libro\[slug]\capitulo\[numero]\CharacterDetector.jsx (5216 caracteres)
- app\libro\[slug]\capitulo\[numero]\loading.js (1733 caracteres)
- app\libro\[slug]\capitulo\[numero]\page.js (5881 caracteres)
- app\libro\[slug]\loading.js (1493 caracteres)
- app\libro\[slug]\page.js (5948 caracteres)
- app\linea-tiempo\EventoCard.jsx (6965 caracteres)
- app\linea-tiempo\layout.js (227 caracteres)
- app\linea-tiempo\page.js (1310 caracteres)
- app\linea-tiempo\timeline.css (1082 caracteres)
- app\linea-tiempo\TimelineAvanzado.jsx (21899 caracteres)
- app\linea-tiempo\TimelineComponent.jsx (6995 caracteres)
- app\linea-tiempo\TimelineControls.jsx (979 caracteres)
- app\linea-tiempo\TimelineManual.jsx (10466 caracteres)
- app\linea-tiempo\TimelineMobile.jsx (5522 caracteres)
- app\linea-tiempo\TimelineProfesional.jsx (2680 caracteres)
- app\linea-tiempo\TimelineWrapper.jsx (1283 caracteres)
- app\linea-tiempo\WikiModal.jsx (5222 caracteres)
- app\page.js (1130 caracteres)
- app\personaje\layout.js (256 caracteres)
- app\personaje\[slug]\page.js (1549 caracteres)
- app\recurso\[id]\page.js (9729 caracteres)
- app\recurso\[id]\ScriptExecutor.jsx (1419 caracteres)
- app\recursos-biblicos\loading.js (1497 caracteres)
- app\recursos-biblicos\page.js (3712 caracteres)
- app\robots.js (241 caracteres)
- app\sitemap.js (1241 caracteres)
- generate-report.js (4185 caracteres)
- hooks\useIsMobile.js (388 caracteres)
- jsconfig.json (73 caracteres)
- lib\supabaseClient.js (253 caracteres)
- lib\tiposRecursos.js (2620 caracteres)
- package-lock.json (70531 caracteres)
- postcss.config.mjs (94 caracteres)
- README.md (6572 caracteres)
- scripts\rvr1960_completa.json (6389889 caracteres)
- scripts\uploadBibleFinal.js (3757 caracteres)
- scripts\uploadEvangelios.js (3348 caracteres)

