import type { CatalogueState, Product } from "./types";

export function applyState(products: Product[], state: CatalogueState): Product[] {
  const q = state.query.trim().toLowerCase();
  const out = products.filter(p => {
    if (state.inStockOnly && !p.inStock) return false;
    if (state.categories.length && !state.categories.includes(p.category)) return false;
    if (state.brands.length && !state.brands.includes(p.brand)) return false;
    if (state.priceMin != null && p.price < state.priceMin) return false;
    if (state.priceMax != null && p.price > state.priceMax) return false;
    if (state.minRating != null && p.rating < state.minRating) return false;
    if (state.travelStyles.length && !state.travelStyles.some(s => p.travelStyle.includes(s))) return false;
    if (state.useCases.length && !state.useCases.some(u => p.useCases.includes(u))) return false;
    if (state.tripStages.length && !state.tripStages.some(t => p.tripStage.includes(t))) return false;
    if (q) {
      const hay = `${p.name} ${p.brand} ${p.category} ${p.description} ${p.features.join(" ")} ${p.travelStyle.join(" ")} ${p.useCases.join(" ")} ${p.tripStage.join(" ")}`.toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      if (!tokens.every(t => hay.includes(t))) return false;
    }
    return true;
  });

  switch (state.sort) {
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      out.sort((a, b) => b.rating - a.rating || b.numReviews - a.numReviews);
      break;
    case "newest":
      out.sort((a, b) => b.addedDate.localeCompare(a.addedDate));
      break;
    case "relevance":
    default:
      if (q) {
        const tokens = q.split(/\s+/).filter(Boolean);
        out.sort((a, b) => relScore(b, tokens) - relScore(a, tokens));
      } else {
        out.sort((a, b) => b.rating * Math.log10(b.numReviews + 1) - a.rating * Math.log10(a.numReviews + 1));
      }
  }
  return out;
}

function relScore(p: Product, tokens: string[]): number {
  const name = p.name.toLowerCase();
  const desc = p.description.toLowerCase();
  const useCases = p.useCases.join(" ").toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (name.includes(t)) score += 5;
    if (desc.includes(t)) score += 1;
    if (useCases.includes(t)) score += 3;
  }
  return score + p.rating;
}
