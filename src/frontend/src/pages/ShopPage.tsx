import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Search } from "lucide-react";
import { useRef, useState } from "react";
import type { Product } from "../backend";
import { HeroBanner } from "../components/HeroBanner";
import { ProductCardCompact, ProductCardWide } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORIES = [
  {
    key: "vegetables",
    label: "Vegetables",
    emoji: "🥦",
    img: "/assets/generated/category-vegetables.dim_300x200.jpg",
  },
  {
    key: "fruits",
    label: "Fruits",
    emoji: "🍎",
    img: "/assets/generated/category-fruits.dim_300x200.jpg",
  },
  {
    key: "leafy",
    label: "Leafy Veg",
    emoji: "🌿",
    img: "/assets/generated/category-leafy.dim_300x200.jpg",
  },
  {
    key: "roots",
    label: "Root Veg",
    emoji: "🥕",
    img: "/assets/generated/category-roots.dim_300x200.jpg",
  },
  {
    key: "combo",
    label: "Combo Pack",
    emoji: "📦",
    img: "/assets/generated/category-combo.dim_300x200.jpg",
  },
];

interface ProductRow {
  label: string;
  categoryKey: string;
  products: Product[];
  isFirst: boolean;
}

function buildProductRows(products: Product[]): ProductRow[] {
  const groups: Record<string, Product[]> = {
    vegetables: [],
    fruits: [],
    leafy: [],
    roots: [],
    combo: [],
  };

  for (const p of products) {
    const cat = (p.productCategory || "").toLowerCase();
    if (cat.includes("fruit")) groups.fruits.push(p);
    else if (cat.includes("leafy")) groups.leafy.push(p);
    else if (cat.includes("root")) groups.roots.push(p);
    else if (cat.includes("combo")) groups.combo.push(p);
    else groups.vegetables.push(p);
  }

  const rows: ProductRow[] = [];

  // Vegetables: split into two rows
  const vegs = groups.vegetables;
  if (vegs.length > 0) {
    const half = Math.ceil(vegs.length / 2);
    rows.push({
      label: "🥦 Fresh Vegetables",
      categoryKey: "vegetables",
      products: vegs.slice(0, half),
      isFirst: rows.length === 0,
    });
    if (vegs.length > half) {
      rows.push({
        label: "🥦 Fresh Vegetables",
        categoryKey: "vegetables",
        products: vegs.slice(half),
        isFirst: false,
      });
    }
  }

  if (groups.leafy.length > 0)
    rows.push({
      label: "🌿 Leafy Vegetables",
      categoryKey: "leafy",
      products: groups.leafy,
      isFirst: false,
    });

  if (groups.combo.length > 0)
    rows.push({
      label: "📦 Combo Pack",
      categoryKey: "combo",
      products: groups.combo,
      isFirst: false,
    });

  if (groups.fruits.length > 0)
    rows.push({
      label: "🍎 Fruits",
      categoryKey: "fruits",
      products: groups.fruits,
      isFirst: false,
    });

  if (groups.roots.length > 0)
    rows.push({
      label: "🥕 Root Vegetables",
      categoryKey: "roots",
      products: groups.roots,
      isFirst: false,
    });

  // Mark the very first row
  if (rows.length > 0) rows[0] = { ...rows[0], isFirst: true };

  return rows;
}

export default function ShopPage({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [search, setSearch] = useState("");
  const [activePill, setActivePill] = useState("");
  const { data: products, isLoading } = useProducts();

  const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    vegetables: useRef<HTMLDivElement>(null),
    fruits: useRef<HTMLDivElement>(null),
    leafy: useRef<HTMLDivElement>(null),
    roots: useRef<HTMLDivElement>(null),
    combo: useRef<HTMLDivElement>(null),
  };

  const handleSearchChange = (val: string) => {
    if (val.toLowerCase().trim() === "admin panel") {
      onOpenAdmin();
      setSearch("");
      return;
    }
    setSearch(val);
  };

  const handlePillClick = (key: string) => {
    setActivePill(key === activePill ? "" : key);
    const ref = refs[key];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filtered = (products ?? []).filter((p: Product) => {
    if (!search) return true;
    return (p.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const productRows = buildProductRows(filtered);

  return (
    <div className="pb-2">
      {/* Search bar */}
      <div className="px-3 pt-2 pb-1.5">
        <div
          className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-200 shadow-xs"
          style={{ height: 36 }}
        >
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            data-ocid="shop.search_input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner bannerHeadline="Fresh Vegetables Daily" />

      {/* Category pill strip */}
      <div className="px-3 mb-1.5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              data-ocid="shop.filter.tab"
              onClick={() => handlePillClick(c.key)}
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border-2 transition-all ${
                activePill === c.key
                  ? "bg-green-700 text-white border-green-700 shadow-sm"
                  : "bg-white text-green-800 border-green-300"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category tiles */}
      <div className="px-3 mb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handlePillClick(cat.key)}
              className="flex flex-col items-center shrink-0 rounded-xl overflow-hidden border border-gray-200 w-[72px] hover:border-green-500 transition-colors"
            >
              <div className="w-full h-10 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[8px] font-bold text-center text-gray-700 px-1 py-0.5 leading-tight w-full bg-white">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="px-3 flex flex-col gap-3">
          {[1, 2].map((k) => (
            <div key={k}>
              <Skeleton className="h-4 w-32 mb-1.5 rounded" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton
                    key={j}
                    className="rounded-xl"
                    style={{ width: "calc(33vw - 10px)", height: 165 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : productRows.length === 0 ? (
        <div
          data-ocid="shop.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <span className="text-5xl">🥦</span>
          <p className="text-sm text-muted-foreground">
            {search ? "No products found" : "No products available yet"}
          </p>
          {!search && (
            <p className="text-xs text-gray-400 text-center px-8">
              The admin is adding fresh products. Check back soon!
            </p>
          )}
        </div>
      ) : (
        <div className="px-3 flex flex-col gap-2">
          {productRows.map((row, idx) => {
            const isFirstOfKey =
              idx ===
              productRows.findIndex((r) => r.categoryKey === row.categoryKey);
            const ref = isFirstOfKey ? refs[row.categoryKey] : undefined;
            return (
              <div key={`${row.label}-${idx}`} ref={ref}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display font-bold text-gray-800 text-sm">
                    {row.label}
                  </h2>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 text-green-700 text-[10px] font-bold"
                  >
                    See All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {row.isFirst ? (
                  <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-hide">
                    {row.products.map((p: Product) => (
                      <ProductCardCompact key={p.id.toString()} product={p} />
                    ))}
                  </div>
                ) : (
                  <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-hide">
                    {row.products.map((p: Product) => (
                      <ProductCardWide key={p.id.toString()} product={p} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
