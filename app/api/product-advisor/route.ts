import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AdvisorBody {
  product: string;
  searchContext: string;
  chatHistory?: Array<{ role: string; content: string }>;
  question: string | null;
}

const SYSTEM = `You are a knowledgeable, friendly shopping assistant inside a travel gear store. 
The customer is looking at a specific product. You know what they've been searching for and their previous conversation history.

Your job:
- If no question is asked, give an EXTREMELY brief (1-2 sentence) recommendation about whether this product is a good fit for their search and journey. Mention the product name and a key reason it fits.
- If a question is asked, answer it in just 1-2 sentences.
- Be warm and conversational, but extremely concise.
- Reference actual product features and the customer's context (e.g. where they are going).
- Keep it very SHORT. No long explanations.`;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ reply: "Great choice — this is a popular item." });
  }

  let body: AdvisorBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "Great choice — this is a popular item." });
  }

  const { product, searchContext, chatHistory, question } = body;

  const historyText = chatHistory
    ? chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
    : "No previous history.";

  const prompt = question
    ? `The customer is viewing this product:\n${product}\n\nTheir search context: ${searchContext}\n\nConversation History:\n${historyText}\n\nThey asked: "${question}"\n\nAnswer briefly.`
    : `The customer is viewing this product:\n${product}\n\nThey found it while searching for: ${searchContext}\n\nConversation History:\n${historyText}\n\nGive a brief recommendation — is this a good fit for what they're looking for based on their destination and needs?`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM }
    });

    const text = response.text?.trim();
    return NextResponse.json({ reply: text || "Great choice — this is a popular item." });
  } catch {
    return NextResponse.json({ reply: "Great choice — this is a popular item." });
  }
}
