import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductImage } from "../components/ProductCard";
import {
  buildQuantityLabel,
  getOptionPrice,
  useKart,
} from "../context/KartContext";
import {
  parseDiscount,
  useDiscount,
  usePlaceOrder,
  useSaveProfile,
} from "../hooks/useQueries";

const MIN_ORDER = 99;

export default function KartPage() {
  const { items, removeFromKart, updateQuantity, clearKart, totalAmount } =
    useKart();
  const { data: discountRaw } = useDiscount();
  const discount = parseDiscount(discountRaw ?? null);
  const placeOrderMutation = usePlaceOrder();
  const saveProfileMutation = useSaveProfile();

  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState(
    () => localStorage.getItem("brinjal_name") ?? "",
  );
  const [phone, setPhone] = useState(
    () => localStorage.getItem("brinjal_phone") ?? "",
  );
  const [address, setAddress] = useState(
    () => localStorage.getItem("brinjal_address") ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = Number(totalAmount) / 100;

  let discountAmount = 0;
  let discountLabel = "";
  let freeItemMessage = "";

  if (discount) {
    if (
      discount.percentage > 0 &&
      discount.minimumAmount > 0 &&
      subtotal >= discount.minimumAmount
    ) {
      const saved = Math.floor((subtotal * discount.percentage) / 100);
      if (saved > discountAmount) {
        discountAmount = saved;
        discountLabel = `${discount.percentage}% OFF`;
      }
    }
    if (
      discount.flatAmount > 0 &&
      discount.flatMinimum > 0 &&
      subtotal >= discount.flatMinimum
    ) {
      if (discount.flatAmount > discountAmount) {
        discountAmount = discount.flatAmount;
        discountLabel = `₹${discount.flatAmount} OFF`;
      }
    }
    if (
      discount.freeItem &&
      discount.freeItemMinimum > 0 &&
      subtotal >= discount.freeItemMinimum
    ) {
      freeItemMessage = `🎁 You get FREE ${discount.freeItem}!`;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (total < MIN_ORDER) {
      toast.error(`Minimum order is ₹${MIN_ORDER}`);
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantityLabel: buildQuantityLabel(item.quantityOption, item.quantity),
      unitPrice: getOptionPrice(item.product.price, item.quantityOption),
      itemTotal:
        getOptionPrice(item.product.price, item.quantityOption) *
        BigInt(item.quantity),
    }));

    try {
      await placeOrderMutation.mutateAsync({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        paymentMethod,
        items: orderItems,
        subtotal: BigInt(Math.round(subtotal * 100)),
        discountAmount: BigInt(Math.round(discountAmount * 100)),
        discountType: discountLabel,
        freeItem: freeItemMessage,
        totalAmount: BigInt(Math.round(total * 100)),
      });

      localStorage.setItem("brinjal_name", name.trim());
      localStorage.setItem("brinjal_phone", phone.trim());
      localStorage.setItem("brinjal_address", address.trim());

      try {
        await saveProfileMutation.mutateAsync({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });
      } catch {
        // non-critical
      }

      clearKart();
      setOrderPlaced(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (orderPlaced) {
    return (
      <div
        data-ocid="cart.success_state"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="font-display font-bold text-xl text-green-800">
          Order Placed!
        </h2>
        <p className="text-sm text-gray-600">
          Your order has been placed. Track it in the Orders tab.
        </p>
        <button
          type="button"
          data-ocid="cart.continue.button"
          onClick={() => setOrderPlaced(false)}
          className="mt-2 bg-green-700 text-white font-bold py-3 px-8 rounded-xl"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-ocid="cart.empty_state"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-700">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-400">
          Add some fresh vegetables to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display font-bold text-gray-900 text-xl">
          Your Cart
        </h1>
        <p className="text-xs text-gray-500">
          {items.reduce((s, i) => s + i.quantity, 0)} item(s)
        </p>
      </div>

      {/* Cart items */}
      <div className="px-3 flex flex-col gap-2 mb-3">
        {items.map((item, idx) => {
          const basePrice =
            Number(getOptionPrice(item.product.price, item.quantityOption)) /
            100;
          const itemTotal = basePrice * item.quantity;
          return (
            <div
              key={`${item.product.id}-${item.quantityOption}`}
              data-ocid={`cart.item.${idx + 1}`}
              className="bg-white rounded-2xl shadow-card border border-gray-100 p-3 flex items-start gap-3"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <ProductImage
                  imageId={item.product.imageId}
                  className="w-full h-full rounded-xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {item.quantityOption} &middot; ₹{basePrice}/
                  {item.quantityOption}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-ocid={`cart.secondary_button.${idx + 1}`}
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantityOption,
                          item.quantity - 1,
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="font-bold text-sm w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      data-ocid={`cart.primary_button.${idx + 1}`}
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantityOption,
                          item.quantity + 1,
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <span className="font-black text-green-700 text-base">
                    ₹{itemTotal}
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-ocid={`cart.delete_button.${idx + 1}`}
                onClick={() =>
                  removeFromKart(item.product.id, item.quantityOption)
                }
                className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bill summary */}
      <div className="mx-3 bg-white rounded-2xl shadow-card border border-gray-100 p-4 mb-3">
        <h3 className="font-display font-bold text-gray-800 text-sm mb-3">
          Bill Summary
        </h3>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-semibold">
              <span>{discountLabel}</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-blue-600">
            <span>Delivery</span>
            <span className="font-bold">FREE</span>
          </div>
          {freeItemMessage && (
            <div className="bg-green-50 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold">
              {freeItemMessage}
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between">
            <span className="font-display font-bold text-gray-900">Total</span>
            <span className="font-black text-green-700 text-lg">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
        {total < MIN_ORDER && (
          <p
            data-ocid="cart.error_state"
            className="text-xs text-red-500 mt-2 font-semibold"
          >
            Minimum order is ₹{MIN_ORDER}. Add ₹{(MIN_ORDER - total).toFixed(0)}{" "}
            more.
          </p>
        )}
      </div>

      {/* Checkout */}
      {showCheckout ? (
        <div
          data-ocid="cart.modal"
          className="mx-3 bg-white rounded-2xl shadow-card border border-gray-100 p-4 mb-4"
        >
          <h3 className="font-display font-bold text-gray-800 text-sm mb-3">
            Delivery Details
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="checkout-name"
                className="text-xs font-bold text-gray-600 mb-1 block"
              >
                Name *
              </label>
              <input
                id="checkout-name"
                data-ocid="cart.input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-phone"
                className="text-xs font-bold text-gray-600 mb-1 block"
              >
                Phone *
              </label>
              <input
                id="checkout-phone"
                data-ocid="cart.input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="checkout-address"
                className="text-xs font-bold text-gray-600 mb-1 block"
              >
                Address *
              </label>
              <textarea
                id="checkout-address"
                data-ocid="cart.textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full delivery address"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5">
                Payment Method
              </p>
              <div className="flex flex-col gap-2">
                {["Cash on Delivery", "Online Payment on Delivery"].map(
                  (method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <input
                        data-ocid="cart.radio"
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-green-700"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {method}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>
            <button
              type="button"
              data-ocid="cart.submit_button"
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isPending || total < MIN_ORDER}
              className="w-full bg-green-700 text-white font-display font-bold py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {placeOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                </>
              ) : (
                `Place Order • ₹${total.toFixed(2)}`
              )}
            </button>
            <button
              type="button"
              data-ocid="cart.cancel_button"
              onClick={() => setShowCheckout(false)}
              className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-3">
          <button
            type="button"
            data-ocid="cart.primary_button"
            onClick={() => setShowCheckout(true)}
            disabled={total < MIN_ORDER}
            className="w-full bg-green-700 text-white font-display font-bold py-3.5 rounded-xl text-base disabled:opacity-50"
          >
            Proceed to Checkout • ₹{total.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
}
