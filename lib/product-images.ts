/**
 * Product image mapping.
 * 
 * Uses locally generated product images (in /products/) for product types
 * we have images for, and curated Unsplash URLs for the remainder.
 * 
 * The catalogue has 100 products across ~33 product types (3 variants each).
 * Each product type maps to a specific image so all variants of the same
 * product look consistent.
 */

// Map each product type (by base concept) to an image path.
// Products repeat in groups of 33 (tk-001..033, tk-034..066, tk-067..099, tk-100).
const TYPE_IMAGES: Record<string, string> = {
  // ── Luggage ──────────────────────────────────────────
  "carry-on-spinner":    "/products/suitcase-carryon.png",
  "checked-suitcase":    "/products/suitcase-checked.png",
  "foldable-duffel":     "/products/duffel-bag.png",

  // ── Backpacks ────────────────────────────────────────
  "travel-backpack":     "/products/travel-backpack.png",
  "packable-daypack":    "/products/packable-daypack.png",
  "antitheft-backpack":  "/products/antitheft-backpack.png",

  // ── Packing organisers ───────────────────────────────
  "packing-cubes":       "/products/packing-cubes.png",
  "toiletry-organiser":  "/products/toiletry-organiser.png",
  "cable-organiser":     "/products/cable-organiser.png",

  // ── Travel tech ──────────────────────────────────────
  "power-bank":          "/products/power-bank.png",
  "travel-adapter":      "/products/travel-adapter.png",
  "headphones":          "/products/headphones.png",

  // ── In-flight comfort ────────────────────────────────
  "neck-pillow":         "/products/neck-pillow.png",
  "sleep-mask":          "/products/sleep-mask.png",
  "flight-socks":        "/products/flight-socks.png",

  // ── Weather gear ─────────────────────────────────────
  "travel-umbrella":     "/products/travel-umbrella.png",
  "rain-shell":          "/products/rain-shell.png",
  "rain-cover":          "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=400&fit=crop",

  // ── Clothing ─────────────────────────────────────────
  "insulated-jacket":    "https://images.unsplash.com/photo-1544923246-77307dd270b5?w=400&h=400&fit=crop",
  "merino-top":          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  "walking-shoes":       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",

  // ── Bags ─────────────────────────────────────────────
  "crossbody-bag":       "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&h=400&fit=crop",
  "belt-bag":            "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=400&fit=crop",
  "shopping-tote":       "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",

  // ── Health and hygiene ───────────────────────────────
  "travel-towel":        "https://images.unsplash.com/photo-1585412459212-4f66e0db2ce9?w=400&h=400&fit=crop",
  "laundry-sheets":      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop",
  "toiletry-bottles":    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",

  // ── Security ─────────────────────────────────────────
  "luggage-tracker":     "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=400&h=400&fit=crop",
  "tsa-lock":            "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",

  // ── Documents and money ──────────────────────────────
  "transit-wallet":      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
  "passport-organiser":  "https://images.unsplash.com/photo-1553531384-411a247ccd73?w=400&h=400&fit=crop",

  // ── Road trip ────────────────────────────────────────
  "seatback-organiser":  "https://images.unsplash.com/photo-1581553680321-4fffff48f2db?w=400&h=400&fit=crop",
  "car-charger":         "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
};

/**
 * Map product ID to its product type key.
 * The catalogue repeats in groups of 33: positions 1-33 map to the same
 * product types as 34-66 and 67-99 (tk-100 is an extra carry-on).
 */
const PRODUCT_TYPE_ORDER: string[] = [
  "carry-on-spinner",     // x01
  "checked-suitcase",     // x02
  "foldable-duffel",      // x03
  "travel-backpack",      // x04
  "packable-daypack",     // x05
  "antitheft-backpack",   // x06
  "packing-cubes",        // x07
  "toiletry-organiser",   // x08
  "cable-organiser",      // x09
  "power-bank",           // x10
  "travel-adapter",       // x11
  "headphones",           // x12
  "neck-pillow",          // x13
  "sleep-mask",           // x14
  "flight-socks",         // x15
  "travel-umbrella",      // x16
  "rain-shell",           // x17
  "rain-cover",           // x18
  "insulated-jacket",     // x19
  "merino-top",           // x20
  "walking-shoes",        // x21
  "crossbody-bag",        // x22
  "belt-bag",             // x23
  "shopping-tote",        // x24
  "travel-towel",         // x25
  "laundry-sheets",       // x26
  "toiletry-bottles",     // x27
  "luggage-tracker",      // x28
  "tsa-lock",             // x29
  "transit-wallet",       // x30
  "passport-organiser",   // x31
  "seatback-organiser",   // x32
  "car-charger",          // x33
];

function getTypeForId(id: string): string {
  // Extract numeric part: "tk-042" → 42
  const num = parseInt(id.replace("tk-", ""), 10);
  if (num === 100) return "carry-on-spinner"; // tk-100 is an extra carry-on
  const idx = (num - 1) % 33;
  return PRODUCT_TYPE_ORDER[idx] ?? "carry-on-spinner";
}

/**
 * Get a relevant product image URL for a given product ID.
 * With the expanded catalogue, images are stored as /products/[id].jpg
 */
export function getProductImage(id: string): string {
  // If it's one of our original placeholder IDs (tk-XXX), we might still have those.
  // But for the new Amazon items, they are ASINs.
  return `/products/${id}.jpg`;
}

