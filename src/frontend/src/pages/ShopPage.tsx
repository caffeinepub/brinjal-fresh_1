import { Skeleton } from "@/components/ui/skeleton";
import { Barcode, ChevronRight, Mic, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  useBannerEnabled,
  useBannerText,
  useDeliveryTiming,
  useDiscount,
  useMinimumOrder,
  useProducts,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

// ─── Product Image ─────────────────────────────────────────────────────────────
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

// ─── Tiny Product Image ────────────────────────────────────────────────────────
function TinyProductImage({ imageId }: { imageId: string }) {
  const storageClient = useStorageClient();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId || !storageClient) return;
    storageClient
      .getDirectURL(imageId)
      .then(setUrl)
      .catch(() => setUrl(null));
  }, [imageId, storageClient]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-2xl">🥦</span>
      </div>
    );
  }
  return <img src={url} alt="product" className="w-full h-full object-cover" />;
}

// ─── Quantity Buttons ─────────────────────────────────────────────────────────
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
          } font-bold py-1 px-0.5 rounded-lg border transition-all duration-150 ${
            selected === opt
              ? "bg-green-700 text-white border-green-700 scale-105 shadow-sm"
              : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
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

  const widthClass = tiny
    ? "w-[30vw] min-w-[95px] max-w-[115px] shrink-0"
    : compact
      ? "w-44 shrink-0"
      : "";

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 transition-all duration-200 ${widthClass}`}
    >
      {/* Product image */}
      <div className="relative rounded-t-xl overflow-hidden">
        {tiny ? (
          <div className="w-full aspect-[4/3] bg-green-50 overflow-hidden">
            {product.imageId ? (
              <TinyProductImage imageId={product.imageId} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">🥦</span>
              </div>
            )}
          </div>
        ) : (
          <ProductImage imageId={product.imageId} />
        )}
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

// ─── Hero Banner ───────────────────────────────────────────────────────────────
function HeroBanner({
  bannerText,
  deliveryTiming,
  discount,
  minimumOrder = 0,
}: {
  bannerText: string;
  deliveryTiming: string;
  discount: ReturnType<typeof parseDiscount>;
  minimumOrder?: number;
}) {
  const [slide, setSlide] = useState(0);

  // Build discount label for slide 4
  let discountSlide: {
    emoji: string;
    headline: string;
    sub: string;
    gradient: string;
  } | null = null;
  if (discount) {
    const hasDiscount =
      discount.percentage > 0 ||
      discount.flatAmount > 0 ||
      discount.freeItem !== "";
    if (hasDiscount) {
      let headline = "";
      if (discount.freeItem && discount.freeItemMinimum > 0) {
        headline = `FREE ${discount.freeItem} on orders above ₹${discount.freeItemMinimum}`;
      } else if (discount.percentage > 0) {
        headline = `${discount.percentage}% OFF on orders above ₹${discount.minimumAmount}`;
      } else if (discount.flatAmount > 0) {
        headline = `₹${discount.flatAmount} OFF on orders above ₹${discount.flatMinimum}`;
      }
      discountSlide = {
        emoji: "🎉",
        headline,
        sub: "Special Offer Just For You",
        gradient:
          "linear-gradient(135deg, #5c1a00 0%, #b03000 60%, #e84800 100%)",
      };
    }
  }

  const minimumOrderSlide =
    minimumOrder > 0
      ? {
          emoji: "🛒",
          headline: `Minimum Order ₹${minimumOrder}`,
          sub: "Minimum order required",
          gradient:
            "linear-gradient(135deg, #4a1a00 0%, #7a3000 60%, #a04000 100%)",
        }
      : null;

  const slides = [
    {
      emoji: "🥦",
      headline: bannerText || "Fresh Vegetables Daily",
      sub: "Order Now for Same Day Delivery",
      gradient:
        "linear-gradient(135deg, #0d4a1a 0%, #1a7a30 60%, #2ea84a 100%)",
    },
    {
      emoji: "🚚",
      headline: "Free Delivery on Every Order",
      sub: "No minimum order required",
      gradient:
        "linear-gradient(135deg, #1a3a5c 0%, #1e5f99 60%, #2980cc 100%)",
    },
    {
      emoji: "⏰",
      headline: deliveryTiming || "Fast Delivery",
      sub: "Today's Delivery Timing",
      gradient:
        "linear-gradient(135deg, #0a3d1f 0%, #145c30 60%, #1e7a40 100%)",
    },
    ...(discountSlide ? [discountSlide] : []),
    ...(minimumOrderSlide ? [minimumOrderSlide] : []),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Clamp slide index if slides length changed
  const currentSlideIdx = slide % slides.length;
  const current = slides[currentSlideIdx];

  return (
    <div
      data-ocid="shop.hero.panel"
      className="mx-3 mb-3 rounded-2xl overflow-hidden shadow-lg relative"
      style={{ height: 91 }}
    >
      {/* Slide content */}
      <div
        className="absolute inset-0 flex flex-col items-start justify-center px-5 transition-all duration-500"
        style={{ background: current.gradient }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl">{current.emoji}</span>
          <div>
            <p className="text-white font-black text-base leading-snug drop-shadow">
              {current.headline}
            </p>
            <p className="text-white/80 text-[11px] font-semibold">
              {current.sub}
            </p>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2.5 right-3 flex gap-1.5">
        {slides.map((slideItem, i) => (
          <button
            key={slideItem.headline}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setSlide(i)}
            className={`rounded-full transition-all duration-300 ${
              currentSlideIdx === i ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Category Pill Strip ───────────────────────────────────────────────────────
function CategoryPillStrip({
  onPillClick,
}: {
  onPillClick: (key: string) => void;
}) {
  const [active, setActive] = useState("");

  const pills = [
    { key: "vegetables", label: "🥦 Vegetables" },
    { key: "leafy", label: "🍃 Leafy Veg" },
    { key: "combo", label: "📦 Combo Pack" },
    { key: "fruits", label: "🍎 Fruits" },
    { key: "roots", label: "🥕 Root Veg" },
  ];

  const handleClick = (key: string) => {
    setActive(key === active ? "" : key);
    onPillClick(key);
  };

  return (
    <div className="px-3 mb-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {pills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            data-ocid="shop.filter.tab"
            onClick={() => handleClick(pill.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border-2 transition-all duration-200 ${
              active === pill.key
                ? "bg-green-700 text-white border-green-700 shadow-sm"
                : "bg-white text-green-800 border-green-300 hover:border-green-500"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Category Images ───────────────────────────────────────────────────────────
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

// ─── Product Row Types ─────────────────────────────────────────────────────────
interface ProductRow {
  label: string;
  categoryKey: string;
  products: Product[];
  isFirst?: boolean;
}

function buildProductRows(filtered: Product[]): ProductRow[] {
  const vegetables: Product[] = [];
  const fruits: Product[] = [];
  const leafy: Product[] = [];
  const roots: Product[] = [];
  const combo: Product[] = [];

  for (const p of filtered) {
    const cat = (p.productCategory || "").toLowerCase();
    if (cat.includes("fruit")) {
      fruits.push(p);
    } else if (cat.includes("leafy")) {
      leafy.push(p);
    } else if (cat.includes("root")) {
      roots.push(p);
    } else if (cat.includes("combo")) {
      combo.push(p);
    } else {
      vegetables.push(p);
    }
  }

  const rows: ProductRow[] = [];

  if (vegetables.length > 0) {
    const half = Math.ceil(vegetables.length / 2);
    rows.push({
      label: "🥦 Fresh Vegetables",
      categoryKey: "vegetables",
      products: vegetables.slice(0, half),
    });
    if (vegetables.length > half) {
      rows.push({
        label: "🥦 Fresh Vegetables",
        categoryKey: "vegetables",
        products: vegetables.slice(half),
      });
    }
  }

  if (leafy.length > 0) {
    rows.push({
      label: "🌿 Leafy Vegetables",
      categoryKey: "leafy",
      products: leafy,
    });
  }

  if (combo.length > 0) {
    rows.push({
      label: "📦 Combo Pack",
      categoryKey: "combo",
      products: combo,
    });
  }

  if (fruits.length > 0) {
    rows.push({ label: "🍎 Fruits", categoryKey: "fruits", products: fruits });
  }

  if (roots.length > 0) {
    rows.push({
      label: "🥕 Root Vegetables",
      categoryKey: "roots",
      products: roots,
    });
  }

  if (rows.length > 0) {
    rows[0] = { ...rows[0], isFirst: true };
  }

  return rows;
}

// ─── Shop Page ─────────────────────────────────────────────────────────────────
interface ShopPageProps {
  onOpenAdmin: () => void;
}

export default function ShopPage({ onOpenAdmin }: ShopPageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();
  const { data: bannerEnabled } = useBannerEnabled();
  const { data: bannerText } = useBannerText();
  const { data: minimumOrderData } = useMinimumOrder();

  const discount = parseDiscount(discountRaw ?? "");

  // Refs for category pill scroll navigation
  const vegetablesRef = useRef<HTMLDivElement>(null);
  const leafyRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const fruitsRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<HTMLDivElement>(null);

  const categoryRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    vegetables: vegetablesRef,
    leafy: leafyRef,
    combo: comboRef,
    fruits: fruitsRef,
    roots: rootsRef,
  };

  const handleSearchChange = (value: string) => {
    if (value.toLowerCase().trim() === "admin panel") {
      onOpenAdmin();
      setSearch("");
      return;
    }
    setSearch(value);
  };

  const handlePillClick = (key: string) => {
    const ref = categoryRefs[key];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filtered = (products ?? []).filter((p: Product) => {
    const name = p.name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    const cat = (p.productCategory || (p as any).category || "").toLowerCase();
    return matchesSearch && cat.includes(activeCategory);
  });

  const productRows = buildProductRows(filtered);

  // Determine if banner should show (default true if data not loaded yet)
  const showBanner = bannerEnabled !== false;

  return (
    <div className="pb-4">
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-xs border border-gray-100">
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

      {/* Hero Sliding Banner */}
      {showBanner && (
        <HeroBanner
          bannerText={bannerText ?? "Fresh Vegetables Daily"}
          deliveryTiming={deliveryTiming ?? ""}
          discount={discount}
          minimumOrder={minimumOrderData ?? 0}
        />
      )}

      {/* Category Pill Strip */}
      <CategoryPillStrip onPillClick={handlePillClick} />

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
          {productRows.map((row, idx) => {
            // Assign ref based on the first occurrence of each category key
            const isFirstOfKey =
              idx ===
              productRows.findIndex((r) => r.categoryKey === row.categoryKey);
            const ref = isFirstOfKey
              ? categoryRefs[row.categoryKey]
              : undefined;

            return (
              <div key={`${row.label}-${idx}`} ref={ref}>
                {/* Section title with See All */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-800 text-sm">
                    {row.label}
                  </h2>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 text-green-700 text-[11px] font-bold"
                  >
                    See All
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {row.isFirst ? (
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
            );
          })}
        </div>
      )}
    </div>
  );
}
