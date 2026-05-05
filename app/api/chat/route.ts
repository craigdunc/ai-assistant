import { GoogleGenAI, Type, FunctionCallingConfigMode } from "@google/genai";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { ALL_BRANDS, ALL_CATEGORIES, ALL_TRAVEL_STYLES, ALL_USE_CASES, ALL_TRIP_STAGES } from "@/lib/products";
import type { CatalogueState, ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

const CATALOGUE_BRIEF = readFileSync(join(process.cwd(), "lib", "catalogue-brief.md"), "utf8");

const SYSTEM_PROMPT = `You are TripKit's AI shopping assistant — an expert in travel gear who helps people prepare for trips by finding the right products.

The following brief gives you working knowledge of the catalogue — what's in stock, what isn't, and which products to recommend by name. Treat it as ground truth about the inventory.

<catalogue_brief>
${CATALOGUE_BRIEF}
</catalogue_brief>

You work inside a travel gear catalogue that has structured product metadata:
- Categories: ${ALL_CATEGORIES.join(", ")}
- Travel styles: ${ALL_TRAVEL_STYLES.join(", ")}
- Use cases: ${ALL_USE_CASES.join(", ")}
- Trip stages: ${ALL_TRIP_STAGES.join(", ")}
- Brands: ${ALL_BRANDS.join(", ")}
- Sort options: relevance, price-asc, price-desc, rating-desc, newest

IMPORTANT DESIGN PRINCIPLE:
The catalogue does NOT store destination-specific metadata. There is no "Japan" tag, no "Europe" tag, no destination_fit field. The intelligence sits in YOU, the LLM layer.

When a user mentions a destination and time of year, YOU must:
1. Infer likely activities and needs (e.g. city walking, public transport, sightseeing, temple visits)
2. Map those inferences to the catalogue's existing filter taxonomy
3. Explain your reasoning briefly in the reply so the user can see your interpretation

CRITICAL SEARCH RULE:
The 'query' field is an AND text-search across product names, descriptions, features, and tags. Every word you put in 'query' must literally appear in a product for it to survive. Use it carefully.

USE 'query' FOR:
- Specific product nouns or sub-types the user named: "tote", "messenger", "USB", "Gore-Tex", "memory foam", "compression"
- Destinations ONLY when the products themselves reference destinations (guidebooks contain country names; travel adapters list compatible countries)

DO NOT USE 'query' FOR:
- Destinations on general "I'm going to X" trip-planning queries that span multiple packing categories. Backpacks, packing cubes, toiletry bags, and document holders do NOT mention destinations in their text. Putting "France" or "Japan" in query will filter them all out.
- For these broad queries, let the destination inform which CATEGORIES, USE_CASES, and TRAVEL_STYLES you select — leave 'query' empty.

Examples:
- "I need USB chargers" → categories: ["Travel tech"], query: "USB" ✓
- "Show me tote bags" → categories: ["Bags"], query: "tote" ✓
- "I'm going to Japan, show me guidebooks" → categories: ["Books"], query: "Japan" ✓ (books contain "Japan")
- "Travel adapter for France" → categories: ["Travel tech"], query: "France" ✓ (adapters list countries)
- "I'm going to France for 2 days" → categories: ["Backpacks", "Travel tech", "Packing organisers", "Documents and money"], query: "" ✓ (destination informs categories, not text)
- "Packing essentials for Japan" → categories: [packing-relevant], query: "" ✓ (packing cubes don't mention Japan)

Your job has two parts on every turn:
1. Reply conversationally in 1-2 sentences — friendly, knowledgeable, and extremely concise. Explain WHY you chose the filters you did. Be very brief.
2. ALWAYS call set_catalogue_state with the FULL desired state. If you find exactly one perfect product for the user's request (or they ask for one by name), set openProductId to that product's ID to show them the details immediately.

Translation guidelines:
- Trip type → map to travel_style values (e.g. "backpacking" → Light packing, Carry-on; "family holiday" → Family travel)
- Activities → map to use_cases (e.g. "lots of walking" → Walking all day; "visiting museums" → Museums; "keeping devices charged" → Charging devices)
- Trip logistics → map to trip_stage (e.g. "long flight" → Flight; "need stuff for the hotel" → Hotel)
- Price words: "budget" / "cheap" → priceMax around 50-80; "premium" / "high-end" → priceMin around 200; "under $X" → priceMax X
- Quality words: "best" / "top rated" → minRating 4.5 OR sort "rating-desc"
- Search query: put specific product-type keywords in 'query' (e.g. "tote", "USB", "memory foam"). For destinations, follow the CRITICAL SEARCH RULE above — only put a destination in 'query' for guidebooks or travel adapters; for general trip-planning queries spanning multiple categories, leave 'query' empty and let the destination drive your category/use-case choices.
- If the user refines ("also add rain gear", "remove the bags"), modify the existing state incrementally — don't reset everything.
- If the user just chats ("thanks", "ok") or asks a meta question, leave state mostly unchanged and reply briefly.

SELF-CORRECTION:
The current number of matching products is provided in <result_count> tags. If result_count is 0 or very low (under 3), your filters are TOO RESTRICTIVE. You must:
1. Immediately loosen your filters — remove some use_cases or trip_stages that are less essential
2. Explain to the user: "Let me broaden the search — I was being too specific."
3. NEVER return a state that you know will produce 0 results. Prefer showing more products over showing none.
4. Start with fewer filters and add them incrementally based on user feedback.

The current state is provided in <current_state> tags in the user message — preserve fields the user did not ask to change.`;

const SET_CATALOGUE_STATE_DECL = {
  name: "set_catalogue_state",
  description:
    "Set the catalogue UI's full search/filter/sort state and provide a conversational reply. Always include every field — return current values for fields the user did not ask to change.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description: "EXTREMELY BRIEF, friendly, travel-knowledgeable reply to the user (1-2 sentences). Just explain your main reasoning."
      },
      query: {
        type: Type.STRING,
        description: "Search query string. Use for specific product keywords or sub-types (e.g. 'tote', 'messenger', 'jacket')."
      },
      categories: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ALL_CATEGORIES as unknown as string[] },
        description: "Selected category filters."
      },
      brands: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ALL_BRANDS },
        description: "Selected brand filters."
      },
      travelStyles: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ALL_TRAVEL_STYLES as unknown as string[] },
        description: "Selected travel style filters."
      },
      useCases: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ALL_USE_CASES as unknown as string[] },
        description: "Selected use case filters."
      },
      tripStages: {
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ALL_TRIP_STAGES as unknown as string[] },
        description: "Selected trip stage filters."
      },
      priceMin: {
        type: Type.NUMBER,
        nullable: true,
        description: "Minimum price in AUD, or null for no minimum."
      },
      priceMax: {
        type: Type.NUMBER,
        nullable: true,
        description: "Maximum price in AUD, or null for no maximum."
      },
      minRating: {
        type: Type.NUMBER,
        nullable: true,
        description: "Minimum star rating, e.g. 4.5, or null for any rating."
      },
      inStockOnly: {
        type: Type.BOOLEAN,
        description: "True to hide out-of-stock products."
      },
      sort: {
        type: Type.STRING,
        enum: ["relevance", "price-asc", "price-desc", "rating-desc", "newest"],
        description: "Sort order for results."
      },
      openProductId: {
        type: Type.STRING,
        nullable: true,
        description: "ID of a specific product to automatically open in the detail modal (e.g. if the user asks for a specific item or you find the perfect single match)."
      }
    },
    required: ["reply", "query", "categories", "brands", "travelStyles", "useCases", "tripStages", "priceMin", "priceMax", "minRating", "inStockOnly", "sort"]
  }
};

interface ChatRequestBody {
  messages: ChatMessage[];
  state: CatalogueState;
  resultCount?: number;
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, state, resultCount } = body;
  if (!Array.isArray(messages) || !state) {
    return NextResponse.json({ error: "messages[] and state are required" }, { status: 400 });
  }

  const firstUserIdx = messages.findIndex(m => m.role === "user");
  if (firstUserIdx === -1) {
    return NextResponse.json({ error: "No user message in history" }, { status: 400 });
  }
  const trimmed = messages.slice(firstUserIdx);

  // Gemini uses role "model" for assistant turns, and content goes inside parts[].
  const contents = trimmed.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  // Inject current state into the latest user message so the system instruction
  // stays stable across turns.
  const lastIdx = contents.length - 1;
  if (contents[lastIdx].role === "user") {
    const original = contents[lastIdx].parts[0].text;
    contents[lastIdx].parts[0].text = `<current_state>${JSON.stringify(state)}</current_state>\n<result_count>${resultCount ?? "unknown"}</result_count>\n\n${original}`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [SET_CATALOGUE_STATE_DECL] }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ["set_catalogue_state"]
          }
        }
      }
    });

    const fc = response.functionCalls?.find(c => c.name === "set_catalogue_state");
    if (!fc) {
      return NextResponse.json(
        { error: "Model did not return a set_catalogue_state function call." },
        { status: 502 }
      );
    }

    const input = (fc.args ?? {}) as Partial<CatalogueState> & { reply?: string; openProductId?: string | null };
    const newState: CatalogueState = {
      query: typeof input.query === "string" ? input.query : "",
      categories: Array.isArray(input.categories) ? (input.categories as CatalogueState["categories"]) : [],
      brands: Array.isArray(input.brands) ? input.brands : [],
      travelStyles: Array.isArray(input.travelStyles) ? (input.travelStyles as CatalogueState["travelStyles"]) : [],
      useCases: Array.isArray(input.useCases) ? (input.useCases as CatalogueState["useCases"]) : [],
      tripStages: Array.isArray(input.tripStages) ? (input.tripStages as CatalogueState["tripStages"]) : [],
      priceMin: typeof input.priceMin === "number" ? input.priceMin : null,
      priceMax: typeof input.priceMax === "number" ? input.priceMax : null,
      minRating: typeof input.minRating === "number" ? input.minRating : null,
      inStockOnly: !!input.inStockOnly,
      sort: (input.sort as CatalogueState["sort"]) ?? "relevance"
    };

    return NextResponse.json({
      reply: input.reply || "Updated the catalogue for you.",
      state: newState,
      openProductId: typeof input.openProductId === "string" ? input.openProductId : null
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
