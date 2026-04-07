import { Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, Product } from "../backend";
import {
  parseDiscount,
  useAddProduct,
  useDeleteOrder,
  useDeleteProduct,
  useDeliveryTiming,
  useDiscount,
  useOrders,
  useProducts,
  useProfiles,
  useSetDeliveryTiming,
  useSetDiscount,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "LeafyVegetables",
  "RootVegetables",
  "ComboPack",
];
const UNIT_TYPES = ["kg", "piece", "bundle", "packet"];

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

// ─── Product Form ───────────────────────────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  unitType: string;
  productCategory: string;
  imageId: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  unitType: "kg",
  productCategory: "Vegetables",
  imageId: "",
};

const ic =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-gray-600 mb-1">{children}</p>;
}

function ProductForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const storageClient = useStorageClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storageClient) return;
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const { hash } = await storageClient.putFile(new Uint8Array(buffer));
      const imageId = `!caf!${hash}`;
      setForm((f) => ({ ...f, imageId }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="pf-name">
          <FieldLabel>Product Name *</FieldLabel>
        </label>
        <input
          id="pf-name"
          data-ocid="admin.input"
          className={ic}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Fresh Tomato"
        />
      </div>
      <div>
        <label htmlFor="pf-desc">
          <FieldLabel>Description</FieldLabel>
        </label>
        <textarea
          id="pf-desc"
          data-ocid="admin.textarea"
          className={`${ic} resize-none`}
          rows={2}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Short product description"
        />
      </div>
      <div>
        <label htmlFor="pf-price">
          <FieldLabel>Price per unit (₹) *</FieldLabel>
        </label>
        <input
          id="pf-price"
          data-ocid="admin.input"
          className={ic}
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 28"
        />
      </div>
      <div>
        <label htmlFor="pf-stock">
          <FieldLabel>Stock</FieldLabel>
        </label>
        <input
          id="pf-stock"
          data-ocid="admin.input"
          className={ic}
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          placeholder="Available stock"
        />
      </div>
      <div>
        <label htmlFor="pf-unit">
          <FieldLabel>Unit Type</FieldLabel>
        </label>
        <select
          id="pf-unit"
          data-ocid="admin.select"
          className={ic}
          value={form.unitType}
          onChange={(e) => setForm((f) => ({ ...f, unitType: e.target.value }))}
        >
          {UNIT_TYPES.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="pf-cat">
          <FieldLabel>Category</FieldLabel>
        </label>
        <select
          id="pf-cat"
          data-ocid="admin.select"
          className={ic}
          value={form.productCategory}
          onChange={(e) =>
            setForm((f) => ({ ...f, productCategory: e.target.value }))
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>Product Image</FieldLabel>
        <input
          data-ocid="admin.upload_button"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-700 file:text-white"
        />
        {uploading && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            Uploading image...
          </p>
        )}
        {form.imageId && !uploading && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            ✔ Image uploaded
          </p>
        )}
      </div>
      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          data-ocid="admin.save_button"
          disabled={isPending || uploading}
          className="flex-1 bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Product"
          )}
        </button>
        <button
          type="button"
          data-ocid="admin.cancel_button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Admin Tabs ───────────────────────────────────────────────────────────────────────────
type AdminTab =
  | "products"
  | "orders"
  | "delivery"
  | "discount"
  | "profiles"
  | "settings";

function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleSave = async (data: ProductFormData) => {
    const priceInPaise = BigInt(
      Math.round(Number.parseFloat(data.price) * 100),
    );
    const stock = BigInt(Number.parseInt(data.stock || "0"));
    try {
      if (editProduct) {
        await updateProductMutation.mutateAsync({
          id: editProduct.id,
          name: data.name.trim(),
          description: data.description.trim(),
          price: priceInPaise,
          stock,
          imageId: data.imageId || editProduct.imageId,
          unitType: data.unitType,
          productCategory: data.productCategory,
        });
        toast.success("Product updated!");
      } else {
        await addProductMutation.mutateAsync({
          name: data.name.trim(),
          description: data.description.trim(),
          price: priceInPaise,
          stock,
          imageId: data.imageId,
          unitType: data.unitType,
          productCategory: data.productCategory,
        });
        toast.success("Product added!");
      }
      setShowForm(false);
      setEditProduct(null);
    } catch (err) {
      toast.error(`Failed: ${err}`);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      {!showForm && (
        <button
          type="button"
          data-ocid="admin.primary_button"
          onClick={() => {
            setShowForm(true);
            setEditProduct(null);
          }}
          className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-3 rounded-xl text-sm mb-4"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      )}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <h3 className="font-display font-bold text-gray-800 text-sm mb-3">
            {editProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <ProductForm
            initial={
              editProduct
                ? {
                    name: editProduct.name,
                    description: editProduct.description,
                    price: String(Number(editProduct.price) / 100),
                    stock: String(Number(editProduct.stock)),
                    unitType: editProduct.unitType,
                    productCategory: editProduct.productCategory,
                    imageId: editProduct.imageId,
                  }
                : EMPTY_FORM
            }
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditProduct(null);
            }}
            isPending={
              addProductMutation.isPending || updateProductMutation.isPending
            }
          />
        </div>
      )}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-16 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (products ?? []).length === 0 ? (
        <p
          data-ocid="admin.empty_state"
          className="text-center text-gray-400 text-sm py-8"
        >
          No products yet. Add your first product!
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {(products ?? []).map((p: Product, idx: number) => (
            <div
              key={p.id.toString()}
              data-ocid={`admin.item.${idx + 1}`}
              className="bg-white rounded-xl border border-gray-100 shadow-xs p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm line-clamp-1">
                  {p.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {p.productCategory} · {p.unitType} · ₹{Number(p.price) / 100}{" "}
                  · Stock: {Number(p.stock)}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  data-ocid={`admin.edit_button.${idx + 1}`}
                  onClick={() => {
                    setEditProduct(p);
                    setShowForm(true);
                  }}
                  className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  type="button"
                  data-ocid={`admin.delete_button.${idx + 1}`}
                  onClick={() => handleDelete(p.id)}
                  disabled={deleteProductMutation.isPending}
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading, refetch } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteOrderMutation.mutateAsync(id);
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  if (isLoading)
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        Loading orders...
      </div>
    );

  const grouped = groupOrders(orders ?? []);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          data-ocid="admin.secondary_button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-green-700 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      {grouped.length === 0 ? (
        <p
          data-ocid="admin.empty_state"
          className="text-center text-gray-400 text-sm py-8"
        >
          No orders yet
        </p>
      ) : (
        grouped.map((group) => (
          <div key={group.label} className="mb-4">
            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wide mb-2">
              {group.label}
            </h3>
            <div className="flex flex-col gap-3">
              {group.orders.map((order: Order, idx: number) => (
                <div
                  key={order.id.toString()}
                  data-ocid={`admin.item.${idx + 1}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-xs p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Order #{Number(order.id)}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-black text-green-700 text-base">
                      ₹{Number(order.totalAmount) / 100}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold">{order.customerName}</span>{" "}
                    · {order.customerPhone}
                  </div>
                  <div className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {order.customerAddress}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.productId}-${item.quantityLabel}`}
                      >
                        {item.productName} &middot; {item.quantityLabel}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Payment: {order.paymentMethod}
                    {Number(order.discountAmount) > 0 && (
                      <span className="text-green-600 ml-2">
                        Disc: -₹{Number(order.discountAmount) / 100}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      data-ocid={`admin.select.${idx + 1}`}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-green-500"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {order.status === "Delivered" && (
                      <button
                        type="button"
                        data-ocid={`admin.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(order.id)}
                        disabled={deleteOrderMutation.isPending}
                        className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DeliveryTab() {
  const { data: current } = useDeliveryTiming();
  const setDeliveryMutation = useSetDeliveryTiming();
  const [timing, setTiming] = useState("");

  const handleSave = async () => {
    if (!timing.trim()) {
      toast.error("Please enter delivery timing");
      return;
    }
    try {
      await setDeliveryMutation.mutateAsync(timing.trim());
      toast.success("Delivery timing updated!");
      setTiming("");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {current && (
        <div className="bg-green-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 font-semibold mb-0.5">
            Current Timing
          </p>
          <p className="text-green-700 font-bold text-sm">{current}</p>
        </div>
      )}
      <div>
        <label htmlFor="delivery-timing">
          <FieldLabel>New Delivery Timing</FieldLabel>
        </label>
        <input
          id="delivery-timing"
          data-ocid="admin.input"
          type="text"
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          placeholder="e.g. 10 AM – 6 PM"
          className={ic}
        />
      </div>
      <button
        type="button"
        data-ocid="admin.save_button"
        onClick={handleSave}
        disabled={setDeliveryMutation.isPending}
        className="w-full bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {setDeliveryMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Delivery Timing"
        )}
      </button>
    </div>
  );
}

function DiscountTab() {
  const { data: discountRaw } = useDiscount();
  const setDiscountMutation = useSetDiscount();
  const current = parseDiscount(discountRaw ?? "");

  const [pct, setPct] = useState(String(current?.percentage ?? ""));
  const [pctMin, setPctMin] = useState(String(current?.minimumAmount ?? ""));
  const [flat, setFlat] = useState(String(current?.flatAmount ?? ""));
  const [flatMin, setFlatMin] = useState(String(current?.flatMinimum ?? ""));
  const [freeItem, setFreeItem] = useState(current?.freeItem ?? "");
  const [freeItemMin, setFreeItemMin] = useState(
    String(current?.freeItemMinimum ?? ""),
  );

  const handleSave = async () => {
    const payload = JSON.stringify({
      percentage: Number.parseFloat(pct) || 0,
      minimumAmount: Number.parseFloat(pctMin) || 0,
      flatAmount: Number.parseFloat(flat) || 0,
      flatMinimum: Number.parseFloat(flatMin) || 0,
      freeItem: freeItem.trim(),
      freeItemMinimum: Number.parseFloat(freeItemMin) || 0,
    });
    try {
      await setDiscountMutation.mutateAsync(payload);
      toast.success("Discount settings saved!");
    } catch {
      toast.error("Failed to save discount settings");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gray-50 rounded-xl p-3">
        <h4 className="font-display font-bold text-gray-700 text-sm mb-3">
          💰 Percentage Discount
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="d-pct">
              <FieldLabel>% Off</FieldLabel>
            </label>
            <input
              id="d-pct"
              data-ocid="admin.input"
              className={ic}
              type="number"
              min="0"
              max="100"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>
          <div>
            <label htmlFor="d-pctmin">
              <FieldLabel>Min Order (₹)</FieldLabel>
            </label>
            <input
              id="d-pctmin"
              data-ocid="admin.input"
              className={ic}
              type="number"
              min="0"
              value={pctMin}
              onChange={(e) => setPctMin(e.target.value)}
              placeholder="e.g. 300"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3">
        <h4 className="font-display font-bold text-gray-700 text-sm mb-3">
          ₹ Flat Amount Off
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="d-flat">
              <FieldLabel>₹ Off</FieldLabel>
            </label>
            <input
              id="d-flat"
              data-ocid="admin.input"
              className={ic}
              type="number"
              min="0"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label htmlFor="d-flatmin">
              <FieldLabel>Min Order (₹)</FieldLabel>
            </label>
            <input
              id="d-flatmin"
              data-ocid="admin.input"
              className={ic}
              type="number"
              min="0"
              value={flatMin}
              onChange={(e) => setFlatMin(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3">
        <h4 className="font-display font-bold text-gray-700 text-sm mb-3">
          🎁 Free Item Offer
        </h4>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="d-freeitem">
              <FieldLabel>Free Item Name</FieldLabel>
            </label>
            <input
              id="d-freeitem"
              data-ocid="admin.input"
              className={ic}
              value={freeItem}
              onChange={(e) => setFreeItem(e.target.value)}
              placeholder="e.g. 1kg Tomato"
            />
          </div>
          <div>
            <label htmlFor="d-freemin">
              <FieldLabel>Min Order (₹)</FieldLabel>
            </label>
            <input
              id="d-freemin"
              data-ocid="admin.input"
              className={ic}
              type="number"
              min="0"
              value={freeItemMin}
              onChange={(e) => setFreeItemMin(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        data-ocid="admin.save_button"
        onClick={handleSave}
        disabled={setDiscountMutation.isPending}
        className="w-full bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {setDiscountMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save All Discounts"
        )}
      </button>
    </div>
  );
}

function ProfilesTab() {
  const { data: profiles, isLoading } = useProfiles();
  if (isLoading)
    return (
      <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
    );
  if (!profiles || profiles.length === 0)
    return (
      <p
        data-ocid="admin.empty_state"
        className="text-center text-gray-400 text-sm py-8"
      >
        No customer profiles yet
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      {profiles.map((p, idx) => (
        <div
          key={p.phone}
          data-ocid={`admin.item.${idx + 1}`}
          className="bg-white rounded-xl border border-gray-100 shadow-xs p-3"
        >
          <p className="font-bold text-gray-800 text-sm">{p.name}</p>
          <p className="text-gray-500 text-xs">{p.phone}</p>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
            {p.address}
          </p>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-600 font-semibold">🔧 App Settings</p>
      <p className="text-xs text-gray-400 mt-2">
        All key settings are managed through the Delivery, Discount, and
        Products tabs.
      </p>
      <div className="mt-4 bg-white rounded-xl p-3 border border-gray-100">
        <p className="text-xs font-bold text-gray-700">✔ Minimum Order</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Fixed at ₹99 — always shown in hero banner
        </p>
      </div>
      <div className="mt-2 bg-white rounded-xl p-3 border border-gray-100">
        <p className="text-xs font-bold text-gray-700">✔ Hero Banner</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Auto-shows delivery timing, discounts, and free delivery
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "adita96319";

export default function AdminPage({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("brinjal_admin") === "true",
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("brinjal_admin", "true");
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-5xl">🌱</span>
            <h1 className="font-display font-bold text-2xl text-gray-900 mt-3">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your password to continue
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              data-ocid="admin.input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Admin password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500"
            />
            {passwordError && (
              <p
                data-ocid="admin.error_state"
                className="text-red-500 text-xs font-semibold"
              >
                {passwordError}
              </p>
            )}
            <button
              type="button"
              data-ocid="admin.submit_button"
              onClick={handleLogin}
              className="w-full bg-green-700 text-white font-display font-bold py-3.5 rounded-xl text-base"
            >
              Login
            </button>
            <button
              type="button"
              data-ocid="admin.close_button"
              onClick={onClose}
              className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
            >
              ← Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { key: AdminTab; label: string; emoji: string }[] = [
    { key: "products", label: "Products", emoji: "📦" },
    { key: "orders", label: "Orders", emoji: "📋" },
    { key: "delivery", label: "Delivery", emoji: "🚚" },
    { key: "discount", label: "Discount", emoji: "🏷️" },
    { key: "profiles", label: "Profiles", emoji: "👥" },
    { key: "settings", label: "Settings", emoji: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div
        className="sticky top-0 z-40 px-3 py-2 flex items-center justify-between shadow-sm"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #15803d 100%)",
        }}
      >
        <span className="text-white font-display font-bold text-base">
          🔑 Admin Panel
        </span>
        <button
          type="button"
          data-ocid="admin.close_button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-hide border-b border-gray-100">
        <div className="flex px-2 py-1 gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-ocid={`admin.${tab.key}.tab`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-green-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "delivery" && <DeliveryTab />}
        {activeTab === "discount" && <DiscountTab />}
        {activeTab === "profiles" && <ProfilesTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
