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
import { Clock, Search, ShoppingCart, Tag } from "lucide-react";
import { useEffect, useState } from "react";
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
  useDeliveryTiming,
  useDiscount,
  useProducts,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

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
      <div className="w-full aspect-square bg-secondary flex items-center justify-center rounded-t-xl">
        <span className="text-4xl">🥦</span>
      </div>
    );
  }
  return (
    <div className="w-full aspect-square bg-secondary rounded-t-xl overflow-hidden">
      <img src={url} alt="product" className="w-full h-full object-cover" />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToKart } = useKart();
  const options = getQuantityOptions(product.category);
  const [selectedOption, setSelectedOption] = useState(
    options[1] ?? options[0],
  );

  const basePrice = Number(product.price);
  const unitLabel = getUnitLabel(product.category);
  const calculatedPrice = Number(getOptionPrice(product.price, selectedOption));

  const handleAdd = () => {
    addToKart(product, selectedOption);
    toast.success(`${product.name} added to kart!`);
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden flex flex-col">
      <ProductImage imageId={product.imageId} />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-display font-bold text-card-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-primary font-bold text-base mt-0.5">
            ₹{basePrice}
            <span className="text-xs font-normal text-muted-foreground">
              {unitLabel}
            </span>
          </p>
        </div>

        {Number(product.stock) > 0 ? (
          <Badge variant="secondary" className="w-fit text-xs">
            Stock: {Number(product.stock)}
          </Badge>
        ) : (
          <Badge variant="destructive" className="w-fit text-xs">
            Out of Stock
          </Badge>
        )}

        <Select value={selectedOption} onValueChange={setSelectedOption}>
          <SelectTrigger
            data-ocid="shop.product.select"
            className="h-8 text-xs font-bold border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="font-bold">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          Price:{" "}
          <span className="font-bold text-foreground">₹{calculatedPrice}</span>
        </p>

        <Button
          data-ocid="shop.product.button"
          size="sm"
          onClick={handleAdd}
          disabled={Number(product.stock) === 0}
          className="w-full mt-auto font-bold"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Add to Kart
        </Button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();

  const discount = parseDiscount(discountRaw ?? "");

  const filtered = (products ?? []).filter((p: Product) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-3 py-4 space-y-3">
      {/* Delivery Timing */}
      {deliveryTiming && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-primary">
            Delivery: {deliveryTiming}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="shop.search_input"
          placeholder="Search vegetables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Discount Banner */}
      {discount && discount.percentage > 0 && (
        <div className="flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 text-accent-foreground shrink-0" />
          <span className="text-xs font-bold text-accent-foreground">
            🎉 {discount.percentage}% OFF on orders above ₹
            {discount.minimumAmount}
          </span>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div data-ocid="shop.loading_state" className="grid grid-cols-2 gap-3">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <div key={k} className="bg-card rounded-xl overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="shop.empty_state"
          className="flex flex-col items-center py-16 gap-3"
        >
          <span className="text-5xl">🛒</span>
          <p className="text-muted-foreground font-medium text-sm">
            {search
              ? "No products match your search"
              : "No products available yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product: Product, idx: number) => (
            <div
              key={product.id.toString()}
              data-ocid={`shop.product.item.${idx + 1}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
