import { Skeleton } from "@/components/ui/skeleton";
import { Barcode, Mic, Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import {
  getOptionPrice,
  getQuantityOptions,
  getUnitLabel,
  useKart,
} from "../context/KartContext";
import {
  parseDiscount,
  useDeliveryTiming,
  useDiscount,
  useProducts,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

/** Parse "ProductName|Short description" stored in product.name */
function parseProductName(raw: string): { name: string; description: string } {
  const idx = raw.indexOf("|");
  if (idx === -1) return { name: raw, description: "" };
  return {
    name: raw.slice(0, idx).trim(),
    description: raw.slice(idx + 1).trim(),
  };
}

function ProductImage({ imageId }: { imageId: string }) {
  const storageClient = useStorageClient();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId || !storageClient) return;
    storageClient
      .getDirectURL(imageId)
      .then(setUrl)
      .catch(() => setUrl(null));
  }, [imageId, storageClient]);

  if (!imageId || !url) {
    return (
      <div className="w-full aspect-square bg-secondary flex items-center justify-center">
        <span className="text-4xl">🥦</span>
      </div>
    );
  }
  return (
    <div className="w-full aspect-square bg-secondary overflow-hidden">
      <img src={url} alt="product" className="w-full h-full object-cover" />
    </div>
  );
}

function QuantityButtons({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
}) {
  const visible = options.slice(0, 3);
  return (
    <div className="flex gap-1">
      {visible.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`flex-1 text-[10px] font-bold py-1 rounded-md border transition-colors ${
            selected === opt
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-600 border-gray-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const options = getQuantityOptions(product.category);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const basePrice = Number(product.price);
  const unitLabel = getUnitLabel(product.category);
  const calculatedPrice = Number(getOptionPrice(product.price, selectedOption));
  const { name, description } = parseProductName(product.name);
  const inStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToKart(product, selectedOption);
    toast.success(`${name} added to kart!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col w-40 shrink-0">
      <div className="relative">
        <ProductImage imageId={product.imageId} />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold bg-red-500 px-2 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col gap-1.5 flex-1">
        <h3 className="font-display font-bold text-gray-800 text-xs leading-tight line-clamp-2">
          {name}
        </h3>
        {description && (
          <p className="text-[10px] text-gray-500 italic line-clamp-1">
            {description}
          </p>
        )}

        {/* Price per unit — red bold */}
        <p className="text-red-600 font-extrabold text-sm leading-none">
          ₹{basePrice}
          <span className="text-gray-500 font-bold text-[10px] ml-0.5">
            {unitLabel}
          </span>
        </p>

        {/* Inline quantity buttons */}
        <QuantityButtons
          options={options}
          selected={selectedOption}
          onSelect={setSelectedOption}
        />

        {/* Price for selected qty — green bold */}
        <p className="text-green-700 font-extrabold text-sm text-center leading-none">
          ₹{calculatedPrice}
        </p>

        {/* Add button */}
        <button
          type="button"
          data-ocid="shop.product.button"
          onClick={handleAdd}
          disabled={!inStock}
          className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: inStock ? "#1a5c2a" : "#9ca3af" }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { label: "Vegetables", emoji: "🥬", key: "vegetables" },
  { label: "Fruits", emoji: "🍎", key: "fruits" },
  { label: "Daily Use", emoji: "🥚", key: "daily" },
  { label: "Combo Packs", emoji: "🛒", key: "combo", badge: "Hot" },
  { label: "Offers", emoji: "⭐", key: "offers", badge: "Hot" },
  { label: "Organic", emoji: "🌿", key: "organic", badge: "New" },
];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();

  const discount = parseDiscount(discountRaw ?? "");

  const filtered = (products ?? []).filter((p: Product) => {
    const { name } = parseProductName(p.name);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="pb-4">
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-xs border border-gray-100">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            data-ocid="shop.search_input"
            type="text"
            placeholder="Search Vegetables & Fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            type="button"
            aria-label="Voice search"
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#1a5c2a" }}
          >
            <Mic className="w-4 h-4 text-white" />
          </button>
          <Barcode className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Category tiles */}
      <div className="px-3 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() =>
                setActiveCategory(cat.key === activeCategory ? "all" : cat.key)
              }
              className={`flex flex-col items-center gap-1 shrink-0 rounded-xl p-2 w-16 border-2 transition-colors relative ${
                activeCategory === cat.key
                  ? "border-green-700 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {cat.badge && (
                <span
                  className={`absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full ${
                    cat.badge === "New"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {cat.badge}
                </span>
              )}
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Info banners row */}
      <div className="px-3 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {deliveryTiming && (
            <div className="shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-xs border border-gray-100">
              <span className="text-sm">🚚</span>
              <span className="text-orange-600 text-xs font-bold whitespace-nowrap">
                {deliveryTiming}
              </span>
            </div>
          )}
          <div className="shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-xs border border-gray-100">
            <span className="text-sm">🚚</span>
            <span className="text-green-700 text-xs font-bold whitespace-nowrap">
              Free Delivery Above ₹99
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-xs border border-gray-100">
            <span className="text-sm">💰</span>
            <span className="text-yellow-600 text-xs font-bold whitespace-nowrap">
              No Hidden Charges
            </span>
          </div>
        </div>
      </div>

      {/* Discount banners */}
      {discount && discount.percentage > 0 && (
        <div className="mx-3 mb-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 text-yellow-600 shrink-0" />
          <span className="text-xs font-bold text-yellow-700">
            🎉 {discount.percentage}% OFF on orders above ₹
            {discount.minimumAmount}
          </span>
        </div>
      )}
      {discount && discount.flatAmount > 0 && (
        <div className="mx-3 mb-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 text-yellow-600 shrink-0" />
          <span className="text-xs font-bold text-yellow-700">
            🎉 ₹{discount.flatAmount} OFF on orders above ₹
            {discount.flatMinimum}
          </span>
        </div>
      )}

      {isLoading ? (
        <div data-ocid="shop.loading_state" className="px-3 py-4">
          <div className="flex gap-3 overflow-x-auto">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="w-40 shrink-0 bg-white rounded-xl overflow-hidden"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="p-2 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="shop.empty_state"
          className="flex flex-col items-center py-16 gap-3"
        >
          <span className="text-5xl">🛒</span>
          <p className="text-gray-500 font-medium text-sm">
            {search
              ? "No products match your search"
              : "No products available yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Today's Deals section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <h2 className="font-display font-bold text-gray-800 text-base">
                🔥 Today's Deals
              </h2>
              <button
                type="button"
                className="text-green-700 text-sm font-semibold"
              >
                See all ›
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-3 pb-1 scrollbar-hide">
              {filtered.slice(0, 8).map((product: Product, idx: number) => (
                <div
                  key={product.id.toString()}
                  data-ocid={`shop.product.item.${idx + 1}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Best Sellers Today section */}
          {filtered.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <h2 className="font-display font-bold text-gray-800 text-base">
                  ⭐ Best Sellers Today
                </h2>
                <button
                  type="button"
                  className="text-green-700 text-sm font-semibold"
                >
                  See all ›
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-3 pb-1 scrollbar-hide">
                {filtered
                  .slice(0)
                  .reverse()
                  .slice(0, 8)
                  .map((product: Product, idx: number) => (
                    <div
                      key={`bs-${product.id.toString()}`}
                      data-ocid={`shop.bestseller.item.${idx + 1}`}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="text-center py-4 px-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
