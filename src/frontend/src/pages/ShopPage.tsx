import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Percent, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useKart } from "../context/KartContext";
import {
  useDeliveryTiming,
  useDiscount,
  useProducts,
} from "../hooks/useQueries";

function parseDiscount(
  discountText: string,
): { pct: number; minOrder: number } | null {
  if (!discountText) return null;
  const parts = discountText.split("|");
  if (parts.length === 2) {
    const pct = Number.parseFloat(parts[0]);
    const minOrder = Number.parseFloat(parts[1]);
    if (!Number.isNaN(pct) && pct > 0 && !Number.isNaN(minOrder))
      return { pct, minOrder };
  }
  return null;
}

const WEIGHT_OPTIONS = ["250gm", "500gm", "750gm", "1kg"];

function getWeightPrice(basePrice: bigint, weight: string): bigint {
  switch (weight) {
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

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedWeights, setSelectedWeights] = useState<
    Record<string, string>
  >({});
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountText } = useDiscount();
  const { addToKart } = useKart();

  const discount = parseDiscount(discountText ?? "");

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddToKart = (product: (typeof filtered)[0]) => {
    const weight = selectedWeights[String(product.id)] ?? "1kg";
    addToKart(product, weight);
  };

  return (
    <div className="pb-2">
      {/* Search bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-3 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-ocid="shop.search_input"
            type="text"
            placeholder="Search vegetables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Discount banner */}
        {discount && (
          <div
            data-ocid="shop.discount.card"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: "#fef9c3",
              color: "#854d0e",
              border: "1px solid #fde047",
            }}
          >
            <Percent className="w-4 h-4 flex-shrink-0" />
            <span>
              {discount.pct}% off on orders of ₹{discount.minOrder} and above!
            </span>
          </div>
        )}

        {/* Delivery timing */}
        {deliveryTiming && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lime-100 text-lime-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{deliveryTiming}</span>
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="px-3 pt-2">
        {isLoading ? (
          <div
            data-ocid="shop.loading_state"
            className="grid grid-cols-2 gap-3"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <span className="text-4xl mb-3">🥦</span>
            <p className="font-bold text-foreground">No vegetables found</p>
            <p className="text-muted-foreground text-sm mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product, idx) => {
              const weight = selectedWeights[String(product.id)] ?? "1kg";
              const price = getWeightPrice(product.price, weight);
              const inStock = product.stock > 0n;
              return (
                <Card
                  key={String(product.id)}
                  data-ocid={`shop.product.card.${idx + 1}`}
                  className="overflow-hidden border-0 shadow-card"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div className="relative">
                    {product.imageId ? (
                      <img
                        src={product.imageId}
                        alt={product.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/generated/kaccha-tomatoes.dim_400x400.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-lime-100 flex items-center justify-center">
                        <span className="text-4xl">🥬</span>
                      </div>
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2.5 space-y-2">
                    <p className="font-bold text-sm text-foreground leading-tight">
                      {product.name}
                    </p>
                    <p
                      className="font-extrabold text-base"
                      style={{ color: "#15803d" }}
                    >
                      ₹{String(price)}
                      <span className="text-xs font-bold text-muted-foreground ml-1">
                        ({weight}) — ₹{String(product.price)}/kg
                      </span>
                    </p>
                    <Select
                      value={selectedWeights[String(product.id)] ?? "1kg"}
                      onValueChange={(val) =>
                        setSelectedWeights((prev) => ({
                          ...prev,
                          [String(product.id)]: val,
                        }))
                      }
                    >
                      <SelectTrigger
                        data-ocid={`shop.product.select.${idx + 1}`}
                        className="h-8 text-xs font-bold border-border"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEIGHT_OPTIONS.map((w) => (
                          <SelectItem key={w} value={w} className="font-bold">
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      data-ocid={`shop.product.button.${idx + 1}`}
                      size="sm"
                      className="w-full h-8 text-xs font-bold"
                      style={{ backgroundColor: "#f97316", color: "white" }}
                      disabled={!inStock}
                      onClick={() => handleAddToKart(product)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                      Add to Kart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground px-4">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
