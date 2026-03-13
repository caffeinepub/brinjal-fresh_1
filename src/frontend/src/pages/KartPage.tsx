import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useKart } from "../context/KartContext";
import { parseDiscount, useDiscount, usePlaceOrder } from "../hooks/useQueries";

export default function KartPage() {
  const { items, updateQuantity, removeFromKart, clearKart, totalAmount } =
    useKart();
  const { data: discountRaw } = useDiscount();
  const placeOrder = usePlaceOrder();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [ordered, setOrdered] = useState(false);

  const discount = parseDiscount(discountRaw ?? "");
  const subtotal = Number(totalAmount);

  let discountAmount = 0;
  let discountLabel = "";
  if (
    discount &&
    discount.percentage > 0 &&
    subtotal >= discount.minimumAmount
  ) {
    discountAmount = Math.round((subtotal * discount.percentage) / 100);
    discountLabel = `${discount.percentage}% off`;
  }
  if (discount && discount.flatAmount > 0 && subtotal >= discount.flatMinimum) {
    if (discount.flatAmount > discountAmount) {
      discountAmount = discount.flatAmount;
      discountLabel = `₹${discount.flatAmount} off`;
    }
  }
  const finalTotal = subtotal - discountAmount;

  const handlePlaceOrder = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your address");
      return;
    }
    if (items.length === 0) {
      toast.error("Your kart is empty");
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
          // Encode quantityOption into productName so admin can display it
          productName: `${item.product.name} [${item.quantityOption}]`,
          quantity: BigInt(item.quantity),
          price: item.itemPrice,
        })),
      });
      clearKart();
      setOrdered(true);
      toast.success("Order placed successfully! 🎉");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (ordered) {
    return (
      <div
        data-ocid="kart.success_state"
        className="flex flex-col items-center justify-center py-20 px-6 gap-4"
      >
        <span className="text-6xl">🎉</span>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Order Placed!
        </h2>
        <p className="text-muted-foreground text-center text-sm">
          Thank you for your order. We'll deliver it soon!
        </p>
        <Button
          data-ocid="kart.primary_button"
          onClick={() => setOrdered(false)}
          className="mt-2"
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
        className="flex flex-col items-center justify-center py-20 px-6 gap-3"
      >
        <ShoppingCart className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="font-display text-xl font-bold text-muted-foreground">
          Your kart is empty
        </h2>
        <p className="text-sm text-muted-foreground">
          Add vegetables from the Shop tab
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 space-y-4">
      {/* Cart Items */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${item.product.id}-${item.quantityOption}`}
            data-ocid={`kart.item.${idx + 1}`}
            className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-xs"
          >
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-card-foreground truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.quantityOption}
              </p>
              <p className="text-xs font-bold text-primary">
                ₹{Number(item.itemPrice)} each
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-ocid={`kart.item.${idx + 1}`}
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.quantityOption,
                    item.quantity - 1,
                  )
                }
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-5 text-center">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.quantityOption,
                    item.quantity + 1,
                  )
                }
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm">
                ₹{Number(item.itemPrice) * item.quantity}
              </p>
              <button
                type="button"
                data-ocid={`kart.delete_button.${idx + 1}`}
                onClick={() =>
                  removeFromKart(item.product.id, item.quantityOption)
                }
                className="text-destructive mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-card rounded-xl p-4 shadow-xs space-y-2">
        <h3 className="font-display font-bold text-card-foreground">
          Order Summary
        </h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span>Discount ({discountLabel})</span>
            <span>-₹{discountAmount}</span>
          </div>
        )}
        {discount && discountAmount === 0 && (
          <>
            {discount.percentage > 0 && subtotal < discount.minimumAmount && (
              <p className="text-xs text-muted-foreground">
                Add ₹{discount.minimumAmount - subtotal} more for{" "}
                {discount.percentage}% off
              </p>
            )}
            {discount.flatAmount > 0 && subtotal < discount.flatMinimum && (
              <p className="text-xs text-muted-foreground">
                Add ₹{discount.flatMinimum - subtotal} more for ₹
                {discount.flatAmount} off
              </p>
            )}
          </>
        )}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary">₹{finalTotal}</span>
        </div>
      </div>

      {/* Checkout Form */}
      <div className="bg-card rounded-xl p-4 shadow-xs space-y-3">
        <h3 className="font-display font-bold text-card-foreground">
          Delivery Details
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="kart-name" className="text-xs font-semibold">
            Your Name
          </Label>
          <Input
            id="kart-name"
            data-ocid="kart.input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kart-phone" className="text-xs font-semibold">
            Phone Number
          </Label>
          <Input
            id="kart-phone"
            data-ocid="kart.input"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kart-address" className="text-xs font-semibold">
            Delivery Address
          </Label>
          <Textarea
            id="kart-address"
            data-ocid="kart.textarea"
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Payment Method</Label>
          <RadioGroup
            value={payment}
            onValueChange={setPayment}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="Cash on Delivery"
                id="cod"
                data-ocid="kart.radio"
              />
              <Label htmlFor="cod" className="text-sm cursor-pointer">
                Cash on Delivery
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="Online Payment on Delivery"
                id="online"
                data-ocid="kart.radio"
              />
              <Label htmlFor="online" className="text-sm cursor-pointer">
                Online Payment on Delivery
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          data-ocid="kart.submit_button"
          className="w-full font-bold"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={placeOrder.isPending}
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...
            </>
          ) : (
            "Place Order 🛒"
          )}
        </Button>
      </div>
    </div>
  );
}
