import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Leaf, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useKart } from "../context/KartContext";
import { useDiscount, usePlaceOrder } from "../hooks/useQueries";

export default function KartPage() {
  const { items, updateQuantity, removeFromKart, clearKart, totalAmount } =
    useKart();
  const { data: discountRaw } = useDiscount();

  const discountInfo = (() => {
    if (!discountRaw) return null;
    const parts = discountRaw.split("|");
    if (parts.length !== 2) return null;
    const pct = Number(parts[0]);
    const minOrder = Number(parts[1]);
    if (Number.isNaN(pct) || Number.isNaN(minOrder) || pct <= 0) return null;
    return { pct, minOrder: BigInt(Math.round(minOrder)) };
  })();

  const discountAmount =
    discountInfo && totalAmount >= discountInfo.minOrder
      ? BigInt(Math.floor((Number(totalAmount) * discountInfo.pct) / 100))
      : BigInt(0);

  const finalTotal = totalAmount - discountAmount;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "Cash on Delivery",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const placeOrder = usePlaceOrder();

  const handleCheckout = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        paymentMethod: form.payment,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: `${i.product.name} (${i.weightOption})`,
          quantity: BigInt(i.quantity),
          price: i.pricePerUnit,
        })),
      });
      clearKart();
      setCheckoutOpen(false);
      setOrderSuccess(true);
      setForm({
        name: "",
        phone: "",
        address: "",
        payment: "Cash on Delivery",
      });
      toast.success("Order placed successfully! 🎉");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (orderSuccess) {
    return (
      <div
        data-ocid="kart.success_state"
        className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6 animate-fade-up"
      >
        <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center">
          <Leaf className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Order Placed! 🎉
        </h2>
        <p className="text-muted-foreground max-w-xs">
          Your fresh vegetables are on their way. Thank you for shopping with
          Brinjal.fresh!
        </p>
        <Button
          onClick={() => setOrderSuccess(false)}
          className="mt-2"
          data-ocid="kart.continue.button"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-ocid="kart.empty_state"
        className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6"
      >
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-card">
          <ShoppingCart className="w-8 h-8 text-primary/40" />
        </div>
        <p className="font-display font-bold text-foreground text-lg">
          Your kart is empty
        </p>
        <p className="text-sm text-muted-foreground">
          Add fresh vegetables from the shop to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-4 gap-4">
      <h2 className="font-display text-xl font-bold text-foreground">
        My Kart
      </h2>

      <div data-ocid="kart.list" className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div
            key={`${item.product.id.toString()}-${item.weightOption}`}
            data-ocid={`kart.item.${idx + 1}`}
            className="bg-card rounded-lg shadow-card p-3 flex items-center gap-3 animate-fade-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-card-foreground truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-primary font-semibold">
                {item.weightOption}
              </p>
              <p className="text-xs text-muted-foreground">
                ₹{item.pricePerUnit.toString()} per {item.weightOption}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.weightOption,
                    item.quantity - 1,
                  )
                }
                data-ocid={`kart.item.button.${idx + 1}`}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-7 text-center font-bold text-sm">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.weightOption,
                    item.quantity + 1,
                  )
                }
                data-ocid={`kart.item.button.${idx + 1}`}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-sm text-primary">
                ₹{(item.pricePerUnit * BigInt(item.quantity)).toString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() =>
                  removeFromKart(item.product.id, item.weightOption)
                }
                data-ocid={`kart.delete_button.${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg shadow-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            ₹{totalAmount.toString()}
          </span>
        </div>
        {discountAmount > BigInt(0) && discountInfo && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-semibold">
              Discount ({discountInfo.pct}%)
            </span>
            <span className="text-green-600 font-bold">
              -₹{discountAmount.toString()}
            </span>
          </div>
        )}
        {discountInfo && totalAmount < discountInfo.minOrder && (
          <p className="text-xs text-muted-foreground">
            Add ₹{(discountInfo.minOrder - totalAmount).toString()} more to get{" "}
            {discountInfo.pct}% off!
          </p>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display text-xl font-bold text-primary">
              ₹{finalTotal.toString()}
            </p>
          </div>
          <Button
            onClick={() => setCheckoutOpen(true)}
            data-ocid="kart.checkout.button"
            className="px-6"
          >
            Checkout
          </Button>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent
          data-ocid="kart.checkout.dialog"
          className="max-w-sm mx-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Complete Your Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Full Name</Label>
              <Input
                id="c-name"
                data-ocid="kart.checkout.input"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Phone Number</Label>
              <Input
                id="c-phone"
                data-ocid="kart.checkout.input"
                placeholder="10-digit phone number"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-address">Delivery Address</Label>
              <Input
                id="c-address"
                data-ocid="kart.checkout.input"
                placeholder="Full address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={form.payment}
                onValueChange={(v) => setForm((f) => ({ ...f, payment: v }))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Cash on Delivery"
                    id="cod"
                    data-ocid="kart.checkout.radio"
                  />
                  <Label htmlFor="cod" className="cursor-pointer">
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Online Payment on Delivery"
                    id="opd"
                    data-ocid="kart.checkout.radio"
                  />
                  <Label htmlFor="opd" className="cursor-pointer">
                    Online Payment on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="bg-muted rounded-md p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  ₹{totalAmount.toString()}
                </span>
              </div>
              {discountAmount > BigInt(0) && discountInfo && (
                <div className="flex justify-between">
                  <span className="text-green-600 font-semibold">
                    Discount ({discountInfo.pct}%)
                  </span>
                  <span className="text-green-600 font-bold">
                    -₹{discountAmount.toString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-border pt-1">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ₹{finalTotal.toString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
              data-ocid="kart.checkout.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={placeOrder.isPending}
              data-ocid="kart.checkout.submit_button"
            >
              {placeOrder.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {placeOrder.isPending ? "Placing..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
