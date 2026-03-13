import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useKart } from "../context/KartContext";
import { useDiscount, usePlaceOrder } from "../hooks/useQueries";

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

interface KartPageProps {
  onBackToShop: () => void;
}

export default function KartPage({ onBackToShop }: KartPageProps) {
  const { items, removeFromKart, updateQuantity, clearKart, totalAmount } =
    useKart();
  const { data: discountText } = useDiscount();
  const placeOrder = usePlaceOrder();

  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const discount = parseDiscount(discountText ?? "");
  const subtotal = Number(totalAmount);
  const discountAmount =
    discount && subtotal >= discount.minOrder
      ? Math.floor((subtotal * discount.pct) / 100)
      : 0;
  const total = subtotal - discountAmount;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        paymentMethod: payment,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: BigInt(item.quantity),
          price: item.pricePerUnit,
        })),
      });
      clearKart();
      setOrderSuccess(true);
      setShowCheckout(false);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (orderSuccess) {
    return (
      <div
        data-ocid="kart.success_state"
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Order Placed!
        </h2>
        <p className="text-muted-foreground mb-6">
          Your fresh vegetables are on the way.
        </p>
        <Button
          data-ocid="kart.shop.button"
          style={{ backgroundColor: "#f97316", color: "white" }}
          onClick={() => {
            setOrderSuccess(false);
            onBackToShop();
          }}
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
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      >
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Your kart is empty
        </h2>
        <p className="text-muted-foreground mb-6">Add some fresh vegetables!</p>
        <Button
          data-ocid="kart.go_shopping.button"
          style={{ backgroundColor: "#f97316", color: "white" }}
          onClick={onBackToShop}
        >
          Go Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Your Kart</h2>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${String(item.product.id)}-${item.weightOption}`}
            data-ocid={`kart.item.${idx + 1}`}
            className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card"
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.weightOption}
              </p>
              <p
                className="font-extrabold text-sm"
                style={{ color: "#15803d" }}
              >
                ₹{String(item.pricePerUnit)} × {item.quantity} = ₹
                {String(item.pricePerUnit * BigInt(item.quantity))}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid={`kart.item.${idx + 1}.toggle`}
                className="w-7 h-7 rounded-full bg-lime-200 flex items-center justify-center"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.weightOption,
                    item.quantity - 1,
                  )
                }
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm">
                {item.quantity}
              </span>
              <button
                type="button"
                data-ocid={`kart.item.${idx + 1}.toggle`}
                className="w-7 h-7 rounded-full bg-lime-200 flex items-center justify-center"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.weightOption,
                    item.quantity + 1,
                  )
                }
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-ocid={`kart.item.${idx + 1}.delete_button`}
                className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center ml-1"
                onClick={() =>
                  removeFromKart(item.product.id, item.weightOption)
                }
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="bg-card rounded-xl p-4 shadow-card space-y-1">
        {discountAmount > 0 ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-green-700">
              <span>Discount ({discount?.pct}%)</span>
              <span className="font-semibold">−₹{discountAmount}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base border-t border-border pt-2 mt-2">
              <span>Total</span>
              <span style={{ color: "#15803d" }}>₹{total}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between font-extrabold text-base">
            <span>Total</span>
            <span style={{ color: "#15803d" }}>₹{subtotal}</span>
          </div>
        )}
        {discount && discountAmount === 0 && (
          <p className="text-xs text-orange-600 font-semibold mt-1">
            Add ₹{discount.minOrder - subtotal} more to get {discount.pct}% off!
          </p>
        )}
      </div>

      {/* Checkout */}
      {!showCheckout ? (
        <Button
          data-ocid="kart.checkout.button"
          className="w-full font-bold text-base py-6"
          style={{ backgroundColor: "#f97316", color: "white" }}
          onClick={() => setShowCheckout(true)}
        >
          Proceed to Checkout
        </Button>
      ) : (
        <div
          data-ocid="kart.checkout.panel"
          className="bg-card rounded-xl p-4 shadow-card space-y-4"
        >
          <h3 className="font-bold text-foreground">Delivery Details</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cust-name" className="font-bold">
                Name
              </Label>
              <Input
                id="cust-name"
                data-ocid="kart.checkout.input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cust-phone" className="font-bold">
                Phone
              </Label>
              <Input
                id="cust-phone"
                data-ocid="kart.checkout.input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cust-address" className="font-bold">
                Delivery Address
              </Label>
              <textarea
                id="cust-address"
                data-ocid="kart.checkout.textarea"
                placeholder="Street, Area, City..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label className="font-bold mb-2 block">Payment Method</Label>
              <RadioGroup
                value={payment}
                onValueChange={setPayment}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Cash on Delivery"
                    id="cod"
                    data-ocid="kart.checkout.radio"
                  />
                  <Label htmlFor="cod" className="font-semibold cursor-pointer">
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="Online Payment on Delivery"
                    id="online"
                    data-ocid="kart.checkout.radio"
                  />
                  <Label
                    htmlFor="online"
                    className="font-semibold cursor-pointer"
                  >
                    Online Payment on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-ocid="kart.checkout.cancel_button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowCheckout(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="kart.checkout.submit_button"
              className="flex-1 font-bold"
              style={{ backgroundColor: "#f97316", color: "white" }}
              disabled={placeOrder.isPending}
              onClick={handlePlaceOrder}
            >
              {placeOrder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
