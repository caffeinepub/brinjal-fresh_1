import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend";

export interface KartItem {
  product: Product;
  quantity: number;
  quantityOption: string; // e.g. "500gm", "1 Piece", "2 Bundles"
  itemPrice: bigint; // price for this quantity option
}

interface KartContextValue {
  items: KartItem[];
  addToKart: (product: Product, quantityOption: string) => void;
  removeFromKart: (productId: bigint, quantityOption: string) => void;
  updateQuantity: (
    productId: bigint,
    quantityOption: string,
    quantity: number,
  ) => void;
  clearKart: () => void;
  totalItems: number;
  totalAmount: bigint;
}

const KartContext = createContext<KartContextValue | undefined>(undefined);

/** Calculate the price for a given quantity option based on unit type (category). */
export function getOptionPrice(
  basePrice: bigint,
  quantityOption: string,
): bigint {
  // Weight-based (kg)
  if (quantityOption === "250gm") return (basePrice * 25n) / 100n;
  if (quantityOption === "500gm") return (basePrice * 50n) / 100n;
  if (quantityOption === "750gm") return (basePrice * 75n) / 100n;
  if (quantityOption === "1kg") return basePrice;
  if (quantityOption === "2kg") return basePrice * 2n;
  // Pieces
  if (quantityOption === "1 Piece") return basePrice;
  if (quantityOption === "2 Pieces") return basePrice * 2n;
  if (quantityOption === "3 Pieces") return basePrice * 3n;
  if (quantityOption === "5 Pieces") return basePrice * 5n;
  // Bundles
  if (quantityOption === "1 Bundle") return basePrice;
  if (quantityOption === "2 Bundles") return basePrice * 2n;
  if (quantityOption === "3 Bundles") return basePrice * 3n;
  // Packets
  if (quantityOption === "1 Packet") return basePrice;
  if (quantityOption === "2 Packets") return basePrice * 2n;
  if (quantityOption === "3 Packets") return basePrice * 3n;
  // default: 1x
  return basePrice;
}

/** Get quantity options list for a given unit type (category). */
export function getQuantityOptions(category: string): string[] {
  switch (category) {
    case "piece":
      return ["1 Piece", "2 Pieces", "3 Pieces", "5 Pieces"];
    case "bundle":
      return ["1 Bundle", "2 Bundles", "3 Bundles"];
    case "packet":
      return ["1 Packet", "2 Packets", "3 Packets"];
    default: // kg
      return ["250gm", "500gm", "750gm", "1kg", "2kg"];
  }
}

/** Format unit label for price display */
export function getUnitLabel(category: string): string {
  switch (category) {
    case "piece":
      return "/piece";
    case "bundle":
      return "/bundle";
    case "packet":
      return "/packet";
    default:
      return "/kg";
  }
}

export function KartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<KartItem[]>([]);

  const addToKart = (product: Product, quantityOption: string) => {
    const itemPrice = getOptionPrice(product.price, quantityOption);
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === product.id && i.quantityOption === quantityOption,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.quantityOption === quantityOption
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1, quantityOption, itemPrice }];
    });
  };

  const removeFromKart = (productId: bigint, quantityOption: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(i.product.id === productId && i.quantityOption === quantityOption),
      ),
    );
  };

  const updateQuantity = (
    productId: bigint,
    quantityOption: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromKart(productId, quantityOption);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.quantityOption === quantityOption
          ? { ...i, quantity }
          : i,
      ),
    );
  };

  const clearKart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.itemPrice * BigInt(i.quantity),
    BigInt(0),
  );

  return (
    <KartContext.Provider
      value={{
        items,
        addToKart,
        removeFromKart,
        updateQuantity,
        clearKart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </KartContext.Provider>
  );
}

export function useKart() {
  const ctx = useContext(KartContext);
  if (!ctx) throw new Error("useKart must be used within KartProvider");
  return ctx;
}
