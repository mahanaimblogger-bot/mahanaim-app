import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "Genera contenido bíblico profundo.";
    const maxTokens = body.max_tokens || 8000;

    // Validación básica
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ Error: OPENROUTER_API_KEY no está configurada en .env.local");
      return NextResponse.json(
        { success: false, error: "API key de OpenRouter no configurada" },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    // Verificar si la respuesta tiene error (p.ej., créditos insuficientes)
    if (data.error) {
      console.error("❌ Error de OpenRouter:", data.error);
      return NextResponse.json(
        { success: false, error: data.error.message || "Error de OpenRouter" },
        { status: 500 }
      );
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      console.error("❌ Respuesta vacía de OpenRouter");
      return NextResponse.json(
        { success: false, error: "No se recibió contenido de la IA" },
        { status: 500 }
      );
    }

    // Éxito: devolvemos el texto generado
    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("❌ Error interno en /api/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Opcional: responder a preflight requests (para CORS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}