"use client";
import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

export default function ScriptExecutor({ htmlContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Sanitizar el HTML antes de insertarlo
    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        "div", "p", "h1", "h2", "h3", "h4", "ul", "li", "ol", "strong", "em",
        "a", "img", "table", "thead", "tbody", "tr", "th", "td", "pre", "code",
        "script", "span", "label", "input", "button", "br", "hr", "blockquote",
        "iframe", "audio", "source"
      ],
      ALLOWED_ATTR: [
        "href", "src", "alt", "class", "id", "style", "data-*", "type", "controls",
        "width", "height", "frameborder", "allowfullscreen", "name", "value",
        "disabled", "checked", "target", "rel"
      ],
    });

    containerRef.current.innerHTML = cleanHtml;

    // Ejecutar scripts después de insertar el HTML (solo los que permitimos)
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
    });
  }, [htmlContent]);

  return <div ref={containerRef} className="contenedor-blog" />;
}