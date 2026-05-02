import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface SummariseBody {
  userQuery: string;
  products: Array<{ name: string; brand: string; category: string; price: number; rating: number }>;
}

const SYSTEM = `You are a friendly shopping assistant. The user asked a question and the catalogue returned some products.
Write a SHORT, natural summary (1-3 sentences) of what was found — like a helpful shop assistant bringing items to the counter.
- Mention the number of items, key brands, and product types.
- Be conversational and warm, not robotic.
- Do NOT list every product. Summarise.
- If there are many results, highlight the variety.
- If few results, note what's available.
Examples of good responses:
- "I found 6 health and hygiene items — towels from Sea to Summit and Matador, plus toiletry bottles from Muji and Go Travel."
- "Here are 12 options across luggage and backpacks, with brands like Samsonite, Osprey, and Pacsafe ranging from $64 to $324."
- "I've pulled up 3 compact rain shells — all lightweight and packable, from $89 to $175."`;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ summary: "Here's what I found." });
  }

  let body: SummariseBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ summary: "Here's what I found." });
  }

  const { userQuery, products } = body;
  if (!products?.length) {
    return NextResponse.json({ summary: "Here's what I found." });
  }

  // Build a compact product list for the LLM
  const productList = products
    .slice(0, 20) // Cap to avoid token bloat
    .map(p => `${p.name} by ${p.brand} (${p.category}, $${p.price}, ${p.rating}★)`)
    .join("\n");

  const prompt = `The user asked: "${userQuery}"

${products.length} products matched. Here are ${Math.min(products.length, 20)} of them:
${productList}
${products.length > 20 ? `\n...and ${products.length - 20} more.` : ""}

Write a brief, friendly summary of what you found.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM }
    });

    const text = response.text?.trim();
    return NextResponse.json({ summary: text || "Here's what I found." });
  } catch {
    return NextResponse.json({ summary: "Here's what I found." });
  }
}
