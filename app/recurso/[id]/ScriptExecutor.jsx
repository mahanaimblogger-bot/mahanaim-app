"use client";
import { useEffect, useRef } from "react";

export default function ScriptExecutor({ htmlContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
    });
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className="contenedor-blog"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}