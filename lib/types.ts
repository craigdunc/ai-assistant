export type Category =
  | "Luggage"
  | "Backpacks"
  | "Packing organisers"
  | "Travel tech"
  | "In-flight comfort"
  | "Health and hygiene"
  | "Security"
  | "Documents and money"
  | "Books";

export type TravelStyle =
  | "Carry-on"
  | "Light packing"
  | "Urban travel"
  | "Checked luggage"
  | "Family travel"
  | "Long-haul"
  | "Road trip";

// Climate type removed as per user request


export type UseCaseTag =
  | "Packing efficiency"
  | "Transit"
  | "Shopping overflow"
  | "Laundry"
  | "Walking all day"
  | "Charging devices"
  | "City sightseeing"
  | "Security"
  | "Museums"
  | "Organising clothes"
  | "Health and hygiene"
  | "Organising essentials"
  | "In-flight comfort"
  | "Sleeping"
  | "Entertainment"
  | "Rain protection"
  | "Layering"
  | "Outdoor sightseeing"
  | "Theatre"
  | "Theme parks"
  | "Peace of mind"
  | "Organising money"
  | "Organising documents"
  | "Car travel"
  | "Travelling with kids";

export type TripStage =
  | "Airport"
  | "Packing"
  | "Hotel"
  | "Daily carry"
  | "Transit"
  | "Sightseeing"
  | "Flight";

export type SortKey =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest";

export interface ProductPageCopy {
  overview: string;
  details: string;
  recommendation_context: string;
  specifications_summary: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  rating: number;
  numReviews: number;
  description: string;
  image: string;
  inStock: boolean;
  addedDate: string;
  colour: string[];
  features: string[];
  travelStyle: TravelStyle[];
  useCases: UseCaseTag[];
  tripStage: TripStage[];
  amazonUrl: string;
  productPageCopy: ProductPageCopy;
}

export interface CatalogueState {
  query: string;
  categories: Category[];
  brands: string[];
  travelStyles: TravelStyle[];
  useCases: UseCaseTag[];
  tripStages: TripStage[];
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_STATE: CatalogueState = {
  query: "",
  categories: [],
  brands: [],
  travelStyles: [],
  useCases: [],
  tripStages: [],
  priceMin: null,
  priceMax: null,
  minRating: null,
  inStockOnly: false,
  sort: "relevance"
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
