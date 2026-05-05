import raw from "../tripkit_catalogue_starter.json";
import type { Category, Product, ProductPageCopy, TravelStyle, TripStage, UseCaseTag } from "./types";
import { getProductImage } from "./product-images";

interface RawItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_aud: number;
  colour: string[];
  customer_review: { rating: number; review_count: number };
  short_description: string;
  features: string[];
  use_cases: string[];
  travel_style: string[];
  trip_stage: string[];
  url: string;
  product_page_copy: {
    overview: string;
    details: string;
    recommendation_context: string;
    specifications_summary: string;
  };
}

const items = raw as RawItem[];

// Synthesize a plausible addedDate so "newest" sort works. Items later in
// the catalogue array are treated as newer (3-day spacing back from today).
const newestEpoch = Date.parse("2026-04-15");
const dayMs = 24 * 60 * 60 * 1000;

export const PRODUCTS: Product[] = items.map((p, i) => {
  const addedEpoch = newestEpoch - (items.length - 1 - i) * 3 * dayMs;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category as Category,
    price: p.price_aud,
    rating: p.customer_review.rating,
    numReviews: p.customer_review.review_count,
    description: p.short_description,
    image: getProductImage(p.id),
    inStock: true,
    addedDate: new Date(addedEpoch).toISOString().slice(0, 10),
    colour: p.colour ?? [],
    features: p.features,
    travelStyle: p.travel_style as TravelStyle[],
    useCases: (p.use_cases ?? []) as UseCaseTag[],
    tripStage: (p.trip_stage ?? []) as TripStage[],
    amazonUrl: p.url ?? `https://www.amazon.com.au/dp/${p.id}`,
    productPageCopy: (p.product_page_copy ?? {
      overview: "",
      details: "",
      recommendation_context: "",
      specifications_summary: ""
    }) as ProductPageCopy
  };
});

export const ALL_CATEGORIES: Category[] = Array.from(new Set(items.map(p => p.category as Category))).sort();

export const ALL_TRAVEL_STYLES: TravelStyle[] = Array.from(new Set(items.flatMap(p => p.travel_style as TravelStyle[]))).sort();

export const ALL_USE_CASES: UseCaseTag[] = Array.from(new Set(items.flatMap(p => (p.use_cases ?? []) as UseCaseTag[]))).sort();

export const ALL_TRIP_STAGES: TripStage[] = Array.from(new Set(items.flatMap(p => (p.trip_stage ?? []) as TripStage[]))).sort();

export const ALL_BRANDS: string[] = Array.from(new Set(items.map(p => p.brand))).sort();

export const PRICE_BOUNDS = {
  min: Math.min(...items.map(p => p.price_aud)),
  max: Math.max(...items.map(p => p.price_aud))
};
