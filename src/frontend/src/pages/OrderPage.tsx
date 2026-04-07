import { Skeleton } from "@/components/ui/skeleton";
import { Package, RefreshCw } from "lucide-react";
import type { Order } from "../backend";
import { useOrdersByPhone } from "../hooks/useQueries";

function formatDate(nanos: bigint): string {
  const ms = Number(nanos) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupOrders(orders: Order[]) {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 86400000;

  const groups: { label: string; orders: Order[] }[] = [
    { label: "Today", orders: [] },
    { label: "Yesterday", orders: [] },
    { label: "Earlier", orders: [] },
  ];

  for (const o of orders) {
    const ts = Number(o.createdAt) / 1_000_000;
    if (ts >= today) groups[0].orders.push(o);
    else if (ts >= yesterday) groups[1].orders.push(o);
    else groups[2].orders.push(o);
  }

  return groups.filter((g) => g.orders.length > 0);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Delivered")
    return (
      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
        ✅ Delivered
      </span>
    );
  if (status === "Cancelled")
    return (
      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
        ❌ Cancelled
      </span>
    );
  return (
    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
      ⏳ Processing
    </span>
  );
}

export default function OrderPage() {
  const phone = localStorage.getItem("brinjal_phone") ?? "";
  const { data: orders, isLoading, refetch } = useOrdersByPhone(phone);

  if (!phone) {
    return (
      <div
        data-ocid="order.empty_state"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center"
      >
        <Package className="w-16 h-16 text-gray-200" />
        <h2 className="font-display font-bold text-xl text-gray-600">
          No Orders Yet
        </h2>
        <p className="text-sm text-gray-400">
          Place an order first to see your order history here.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-3 pt-4">
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} className="h-36 rounded-2xl mb-3" />
        ))}
      </div>
    );
  }

  const grouped = groupOrders(orders ?? []);

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl">
            My Orders
          </h1>
          <p className="text-xs text-gray-500">
            {orders?.length ?? 0} order(s)
          </p>
        </div>
        <button
          type="button"
          data-ocid="order.secondary_button"
          onClick={() => refetch()}
          className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 text-green-700" />
        </button>
      </div>

      {grouped.length === 0 ? (
        <div
          data-ocid="order.empty_state"
          className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center"
        >
          <Package className="w-16 h-16 text-gray-200" />
          <h2 className="font-display font-bold text-xl text-gray-600">
            No Orders Yet
          </h2>
          <p className="text-sm text-gray-400">
            Your orders will appear here once you place them.
          </p>
        </div>
      ) : (
        <div className="px-3 flex flex-col gap-3">
          {grouped.map((group) => (
            <div key={group.label}>
              <h3 className="font-display font-bold text-gray-500 text-xs uppercase tracking-wide mb-2 px-1">
                {group.label}
              </h3>
              <div className="flex flex-col gap-2">
                {group.orders.map((order, idx) => (
                  <div
                    key={order.id.toString()}
                    data-ocid={`order.item.${idx + 1}`}
                    className="bg-white rounded-2xl shadow-card border border-gray-100 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          Order #{Number(order.id)}
                        </p>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-col gap-0.5 mb-2">
                      {order.items.map((item, i) => (
                        <p
                          key={`${order.id}-item-${i}`}
                          className="text-gray-600 text-xs"
                        >
                          {item.productName} &middot; {item.quantityLabel}
                        </p>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </span>
                      <span className="font-black text-green-700 text-base">
                        ₹{Number(order.totalAmount) / 100}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
