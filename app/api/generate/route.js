import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body.prompt || "Genera contenido bíblico profundo.";
    const maxTokens = body.max_tokens || 8000;

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

    // Verificar si hay error en la respuesta de OpenRouter
    if (data.error) {
      console.error("OpenRouter error:", data.error);
      return NextResponse.json(
        { success: false, error: data.error.message || "Error de OpenRouter" },
        { status: 500 }
      );
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Respuesta vacía de OpenRouter");
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("Error en /api/generate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Responder a preflight requests (CORS)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}