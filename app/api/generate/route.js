import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
    const text = data.choices?.[0]?.message?.content || "No se recibió respuesta.";

    return new NextResponse(JSON.stringify({ success: true, text }), {
      headers: corsHeaders,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Error al generar contenido" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}