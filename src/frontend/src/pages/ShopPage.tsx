import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Leaf, Search, ShoppingCart, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { getWeightPrice, useKart } from "../context/KartContext";
import {
  useDeliveryTiming,
  useDiscount,
  useProducts,
} from "../hooks/useQueries";
import { getImageUrl } from "../hooks/useStorageClient";

const QUANTITY_OPTIONS = [
  { label: "250gm", value: "250gm" },
  { label: "500gm", value: "500gm" },
  { label: "750gm", value: "750gm" },
  { label: "1kg", value: "1kg" },
];

function ProductImage({ imageId, name }: { imageId: string; name: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!imageId) return;
    getImageUrl(imageId)
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [imageId]);

  if (!url) {
    return (
      <div className="w-full h-40 bg-muted flex items-center justify-center rounded-t-lg">
        <Leaf className="w-12 h-12 text-primary/30" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className="w-full h-40 object-cover rounded-t-lg"
      onError={() => setUrl("")}
    />
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const [selectedWeight, setSelectedWeight] = useState(
    QUANTITY_OPTIONS[0].value,
  );
  const isOutOfStock = product.stock === BigInt(0);

  const displayPrice = getWeightPrice(product.price, selectedWeight);
  const priceLabel = selectedWeight === "1kg" ? "/kg" : `/${selectedWeight}`;

  const handleAdd = () => {
    addToKart(product, selectedWeight);
    toast.success(`${product.name} (${selectedWeight}) added to kart!`);
  };

  return (
    <div className="bg-card rounded-lg shadow-card card-hover overflow-hidden flex flex-col">
      <ProductImage imageId={product.imageId} name={product.name} />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-display font-bold text-card-foreground text-sm leading-tight">
            {product.name}
          </h3>
          {product.category && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {product.category}
            </Badge>
          )}
        </div>

        {/* Price — large, bold, prominent */}
        <div className="flex items-baseline gap-1">
          <span className="font-black text-primary text-2xl leading-none">
            ₹{displayPrice.toString()}
          </span>
          <span className="text-xs font-extrabold text-primary/70">
            {priceLabel}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-1">
          Base: ₹{product.price.toString()}/kg
        </p>

        {/* Quantity selector */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-foreground uppercase tracking-wide">
            Select Quantity
          </span>
          <Select value={selectedWeight} onValueChange={setSelectedWeight}>
            <SelectTrigger
              className="h-9 text-sm font-extrabold border-2 border-primary/50 focus:border-primary"
              data-ocid="shop.product.select"
            >
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              {QUANTITY_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm font-bold"
                >
                  {opt.label} — ₹
                  {getWeightPrice(product.price, opt.value).toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground">
          Stock: {product.stock.toString()}
        </span>

        {isOutOfStock ? (
          <Button
            disabled
            size="sm"
            className="w-full text-xs"
            data-ocid="shop.product.button"
          >
            Out of Stock
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full text-xs font-bold"
            onClick={handleAdd}
            data-ocid="shop.product.button"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add to Kart
          </Button>
        )}
      </div>
    </div>
  );
}

function ProductSkeletonCard() {
  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discount } = useDiscount();

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur px-4 py-3 border-b border-border shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="shop.search_input"
            placeholder="Search fresh vegetables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border focus:ring-primary"
          />
        </div>
      </div>

      {deliveryTiming && (
        <div
          data-ocid="shop.delivery.panel"
          className="mx-4 mt-3 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-2 animate-fade-up"
        >
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground">
            {deliveryTiming}
          </span>
        </div>
      )}

      {(() => {
        if (!discount) return null;
        const parts = discount.split("|");
        if (parts.length !== 2) return null;
        const pct = Number(parts[0]);
        const minOrder = Number(parts[1]);
        if (Number.isNaN(pct) || Number.isNaN(minOrder) || pct <= 0)
          return null;
        return (
          <div
            data-ocid="shop.discount.panel"
            className="mx-4 mt-2 bg-accent/20 border border-accent/30 rounded-lg px-4 py-2.5 flex items-center gap-2 animate-fade-up"
          >
            <Tag className="w-4 h-4 text-accent-foreground shrink-0" />
            <span className="text-sm font-semibold text-accent-foreground">
              🎉 {pct}% off on orders of ₹{minOrder} and above!
            </span>
          </div>
        );
      })()}

      <section className="px-4 py-4">
        {isLoading ? (
          <div
            data-ocid="shop.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {Array.from({ length: 6 }, (_, i) => i).map((i) => (
              <ProductSkeletonCard key={`skel-${i}`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3 text-center"
          >
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-card">
              <Leaf className="w-8 h-8 text-primary/40" />
            </div>
            <p className="font-display font-bold text-foreground text-lg">
              {search ? "No vegetables found" : "No products yet"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {search
                ? `No products match "${search}". Try a different search.`
                : "The admin will add fresh vegetables soon. Check back shortly!"}
            </p>
          </div>
        ) : (
          <div
            data-ocid="shop.product.list"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {filtered.map((product, idx) => (
              <div
                key={product.id.toString()}
                data-ocid={`shop.product.item.${idx + 1}`}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="text-center py-4 px-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
