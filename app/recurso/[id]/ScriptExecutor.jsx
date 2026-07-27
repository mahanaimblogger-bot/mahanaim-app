"use client";
import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

export default function ScriptExecutor({ htmlContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !htmlContent) return;

    // 1. Extraer los <script> ANTES de sanitizar (DOMPurify siempre elimina su contenido)
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const scriptsExtraidos = [];
    let match;
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      scriptsExtraidos.push(match[1]);
    }
    const htmlSinScripts = htmlContent.replace(scriptRegex, '');

    // 2. Sanitizar el resto del HTML normalmente (sin scripts)
    const cleanHtml = DOMPurify.sanitize(htmlSinScripts, {
      ALLOWED_TAGS: [
        "div", "p", "h1", "h2", "h3", "h4", "ul", "li", "ol", "strong", "em",
        "a", "img", "table", "thead", "tbody", "tr", "th", "td", "pre", "code",
        "span", "label", "input", "button", "br", "hr", "blockquote",
        "iframe", "audio", "source"
      ],
      ALLOWED_ATTR: [
        "href", "src", "alt", "class", "id", "style", "data-*", "type", "controls",
        "width", "height", "frameborder", "allowfullscreen", "name", "value",
        "disabled", "checked", "target", "rel"
      ],
    });

    containerRef.current.innerHTML = cleanHtml;

    // 3. Ejecutar los scripts extraídos manualmente (nunca pasan por DOMPurify)
    scriptsExtraidos.forEach((scriptContent) => {
      const newScript = document.createElement("script");
      newScript.textContent = scriptContent;
      document.body.appendChild(newScript);
    });
  }, [htmlContent]);

  return <div ref={containerRef} className="contenedor-blog" />;
}