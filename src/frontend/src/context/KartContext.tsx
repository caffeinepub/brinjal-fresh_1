import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend";

export interface KartItem {
  product: Product;
  quantity: number;
  quantityOption: string;
  itemPrice: bigint;
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

/** Price multipliers for quantity options */
export function getOptionPrice(
  basePrice: bigint,
  quantityOption: string,
): bigint {
  // kg options
  if (quantityOption === "250g") return (basePrice * 25n) / 100n;
  if (quantityOption === "500g") return (basePrice * 50n) / 100n;
  if (quantityOption === "1kg") return basePrice;
  // piece options
  if (quantityOption === "1pc") return basePrice;
  if (quantityOption === "2pc") return basePrice * 2n;
  if (quantityOption === "5pc") return basePrice * 5n;
  // bundle options
  if (quantityOption === "1 bunch") return basePrice;
  if (quantityOption === "2 bunch") return basePrice * 2n;
  // packet options
  if (quantityOption === "1 pkt") return basePrice;
  if (quantityOption === "2 pkt") return basePrice * 2n;
  // legacy compat
  if (quantityOption === "250gm") return (basePrice * 25n) / 100n;
  if (quantityOption === "500gm") return (basePrice * 50n) / 100n;
  if (quantityOption === "1 Piece") return basePrice;
  if (quantityOption === "2 Pieces") return basePrice * 2n;
  if (quantityOption === "1 Bundle") return basePrice;
  if (quantityOption === "2 Bundles") return basePrice * 2n;
  if (quantityOption === "1 Packet") return basePrice;
  if (quantityOption === "2 Packets") return basePrice * 2n;
  return basePrice;
}

/** Get quantity options for a given unit type */
export function getQuantityOptions(unitType: string): string[] {
  switch (unitType) {
    case "piece":
      return ["1pc", "2pc", "5pc"];
    case "bundle":
      return ["1 bunch", "2 bunch"];
    case "packet":
      return ["1 pkt", "2 pkt"];
    default: // kg
      return ["250g", "500g", "1kg"];
  }
}

/** Unit label for price display */
export function getUnitLabel(unitType: string): string {
  switch (unitType) {
    case "piece":
      return "/pc";
    case "bundle":
      return "/bunch";
    case "packet":
      return "/pkt";
    default:
      return "/kg";
  }
}

/** Build a human-readable quantity label like '2 × 1kg' */
export function buildQuantityLabel(
  quantityOption: string,
  count: number,
): string {
  if (count === 1) return quantityOption;
  return `${count} × ${quantityOption}`;
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
    0n,
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
