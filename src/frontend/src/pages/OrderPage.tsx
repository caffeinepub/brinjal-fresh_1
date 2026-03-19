import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "../backend";
import { useOrdersByPhone } from "../hooks/useQueries";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const d = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const t = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${d} ${t}`;
}

function isToday(ts: bigint): boolean {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(ts: bigint): boolean {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  return (
    d.getFullYear() === yest.getFullYear() &&
    d.getMonth() === yest.getMonth() &&
    d.getDate() === yest.getDate()
  );
}

const STATUS_BADGE: Record<string, string> = {
  processing: "bg-amber-100 text-amber-800",
  pending: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderCard({ order }: { order: Order }) {
  const statusClass = STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm text-gray-800">
            Order #{Number(order.id)}
          </p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass}`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-1">
        {order.items.map((item) => (
          <div
            key={`${String(item.productId)}-${item.productName}`}
            className="text-xs flex items-center justify-between"
          >
            <span className="text-gray-700 font-medium">
              {item.productName}
            </span>
            {item.quantityLabel && (
              <span className="font-bold text-gray-800 ml-2">
                {item.quantityLabel}
              </span>
            )}
            <span className="ml-auto pl-2 text-gray-600">
              ₹{Number(item.itemTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-2 space-y-0.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span>
          <span>₹{Number(order.subtotal)}</span>
        </div>
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-xs text-green-600">
            <span>Discount</span>
            <span>-₹{Number(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span>Total</span>
          <span className="text-green-700">₹{Number(order.totalAmount)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">{order.paymentMethod}</p>
    </div>
  );
}

function OrderGroup({ title, orders }: { title: string; orders: Order[] }) {
  if (orders.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-display font-bold text-xs text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      {orders.map((order) => (
        <OrderCard key={order.id.toString()} order={order} />
      ))}
    </div>
  );
}

export default function OrderPage() {
  const [phone, setPhone] = useState(
    () => localStorage.getItem("brinjal_phone") ?? "",
  );

  // Auto-update phone if it gets saved later
  useEffect(() => {
    const saved = localStorage.getItem("brinjal_phone") ?? "";
    setPhone(saved);
  }, []);

  const { data: orders, isLoading } = useOrdersByPhone(phone);

  if (!phone) {
    return (
      <div
        data-ocid="orders.empty_state"
        className="flex flex-col items-center justify-center py-20 px-6 gap-4"
      >
        <Package className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="font-display text-xl font-bold text-gray-700">
          No Orders Yet
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Place your first order to see your orders here
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-ocid="orders.loading_state"
        className="flex items-center justify-center py-20"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        data-ocid="orders.empty_state"
        className="flex flex-col items-center justify-center py-20 px-6 gap-4"
      >
        <Package className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="font-display text-xl font-bold text-gray-700">
          No Orders Yet
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Place your first order to see your orders here
        </p>
      </div>
    );
  }

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const yesterdayOrders = orders.filter((o) => isYesterday(o.createdAt));
  const pastOrders = orders.filter(
    (o) => !isToday(o.createdAt) && !isYesterday(o.createdAt),
  );

  return (
    <div className="px-3 py-4 space-y-4">
      <h2 className="font-display font-bold text-gray-800 text-lg">
        My Orders
      </h2>
      <OrderGroup title="Today" orders={todayOrders} />
      <OrderGroup title="Yesterday" orders={yesterdayOrders} />
      <OrderGroup title="Past Orders" orders={pastOrders} />
    </div>
  );
}
