import type { Product } from "@/lib/types";

interface Props {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col overflow-hidden group"
    >
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <div className="text-[11px] text-gray-500">{product.brand}</div>
        <div className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem] text-blue-700 hover:text-amber-700 transition-colors">
          {product.name}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <Stars value={product.rating} />
          <span className="text-gray-400">({formatNum(product.numReviews)})</span>
        </div>

        <div className="mt-auto pt-1 text-lg font-bold">${product.price.toFixed(0)} <span className="text-xs font-normal text-gray-500">AUD</span></div>
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span aria-label={`${value} out of 5 stars`} className="text-amber-500 text-xs">
      {"★★★★★".slice(0, full)}
      <span className="text-gray-300">{"★★★★★".slice(full)}</span>
      <span className="text-gray-700 ml-0.5">{value.toFixed(1)}</span>
    </span>
  );
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
