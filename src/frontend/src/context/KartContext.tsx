import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend";

export interface KartItem {
  product: Product;
  quantity: number;
  weightOption: string;
  pricePerUnit: bigint;
}

interface KartContextValue {
  items: KartItem[];
  addToKart: (product: Product, weightOption: string) => void;
  removeFromKart: (productId: bigint, weightOption: string) => void;
  updateQuantity: (
    productId: bigint,
    weightOption: string,
    quantity: number,
  ) => void;
  clearKart: () => void;
  totalItems: number;
  totalAmount: bigint;
}

const KartContext = createContext<KartContextValue | undefined>(undefined);

export function getWeightPrice(
  basePrice: bigint,
  weightOption: string,
): bigint {
  switch (weightOption) {
    case "250gm":
      return (basePrice * 25n) / 100n;
    case "500gm":
      return (basePrice * 50n) / 100n;
    case "750gm":
      return (basePrice * 75n) / 100n;
    default:
      return basePrice;
  }
}

export function KartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<KartItem[]>([]);

  const addToKart = (product: Product, weightOption: string) => {
    const pricePerUnit = getWeightPrice(product.price, weightOption);
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.weightOption === weightOption,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.weightOption === weightOption
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, quantity: 1, weightOption, pricePerUnit }];
    });
  };

  const removeFromKart = (productId: bigint, weightOption: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.weightOption === weightOption),
      ),
    );
  };

  const updateQuantity = (
    productId: bigint,
    weightOption: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromKart(productId, weightOption);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.weightOption === weightOption
          ? { ...i, quantity }
          : i,
      ),
    );
  };

  const clearKart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.pricePerUnit * BigInt(i.quantity),
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
