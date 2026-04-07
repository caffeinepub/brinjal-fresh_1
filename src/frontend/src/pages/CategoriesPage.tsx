import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Product } from "../backend";
import { ProductCardWide } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

const CATEGORIES = [
  {
    key: "vegetables",
    label: "Vegetables",
    emoji: "🥦",
    img: "/assets/generated/category-vegetables.dim_300x200.jpg",
    desc: "Fresh seasonal vegetables",
  },
  {
    key: "fruits",
    label: "Fruits",
    emoji: "🍎",
    img: "/assets/generated/category-fruits.dim_300x200.jpg",
    desc: "Sweet and nutritious fruits",
  },
  {
    key: "leafy",
    label: "Leafy Vegetables",
    emoji: "🌿",
    img: "/assets/generated/category-leafy.dim_300x200.jpg",
    desc: "Spinach, methi, coriander & more",
  },
  {
    key: "roots",
    label: "Root Vegetables",
    emoji: "🥕",
    img: "/assets/generated/category-roots.dim_300x200.jpg",
    desc: "Carrots, radish, beetroot & more",
  },
  {
    key: "combo",
    label: "Combo Pack",
    emoji: "📦",
    img: "/assets/generated/category-combo.dim_300x200.jpg",
    desc: "Best value combo bundles",
  },
];

function getCategoryKey(productCategory: string): string {
  const cat = (productCategory || "").toLowerCase();
  if (cat.includes("fruit")) return "fruits";
  if (cat.includes("leafy")) return "leafy";
  if (cat.includes("root")) return "roots";
  if (cat.includes("combo")) return "combo";
  return "vegetables";
}

export default function CategoriesPage() {
  const { data: products, isLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: (products ?? []).filter(
      (p: Product) => getCategoryKey(p.productCategory) === c.key,
    ).length,
  }));

  if (selectedCategory !== null) {
    const cat = CATEGORIES.find((c) => c.key === selectedCategory);
    const filtered = (products ?? []).filter(
      (p: Product) =>
        getCategoryKey(p.productCategory) === selectedCategory &&
        (p.name || "").toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <div className="pb-2">
        {/* Category header */}
        <div
          className="relative h-28 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
          }}
        >
          <img
            src={cat?.img}
            alt={cat?.label}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 flex items-center gap-3 px-4 h-full">
            <button
              type="button"
              data-ocid="categories.back.button"
              onClick={() => {
                setSelectedCategory(null);
                setSearch("");
              }}
              className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg"
            >
              ‹
            </button>
            <div>
              <h1 className="text-white font-display font-bold text-xl">
                {cat?.emoji} {cat?.label}
              </h1>
              <p className="text-white/80 text-xs">
                {filtered.length} products
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div
            className="flex items-center gap-2 bg-white rounded-xl px-3 border border-gray-200 shadow-xs"
            style={{ height: 36 }}
          >
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              data-ocid="categories.search_input"
              type="text"
              placeholder={`Search in ${cat?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Products */}
        <div className="px-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="categories.empty_state"
              className="flex flex-col items-center py-16 gap-3"
            >
              <span className="text-5xl">{cat?.emoji}</span>
              <p className="text-sm text-muted-foreground">
                No products in this category yet
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((p: Product) => (
                <ProductCardWide key={p.id.toString()} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display font-bold text-gray-900 text-xl">
          Categories
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Browse by category</p>
      </div>

      {/* Category grid */}
      <div className="px-3">
        <div className="grid grid-cols-2 gap-3">
          {categoryCounts.map((cat) => (
            <button
              key={cat.key}
              type="button"
              data-ocid="categories.item.1"
              onClick={() => setSelectedCategory(cat.key)}
              className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-card text-left hover:shadow-card-lg transition-shadow"
            >
              <div className="h-28 overflow-hidden relative">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-white font-display font-bold text-sm drop-shadow">
                      {cat.emoji} {cat.label}
                    </span>
                    <p className="text-white/80 text-[9px] mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
