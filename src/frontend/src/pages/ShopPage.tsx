import { Skeleton } from "@/components/ui/skeleton";
import { Barcode, Mic, Plus, Search, Tag, Truck } from "lucide-react";
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
      <div className="w-full aspect-square bg-green-50 flex items-center justify-center">
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
  tiny,
}: {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
  tiny?: boolean;
}) {
  const visible = options.slice(0, 3);
  return (
    <div className="flex gap-1">
      {visible.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`flex-1 ${
            tiny ? "text-[8px]" : "text-[10px]"
          } font-bold py-1 px-0.5 rounded-lg border transition-colors ${
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

/** compact = normal row card (w-44), tiny = first row small card (3 visible at once) */
function ProductCard({
  product,
  compact,
  tiny,
}: { product: Product; compact?: boolean; tiny?: boolean }) {
  const { addToKart } = useKart();

  const unitType = product.unitType || (product as any).category || "kg";
  const options = getQuantityOptions(unitType);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const basePrice = Number(product.price);
  const unitLabel = getUnitLabel(unitType);
  const calculatedPrice = Number(getOptionPrice(product.price, selectedOption));
  const name = product.name || "";
  const inStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToKart(product, selectedOption);
    toast.success(`${name} added to kart!`);
  };

  // tiny = small cards, 3 visible at once in first row
  const widthClass = tiny
    ? "w-[29vw] min-w-[100px] max-w-[120px] shrink-0"
    : compact
      ? "w-44 shrink-0"
      : "";

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 ${widthClass}`}
    >
      {/* Product image */}
      <div className="relative rounded-t-xl overflow-hidden">
        <ProductImage imageId={product.imageId} />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold bg-red-500 px-1.5 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className={`${tiny ? "p-1.5" : "p-2"} flex flex-col gap-1 flex-1`}>
        {/* Product name */}
        <h3
          className={`font-bold text-gray-800 ${tiny ? "text-[9px]" : "text-xs"} leading-tight text-center line-clamp-2`}
        >
          {name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-0.5 justify-center">
          <span
            className={`text-red-600 font-black ${tiny ? "text-base" : "text-xl"} leading-none`}
          >
            ₹{basePrice}
          </span>
          <span
            className={`text-gray-600 ${tiny ? "text-[9px]" : "text-xs"} font-semibold`}
          >
            {unitLabel}
          </span>
        </div>

        {/* Quantity buttons */}
        <QuantityButtons
          options={options}
          selected={selectedOption}
          onSelect={setSelectedOption}
          tiny={tiny}
        />

        {/* Bottom row: calculated price + Add button */}
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={`text-red-500 font-black ${tiny ? "text-sm" : "text-base"} leading-none shrink-0`}
          >
            ₹{calculatedPrice}
          </span>
          <button
            type="button"
            data-ocid="shop.product.button"
            onClick={handleAdd}
            disabled={!inStock}
            className={`flex-1 bg-green-700 text-white font-bold ${tiny ? "text-[10px] py-1 px-1" : "text-sm py-1.5 px-3"} rounded-lg flex items-center justify-center gap-0.5 disabled:opacity-50 disabled:bg-gray-400 transition-colors`}
          >
            <Plus className={tiny ? "w-3 h-3" : "w-3.5 h-3.5"} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  {
    label: "Vegetables",
    img: "/assets/generated/category-vegetables.dim_300x200.jpg",
    key: "vegetables",
  },
  {
    label: "Fruits",
    img: "/assets/generated/category-fruits.dim_300x200.jpg",
    key: "fruits",
  },
  {
    label: "Leafy Veg",
    img: "/assets/generated/category-leafy.dim_300x200.jpg",
    key: "leafy",
  },
  {
    label: "Root Veg",
    img: "/assets/generated/category-roots.dim_300x200.jpg",
    key: "roots",
  },
  {
    label: "Combo Pack",
    img: "/assets/generated/category-combo.dim_300x200.jpg",
    key: "combo",
    badge: "Hot",
  },
];

const CATEGORY_ROW_CONFIG = [
  { key: "vegetables", emoji: "🥦", label: "Vegetables" },
  { key: "fruits", emoji: "🍎", label: "Fruits" },
  { key: "leafy", emoji: "🌿", label: "Leafy Vegetables" },
  { key: "roots", emoji: "🥕", label: "Root Vegetables" },
  { key: "combo", emoji: "📦", label: "Combo Pack" },
];

interface ProductRow {
  label: string;
  products: Product[];
  isFirst?: boolean;
}

function buildProductRows(filtered: Product[]): ProductRow[] {
  const byCategory: Record<string, Product[]> = {};
  for (const cfg of CATEGORY_ROW_CONFIG) {
    byCategory[cfg.key] = [];
  }

  for (const p of filtered) {
    const cat = (p.productCategory || "").toLowerCase();
    let matched = false;
    for (const cfg of CATEGORY_ROW_CONFIG) {
      if (cat.includes(cfg.key)) {
        byCategory[cfg.key].push(p);
        matched = true;
        break;
      }
    }
    if (!matched) {
      byCategory.vegetables.push(p);
    }
  }

  const rows: ProductRow[] = [];
  const vegetables = byCategory.vegetables;
  const fruits = byCategory.fruits;

  if (fruits.length > 0) {
    if (vegetables.length > 0) {
      rows.push({ label: "🥦 Vegetables", products: vegetables });
    }
    rows.push({ label: "🍎 Fruits", products: fruits });
  } else {
    if (vegetables.length > 0) {
      const half = Math.ceil(vegetables.length / 2);
      rows.push({
        label: "🥦 Vegetables",
        products: vegetables.slice(0, half),
      });
      if (vegetables.length > half) {
        rows.push({ label: "🥦 Vegetables", products: vegetables.slice(half) });
      }
    }
  }

  for (const cfg of CATEGORY_ROW_CONFIG.slice(2)) {
    const items = byCategory[cfg.key];
    if (items.length > 0) {
      rows.push({ label: `${cfg.emoji} ${cfg.label}`, products: items });
    }
  }

  // Mark first row
  if (rows.length > 0) {
    rows[0] = { ...rows[0], isFirst: true };
  }

  return rows;
}

interface ShopPageProps {
  onOpenAdmin: () => void;
}

export default function ShopPage({ onOpenAdmin }: ShopPageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();

  const discount = parseDiscount(discountRaw ?? "");

  const handleSearchChange = (value: string) => {
    if (value.toLowerCase().trim() === "admin panel") {
      onOpenAdmin();
      setSearch("");
      return;
    }
    setSearch(value);
  };

  const filtered = (products ?? []).filter((p: Product) => {
    const name = p.name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    const cat = (p.productCategory || (p as any).category || "").toLowerCase();
    return matchesSearch && cat.includes(activeCategory);
  });

  const productRows = buildProductRows(filtered);

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
            onChange={(e) => handleSearchChange(e.target.value)}
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

      {/* FREE DELIVERY BANNER */}
      <div className="mx-3 mb-3 rounded-2xl overflow-hidden shadow-md">
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            background:
              "linear-gradient(90deg, #1a5c2a 0%, #2e7d32 60%, #f97316 100%)",
          }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-base leading-tight uppercase tracking-wide">
              🎉 FREE DELIVERY
            </p>
            <p className="text-green-100 text-[11px] font-semibold">
              On every order • Fast & Fresh
            </p>
          </div>
          <span className="bg-white text-green-800 font-black text-[10px] px-2 py-1 rounded-full uppercase">
            FREE
          </span>
        </div>
      </div>

      {/* Discount banner if active */}
      {discount && (discount.percentage > 0 || discount.flatAmount > 0) && (
        <div className="mx-3 mb-2 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2 px-3 py-2">
          <Tag className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-orange-700 text-xs font-bold">
            {discount.percentage > 0
              ? `${discount.percentage}% off on orders above ₹${discount.minimumAmount}`
              : `₹${discount.flatAmount} off on orders above ₹${discount.flatMinimum}`}
          </span>
        </div>
      )}

      {/* Delivery timing */}
      {deliveryTiming && (
        <div className="mx-3 mb-2 rounded-xl bg-white border border-gray-100 flex items-center gap-2 px-3 py-2 shadow-xs">
          <span className="text-sm">🚚</span>
          <span className="text-orange-600 text-xs font-bold">
            {deliveryTiming}
          </span>
        </div>
      )}

      {/* Category tiles */}
      <div className="px-3 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() =>
                setActiveCategory(cat.key === activeCategory ? "all" : cat.key)
              }
              className={`flex flex-col items-center shrink-0 rounded-xl overflow-hidden border-2 transition-all w-20 ${
                activeCategory === cat.key
                  ? "border-green-700 shadow-md scale-105"
                  : "border-gray-200"
              }`}
            >
              <div className="relative w-full h-12 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
                {cat.badge && (
                  <span className="absolute top-0.5 right-0.5 text-[7px] font-black px-1 rounded-full bg-red-500 text-white uppercase">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-bold text-center leading-tight px-1 py-1 w-full ${
                  activeCategory === cat.key
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="px-3">
          <div className="grid grid-cols-2 gap-3 pb-2">
            {[1, 2, 3, 4].map((k) => (
              <Skeleton key={k} className="w-full h-64 rounded-xl" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="shop.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <span className="text-5xl">🥦</span>
          <p className="text-sm text-muted-foreground">
            {search ? "No products found" : "No products available"}
          </p>
        </div>
      ) : (
        <div className="px-3 flex flex-col gap-4">
          {productRows.map((row, idx) => (
            <div key={`${row.label}-${idx}`}>
              <h2 className="font-display font-bold text-gray-800 text-sm mb-2">
                {row.label}
              </h2>
              {row.isFirst ? (
                // First row: small cards, exactly 3 visible at a time
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                  {row.products.map((product: Product) => (
                    <ProductCard
                      key={product.id.toString()}
                      product={product}
                      tiny
                    />
                  ))}
                </div>
              ) : (
                // Remaining rows: normal compact cards
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                  {row.products.map((product: Product) => (
                    <ProductCard
                      key={product.id.toString()}
                      product={product}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
