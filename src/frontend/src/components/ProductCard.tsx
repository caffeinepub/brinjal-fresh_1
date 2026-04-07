import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import {
  getOptionPrice,
  getQuantityOptions,
  getUnitLabel,
  useKart,
} from "../context/KartContext";
import { useStorageClient } from "../hooks/useStorageClient";

// ─── Product Image ─────────────────────────────────────────────────────────────
export function ProductImage({
  imageId,
  className = "",
}: { imageId: string; className?: string }) {
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
      <div
        className={`flex items-center justify-center bg-green-50 ${className}`}
      >
        <span className="text-4xl">🥦</span>
      </div>
    );
  }
  return (
    <img src={url} alt="product" className={`object-cover ${className}`} />
  );
}

// ─── Compact Product Card (Row 1 — 3 visible at once) ─────────────────────────
export function ProductCardCompact({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const unitType = product.unitType || "kg";
  const options = getQuantityOptions(unitType);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const basePrice = Number(product.price) / 100;
  const unitLabel = getUnitLabel(unitType);
  const calculatedPrice =
    Number(getOptionPrice(product.price, selectedOption)) / 100;
  const inStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToKart(product, selectedOption);
    toast.success(`${product.name} added!`);
  };

  return (
    <div
      data-ocid="shop.product.card"
      className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col border border-gray-100 shrink-0"
      style={{ width: "calc(33vw - 10px)", minWidth: 95, maxWidth: 115 }}
    >
      <div
        className="relative w-full overflow-hidden bg-green-50"
        style={{ height: 80 }}
      >
        <ProductImage imageId={product.imageId} className="w-full h-full" />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold bg-red-500 px-1.5 py-0.5 rounded">
              Out
            </span>
          </div>
        )}
      </div>
      <div className="p-1.5 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-800 text-[9px] leading-tight line-clamp-1 text-center">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-0.5 justify-center">
          <span className="text-red-600 font-black text-sm leading-none">
            ₹{basePrice}
          </span>
          <span className="text-gray-500 text-[8px] font-semibold">
            {unitLabel}
          </span>
        </div>
        {/* Quantity buttons */}
        <div className="flex gap-0.5">
          {options.slice(0, 3).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedOption(opt)}
              className={`flex-1 text-[7px] font-bold py-0.5 rounded-md border transition-all ${
                selectedOption === opt
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 mt-0.5">
          <span className="text-red-500 font-black text-xs leading-none shrink-0">
            ₹{calculatedPrice}
          </span>
          <button
            type="button"
            data-ocid="shop.product.button"
            onClick={handleAdd}
            disabled={!inStock}
            className="flex-1 bg-green-700 text-white font-bold text-[9px] py-1 rounded-lg flex items-center justify-center gap-0.5 disabled:opacity-50 disabled:bg-gray-400"
          >
            <Plus className="w-2.5 h-2.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Wide Product Card (Row 2+ — 2 visible at once, image top / details bottom) ─
export function ProductCardWide({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const unitType = product.unitType || "kg";
  const options = getQuantityOptions(unitType);
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const basePrice = Number(product.price) / 100;
  const unitLabel = getUnitLabel(unitType);
  const calculatedPrice =
    Number(getOptionPrice(product.price, selectedOption)) / 100;
  const inStock = Number(product.stock) > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addToKart(product, selectedOption);
    toast.success(`${product.name} added!`);
  };

  return (
    <div
      data-ocid="shop.product.card"
      className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col border border-gray-100 shrink-0"
      style={{ width: "calc(50vw - 18px)", minWidth: 150, maxWidth: 195 }}
    >
      <div
        className="relative w-full overflow-hidden bg-green-50"
        style={{ height: 110 }}
      >
        <ProductImage imageId={product.imageId} className="w-full h-full" />
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold bg-red-500 px-1.5 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-2 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-800 text-[11px] leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-[9px] leading-tight line-clamp-1">
            {product.description}
          </p>
        )}
        <div className="flex items-baseline gap-0.5">
          <span className="text-red-600 font-black text-base leading-none">
            ₹{basePrice}
          </span>
          <span className="text-gray-500 text-[9px] font-semibold">
            {unitLabel}
          </span>
        </div>
        <div className="flex gap-0.5">
          {options.slice(0, 3).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedOption(opt)}
              className={`flex-1 text-[9px] font-bold py-0.5 rounded-md border transition-all ${
                selectedOption === opt
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-auto pt-0.5">
          <span className="text-red-500 font-black text-sm leading-none shrink-0">
            ₹{calculatedPrice}
          </span>
          <button
            type="button"
            data-ocid="shop.product.button"
            onClick={handleAdd}
            disabled={!inStock}
            className="flex-1 bg-green-700 text-white font-bold text-[10px] py-1 rounded-lg flex items-center justify-center gap-0.5 disabled:opacity-50 disabled:bg-gray-400"
          >
            <Plus className="w-2.5 h-2.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
