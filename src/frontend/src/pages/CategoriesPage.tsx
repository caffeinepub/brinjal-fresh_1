import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import {
  getOptionPrice,
  getQuantityOptions,
  getUnitLabel,
  useKart,
} from "../context/KartContext";
import { useProducts } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const CATEGORIES = [
  {
    label: "Vegetables",
    img: "/assets/generated/category-vegetables.dim_300x200.jpg",
    color: "#e8f5e9",
    border: "#4caf50",
    key: "Vegetables",
  },
  {
    label: "Fruits",
    img: "/assets/generated/category-fruits.dim_300x200.jpg",
    color: "#fff3e0",
    border: "#f97316",
    key: "Fruits",
  },
  {
    label: "Leafy Vegetables",
    img: "/assets/generated/category-leafy.dim_300x200.jpg",
    color: "#f1f8e9",
    border: "#8bc34a",
    key: "Leafy Vegetables",
  },
  {
    label: "Root Vegetables",
    img: "/assets/generated/category-roots.dim_300x200.jpg",
    color: "#fbe9e7",
    border: "#795548",
    key: "Root Vegetables",
  },
  {
    label: "Combo Pack",
    img: "/assets/generated/category-combo.dim_300x200.jpg",
    color: "#ede7f6",
    border: "#7c3aed",
    key: "Combo Pack",
    badge: "Hot",
  },
];

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
        <span className="text-3xl">🥦</span>
      </div>
    );
  }
  return (
    <div className="w-full aspect-square bg-secondary overflow-hidden">
      <img src={url} alt="product" className="w-full h-full object-cover" />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const unitType = product.unitType || "kg";
  const options = getQuantityOptions(unitType);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const basePrice = Number(product.price);
  const unitLabel = getUnitLabel(unitType);
  const calculatedPrice = Number(getOptionPrice(product.price, selectedOption));
  const inStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToKart(product, selectedOption);
    toast.success(`${product.name} added to kart!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100">
      <div className="relative">
        <ProductImage imageId={product.imageId} />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold bg-red-500 px-2 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
        {inStock && (
          <span className="absolute top-1 left-1 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            FRESH
          </span>
        )}
      </div>
      <div className="p-2 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[9px] text-gray-500 italic line-clamp-1">
            {product.description}
          </p>
        )}
        {/* Attractive price block */}
        <div className="bg-green-50 rounded-lg px-2 py-1 flex items-baseline gap-1">
          <span className="text-green-800 font-black text-base leading-none">
            ₹{basePrice}
          </span>
          <span className="text-gray-500 font-bold text-[9px]">
            {unitLabel}
          </span>
        </div>
        <div className="flex gap-1">
          {options.slice(0, 3).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedOption(opt)}
              className={`flex-1 text-[9px] font-bold py-1 rounded-md border transition-colors ${
                selectedOption === opt
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-orange-600 font-extrabold text-sm text-center leading-none">
          ₹{calculatedPrice}
        </p>
        <button
          type="button"
          data-ocid="categories.product.button"
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

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = useProducts();

  const categoryInfo = CATEGORIES.find((c) => c.key === selectedCategory);

  const filteredProducts = selectedCategory
    ? (products ?? []).filter((p: Product) => {
        const cat = p.productCategory || "";
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      })
    : [];

  if (selectedCategory && categoryInfo) {
    return (
      <div className="pb-4">
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-3 py-3 border-b border-gray-100"
          style={{ backgroundColor: categoryInfo.color }}
        >
          <button
            type="button"
            data-ocid="categories.back.button"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1.5 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={categoryInfo.img}
            alt={categoryInfo.label}
            className="w-8 h-8 rounded-full object-cover border-2"
            style={{ borderColor: categoryInfo.border }}
          />
          <h2 className="font-display font-bold text-gray-800 text-base">
            {categoryInfo.label}
          </h2>
        </div>

        <div className="px-3 py-3">
          {isLoading ? (
            <div
              data-ocid="categories.loading_state"
              className="grid grid-cols-2 gap-3"
            >
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              data-ocid="categories.empty_state"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <img
                src={categoryInfo.img}
                alt={categoryInfo.label}
                className="w-24 h-24 rounded-full object-cover opacity-40"
              />
              <p className="text-sm text-muted-foreground">
                No products in {categoryInfo.label} yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      <h2 className="font-display font-bold text-gray-800 text-lg mb-4">
        Categories
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            data-ocid={`categories.${cat.key.toLowerCase().replace(/ /g, "_")}.button`}
            onClick={() => setSelectedCategory(cat.key)}
            className="relative rounded-2xl overflow-hidden border-2 transition-all active:scale-95 h-28"
            style={{ borderColor: cat.border }}
          >
            <img
              src={cat.img}
              alt={cat.label}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {cat.badge && (
              <span className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white uppercase">
                {cat.badge}
              </span>
            )}
            <span className="absolute bottom-2 left-0 right-0 text-center font-display font-bold text-white text-sm drop-shadow">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
