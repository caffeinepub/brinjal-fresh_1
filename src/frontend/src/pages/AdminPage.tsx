import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  Lock,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Order, Product } from "../backend";
import {
  useAddProduct,
  useDeleteOrder,
  useDeleteProduct,
  useDeliveryTiming,
  useDiscount,
  useFeedbacks,
  useOrders,
  useProducts,
  useSetDeliveryTiming,
  useSetDiscount,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const ADMIN_PASSWORD = "adita96319";
const ADMIN_LS_KEY = "brinjal_admin_auth";

// ─── Password Gate ─────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (pwd !== ADMIN_PASSWORD) {
      setError("Incorrect password. Please try again.");
      return;
    }
    localStorage.setItem(ADMIN_LS_KEY, "true");
    onSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-foreground">
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the admin password to access.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="admin-pwd">Admin Password</Label>
          <div className="relative">
            <Input
              id="admin-pwd"
              data-ocid="admin.password.input"
              type={showPwd ? "text" : "password"}
              placeholder="Enter admin password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p
            data-ocid="admin.password.error_state"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!pwd}
          className="w-full"
          data-ocid="admin.password.submit_button"
        >
          Access Admin Panel
        </Button>
      </div>
    </div>
  );
}

// ─── Product Form ───────────────────────────────────────────────────────────

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  imageId: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  category: "",
  price: "",
  stock: "",
  imageId: "",
};

function ProductFormDialog({
  open,
  onClose,
  initial,
  productId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ProductFormData;
  productId?: bigint;
}) {
  const storageClient = useStorageClient(undefined);
  const [form, setForm] = useState<ProductFormData>(initial ?? EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const isEdit = productId !== undefined;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storageClient) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      setForm((f) => ({ ...f, imageId: hash }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error("Name, price and stock are required.");
      return;
    }
    try {
      if (isEdit) {
        await updateProduct.mutateAsync({
          id: productId,
          name: form.name,
          price: BigInt(form.price),
          stock: BigInt(form.stock),
          imageId: form.imageId,
          category: form.category,
        });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync({
          name: form.name,
          price: BigInt(form.price),
          stock: BigInt(form.stock),
          imageId: form.imageId,
          category: form.category,
        });
        toast.success("Product added!");
      }
      onClose();
    } catch {
      toast.error("Failed to save product.");
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="admin.product.dialog"
        className="max-w-sm mx-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input
              data-ocid="admin.product.input"
              placeholder="e.g. Fresh Brinjal"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              data-ocid="admin.product.input"
              placeholder="e.g. Vegetables"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input
                data-ocid="admin.product.input"
                type="number"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock (kg/units)</Label>
              <Input
                data-ocid="admin.product.input"
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Product Image</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              type="button"
              className="w-full"
              disabled={uploading || !storageClient}
              onClick={() => fileRef.current?.click()}
              data-ocid="admin.product.upload_button"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {form.imageId ? "Change Image" : "Upload Image"}
                </>
              )}
            </Button>
            {form.imageId && (
              <p className="text-xs text-muted-foreground truncate">
                ✓ Image ready
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.product.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-ocid="admin.product.save_button"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Products Tab ───────────────────────────────────────────────────────────

function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-foreground">
          Products
        </h3>
        <Button
          size="sm"
          onClick={handleAdd}
          data-ocid="admin.product.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="admin.product.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`sk-${i}`} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !products?.length ? (
        <div
          data-ocid="admin.product.empty_state"
          className="text-center py-12"
        >
          <Leaf className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No products yet. Add your first product!
          </p>
        </div>
      ) : (
        <div data-ocid="admin.product.list" className="space-y-2">
          {products.map((p, idx) => (
            <div
              key={p.id.toString()}
              data-ocid={`admin.product.item.${idx + 1}`}
              className="bg-card rounded-lg shadow-card p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-primary font-bold">
                    ₹{p.price.toString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {p.stock.toString()}
                  </span>
                  {p.category && (
                    <Badge variant="secondary" className="text-xs py-0">
                      {p.category}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(p)}
                  data-ocid={`admin.product.edit_button.${idx + 1}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      data-ocid={`admin.product.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.product.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{p.name}"? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="admin.product.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(p.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="admin.product.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProduct(null);
        }}
        initial={
          editProduct
            ? {
                name: editProduct.name,
                category: editProduct.category,
                price: editProduct.price.toString(),
                stock: editProduct.stock.toString(),
                imageId: editProduct.imageId,
              }
            : undefined
        }
        productId={editProduct?.id}
      />
    </div>
  );
}

// ─── Orders Tab ─────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatOrderDate(ts: bigint) {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderCard({
  order,
  idx,
  showDate,
}: {
  order: Order;
  idx: number;
  showDate?: boolean;
}) {
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const statusColors: Record<string, string> = {
    pending: "bg-accent/20 text-accent-foreground",
    confirmed: "bg-primary/15 text-primary",
    delivered: "bg-secondary text-secondary-foreground",
  };

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted.");
    } catch {
      toast.error("Failed to delete order.");
    }
  };

  return (
    <div
      data-ocid={`admin.order.item.${idx + 1}`}
      className="bg-card rounded-lg shadow-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-card-foreground">
            {order.customerName}
          </p>
          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order.customerAddress}
          </p>
          {showDate && (
            <div className="flex items-center gap-1 mt-1">
              <CalendarDays className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                {formatOrderDate(order.createdAt)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-bold text-sm text-primary">
            ₹{order.totalAmount.toString()}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              statusColors[order.status] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-2 space-y-1">
        {order.items.map((item, iIdx) => (
          <div
            key={`${item.productId.toString()}-${iIdx}`}
            className="flex justify-between text-xs text-muted-foreground"
          >
            <span>
              {item.productName} × {item.quantity.toString()}
            </span>
            <span>₹{(item.price * item.quantity).toString()}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {order.paymentMethod}
        </span>
        <div className="flex items-center gap-2">
          {order.status === "delivered" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  data-ocid={`admin.order.delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this delivered order from{" "}
                    <strong>{order.customerName}</strong>? This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="admin.order.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="admin.order.confirm_button"
                  >
                    {deleteOrder.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Select
            value={order.status}
            onValueChange={async (v) => {
              try {
                await updateStatus.mutateAsync({
                  orderId: order.id,
                  status: v,
                });
                toast.success("Status updated.");
              } catch {
                toast.error("Failed to update status.");
              }
            }}
          >
            <SelectTrigger
              className="w-36 h-8 text-xs"
              data-ocid={`admin.order.select.${idx + 1}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-bold text-primary uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs bg-primary/10 text-primary font-semibold rounded-full px-2 py-0.5">
        {count}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">
          Orders
        </h3>
        <div data-ocid="admin.order.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`sk-${i}`} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">
          Orders
        </h3>
        <div data-ocid="admin.order.empty_state" className="text-center py-12">
          <ClipboardList className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders: Order[] = [];
  const yesterdayOrders: Order[] = [];
  const pastOrders: Order[] = [];

  for (const order of orders) {
    const orderDate = new Date(Number(order.createdAt / 1_000_000n));
    if (isSameDay(orderDate, now)) {
      todayOrders.push(order);
    } else if (isSameDay(orderDate, yesterday)) {
      yesterdayOrders.push(order);
    } else {
      pastOrders.push(order);
    }
  }

  // Sort each group newest-first
  const sortDesc = (a: Order, b: Order) =>
    Number(
      b.createdAt - a.createdAt > 0n
        ? 1n
        : b.createdAt - a.createdAt < 0n
          ? -1n
          : 0n,
    );

  todayOrders.sort(sortDesc);
  yesterdayOrders.sort(sortDesc);
  pastOrders.sort(sortDesc);

  // Build a flat list for deterministic idx
  const allGrouped = [...todayOrders, ...yesterdayOrders, ...pastOrders];

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">Orders</h3>

      <div data-ocid="admin.order.list" className="space-y-3">
        {todayOrders.length > 0 && (
          <>
            <SectionHeader label="Today" count={todayOrders.length} />
            {todayOrders.map((order) => (
              <OrderCard
                key={order.id.toString()}
                order={order}
                idx={allGrouped.indexOf(order)}
                showDate={false}
              />
            ))}
          </>
        )}

        {yesterdayOrders.length > 0 && (
          <>
            <SectionHeader label="Yesterday" count={yesterdayOrders.length} />
            {yesterdayOrders.map((order) => (
              <OrderCard
                key={order.id.toString()}
                order={order}
                idx={allGrouped.indexOf(order)}
                showDate={false}
              />
            ))}
          </>
        )}

        {pastOrders.length > 0 && (
          <>
            <SectionHeader label="Past Orders" count={pastOrders.length} />
            {pastOrders.map((order) => (
              <OrderCard
                key={order.id.toString()}
                order={order}
                idx={allGrouped.indexOf(order)}
                showDate={true}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Delivery Timing Tab ────────────────────────────────────────────────────

function DeliveryTimingTab() {
  const { data: current } = useDeliveryTiming();
  const [timing, setTiming] = useState("");
  const setDelivery = useSetDeliveryTiming();

  useState(() => {
    if (current !== undefined) setTiming(current);
  });

  const handleSave = async () => {
    try {
      await setDelivery.mutateAsync(timing);
      toast.success("Delivery timing updated!");
    } catch {
      toast.error("Failed to update timing.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">
        Delivery Timing
      </h3>
      <p className="text-sm text-muted-foreground">
        This message will appear on the shop page below the search bar.
      </p>
      <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
        <div className="space-y-1.5">
          <Label>Timing Message</Label>
          <Input
            data-ocid="admin.delivery.input"
            placeholder="e.g. Delivery between 9 AM – 6 PM daily"
            value={timing || current || ""}
            onChange={(e) => setTiming(e.target.value)}
          />
        </div>
        {current && (
          <div className="bg-muted rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Current:{" "}
              <span className="text-foreground font-medium">{current}</span>
            </p>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={setDelivery.isPending}
          className="w-full"
          data-ocid="admin.delivery.save_button"
        >
          {setDelivery.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {setDelivery.isPending ? "Saving..." : "Save Timing"}
        </Button>
      </div>
    </div>
  );
}

// ─── Discount Tab ───────────────────────────────────────────────────────────

function parseDiscount(raw: string): { pct: number; minOrder: number } | null {
  if (!raw) return null;
  const parts = raw.split("|");
  if (parts.length !== 2) return null;
  const pct = Number(parts[0]);
  const minOrder = Number(parts[1]);
  if (Number.isNaN(pct) || Number.isNaN(minOrder) || pct <= 0) return null;
  return { pct, minOrder };
}

function DiscountTab() {
  const { data: current } = useDiscount();
  const [pct, setPct] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const setDiscountMutation = useSetDiscount();

  const parsed = parseDiscount(current ?? "");
  const effectivePct = pct || (parsed ? String(parsed.pct) : "");
  const effectiveMin = minOrder || (parsed ? String(parsed.minOrder) : "");

  const previewText =
    effectivePct && effectiveMin
      ? `${effectivePct}% off on orders of ₹${effectiveMin} and above`
      : "";

  const handleSave = async () => {
    const p = Number(effectivePct);
    const m = Number(effectiveMin);
    if (!p || !m || p <= 0 || m < 0) {
      toast.error("Please enter valid discount % and minimum order amount.");
      return;
    }
    try {
      await setDiscountMutation.mutateAsync(`${p}|${m}`);
      toast.success("Discount updated!");
    } catch {
      toast.error("Failed to update discount.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">
        Discount
      </h3>
      <p className="text-sm text-muted-foreground">
        Set a percentage discount that applies when the order total meets the
        minimum amount.
      </p>
      <div className="bg-card rounded-lg shadow-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Discount %</Label>
            <Input
              data-ocid="admin.discount.input"
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 10"
              value={effectivePct}
              onChange={(e) => setPct(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Minimum Order (₹)</Label>
            <Input
              data-ocid="admin.discount.input"
              type="number"
              min="0"
              placeholder="e.g. 300"
              value={effectiveMin}
              onChange={(e) => setMinOrder(e.target.value)}
            />
          </div>
        </div>
        {previewText && (
          <div className="bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
            <p className="text-xs font-semibold text-primary">
              Preview: 🎉 {previewText}
            </p>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={setDiscountMutation.isPending}
          className="w-full"
          data-ocid="admin.discount.save_button"
        >
          {setDiscountMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {setDiscountMutation.isPending ? "Saving..." : "Save Discount"}
        </Button>
      </div>
    </div>
  );
}

// ─── Feedback Tab ────────────────────────────────────────────────────────────

function FeedbackTab() {
  const { data: feedbacks, isLoading } = useFeedbacks();

  const formatDate = (ts: bigint) => {
    // ts is nanoseconds from IC
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-foreground">
        Customer Feedback
      </h3>
      {isLoading ? (
        <div data-ocid="admin.feedback.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`sk-${i}`} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !feedbacks?.length ? (
        <div
          data-ocid="admin.feedback.empty_state"
          className="text-center py-12"
        >
          <MessageSquare className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No feedback received yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb, idx) => (
            <div
              key={fb.id.toString()}
              data-ocid={`admin.feedback.item.${idx + 1}`}
              className="bg-card rounded-lg shadow-card p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm text-card-foreground">
                  {fb.customerName}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(fb.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel (authenticated) ────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-primary-foreground">
            Admin Dashboard
          </p>
          <p className="text-xs text-primary-foreground/70">
            Manage your store
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-xs text-primary-foreground/70 hover:text-primary-foreground underline"
          data-ocid="admin.logout.button"
        >
          Logout
        </button>
      </div>

      <Tabs defaultValue="products" className="flex-1">
        <TabsList className="grid grid-cols-5 w-full rounded-none border-b border-border bg-muted/50 h-auto p-0">
          <TabsTrigger
            value="products"
            className="flex flex-col gap-0.5 py-2.5 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none"
            data-ocid="admin.products.tab"
          >
            <Package className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Products</span>
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex flex-col gap-0.5 py-2.5 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none"
            data-ocid="admin.orders.tab"
          >
            <ClipboardList className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Orders</span>
          </TabsTrigger>
          <TabsTrigger
            value="delivery"
            className="flex flex-col gap-0.5 py-2.5 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none"
            data-ocid="admin.delivery.tab"
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Delivery</span>
          </TabsTrigger>
          <TabsTrigger
            value="discount"
            className="flex flex-col gap-0.5 py-2.5 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none"
            data-ocid="admin.discount.tab"
          >
            <Tag className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Discount</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="flex flex-col gap-0.5 py-2.5 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none"
            data-ocid="admin.feedback.tab"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-semibold">Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="p-4 mt-0">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders" className="p-4 mt-0">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="delivery" className="p-4 mt-0">
          <DeliveryTimingTab />
        </TabsContent>
        <TabsContent value="discount" className="p-4 mt-0">
          <DiscountTab />
        </TabsContent>
        <TabsContent value="feedback" className="p-4 mt-0">
          <FeedbackTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main AdminPage ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(ADMIN_LS_KEY) === "true",
  );

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_LS_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminPanel onLogout={handleLogout} />;
}
