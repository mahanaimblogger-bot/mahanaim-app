// app/api/detect-characters/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: 'Falta el texto' }, { status: 400 });

  const prompt = `
    Analiza el siguiente texto bíblico (capítulo completo en español, Reina Valera 1960).
    Extrae todos los nombres de **personajes humanos, ángeles o seres divinos** (incluyendo Dios, Jesús, Espíritu Santo, pero NO lugares, NO conceptos teológicos, NO animales).
    Devuelve **solo un array JSON** con los nombres únicos en español, sin números, sin descripciones.
    Ejemplo: ["Abraham", "Dios", "Moisés", "Faraón", "David", "Satanás", "Ángel"].

    Texto: ${text.slice(0, 5000)}
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '[]';
    content = content.replace(/```json|```/g, '').trim();
    const characters = JSON.parse(content);
    return NextResponse.json({ characters: Array.isArray(characters) ? characters : [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}