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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Package,
  Pencil,
  Plus,
  Settings,
  Tag,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CustomerProfile, Order, Product } from "../backend";
import {
  parseDiscount,
  useAddProduct,
  useBannerEnabled,
  useBannerText,
  useDeleteOrder,
  useDeleteProduct,
  useDeliveryTiming,
  useDiscount,
  useMinimumOrder,
  useOrders,
  useProducts,
  useProfiles,
  useSetBannerEnabled,
  useSetBannerText,
  useSetDeliveryTiming,
  useSetDiscount,
  useSetMinimumOrder,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

const ADMIN_PASSWORD = "adita96319";

type UnitType = "kg" | "piece" | "bundle" | "packet";

const UNIT_LABELS: Record<UnitType, string> = {
  kg: "Weight (kg)",
  piece: "By Piece",
  bundle: "By Bundle",
  packet: "By Packet",
};

const PRICE_LABELS: Record<UnitType, string> = {
  kg: "Price per kg (₹)",
  piece: "Price per piece (₹)",
  bundle: "Price per bundle (₹)",
  packet: "Price per packet (₹)",
};

const PRODUCT_CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Leafy Vegetables",
  "Root Vegetables",
  "Combo Pack",
];

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (pwd !== ADMIN_PASSWORD) {
      setError("Incorrect password.");
      return;
    }
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
          Enter password to access.
        </p>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="admin-pwd" className="text-xs font-semibold">
            Password
          </Label>
          <div className="relative">
            <Input
              id="admin-pwd"
              data-ocid="admin.input"
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
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {error && (
            <p
              data-ocid="admin.error_state"
              className="text-xs text-destructive"
            >
              {error}
            </p>
          )}
        </div>
        <Button
          data-ocid="admin.submit_button"
          className="w-full font-bold"
          onClick={handleSubmit}
        >
          Login
        </Button>
      </div>
    </div>
  );
}

// ─── Product Image (uses storageClient) ────────────────────────────────────────
function ProductThumb({ imageId }: { imageId: string }) {
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
      <div className="w-full h-full flex items-center justify-center text-xl">
        🥦
      </div>
    );
  }
  return <img src={url} alt="product" className="w-full h-full object-cover" />;
}

// ─── Product Form ─────────────────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  description: string;
  unitType: UnitType;
  productCategory: string;
  price: string;
  stock: string;
  imageId: string;
}

const defaultForm = (): ProductFormData => ({
  name: "",
  description: "",
  unitType: "kg",
  productCategory: "Vegetables",
  price: "",
  stock: "",
  imageId: "",
});

function ProductForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProductFormData>(initial ?? defaultForm());
  const storageClient = useStorageClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storageClient) return;
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const { hash } = await storageClient.putFile(uint8);
      setForm((prev) => ({ ...prev, imageId: hash }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Product Name</Label>
        <Input
          data-ocid="admin.products.input"
          placeholder="e.g. Fresh Tomatoes"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Short Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          data-ocid="admin.products.input"
          placeholder="e.g. Fresh red tomato"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          maxLength={60}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Category</Label>
        <Select
          value={form.productCategory}
          onValueChange={(v) => setForm((p) => ({ ...p, productCategory: v }))}
        >
          <SelectTrigger data-ocid="admin.products.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Unit Type</Label>
        <Select
          value={form.unitType}
          onValueChange={(v) =>
            setForm((p) => ({ ...p, unitType: v as UnitType }))
          }
        >
          <SelectTrigger data-ocid="admin.products.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(UNIT_LABELS) as [UnitType, string][]).map(
              ([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          {PRICE_LABELS[form.unitType]}
        </Label>
        <Input
          data-ocid="admin.products.input"
          type="number"
          placeholder="0"
          value={form.price}
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Stock</Label>
        <Input
          data-ocid="admin.products.input"
          type="number"
          placeholder="0"
          value={form.stock}
          onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Product Image</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          type="button"
          data-ocid="admin.products.upload_button"
          variant="outline"
          className="w-full"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !storageClient}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />{" "}
              {form.imageId ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
        {form.imageId && (
          <p className="text-xs text-primary font-medium">✓ Image uploaded</p>
        )}
      </div>

      <DialogFooter className="pt-2 gap-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.products.cancel_button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          data-ocid="admin.products.save_button"
          onClick={() => onSave(form)}
          disabled={isSaving || uploading}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Product"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const { data: products, isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleAdd = async (data: ProductFormData) => {
    if (!data.name || !data.price || !data.stock) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: data.name.trim(),
        description: data.description.trim(),
        price: BigInt(Math.round(Number(data.price))),
        stock: BigInt(Math.round(Number(data.stock))),
        imageId: data.imageId,
        unitType: data.unitType,
        productCategory: data.productCategory,
      });
      setShowAdd(false);
      toast.success("Product added!");
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editProduct.id,
        name: data.name.trim(),
        description: data.description.trim(),
        price: BigInt(Math.round(Number(data.price))),
        stock: BigInt(Math.round(Number(data.stock))),
        imageId: data.imageId,
        unitType: data.unitType,
        productCategory: data.productCategory,
      });
      setEditProduct(null);
      toast.success("Product updated!");
    } catch {
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        data-ocid="admin.products.open_modal_button"
        className="w-full font-bold"
        onClick={() => setShowAdd(true)}
      >
        <Plus className="w-4 h-4 mr-2" /> Add New Product
      </Button>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            isSaving={addProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
      >
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              initial={{
                name: editProduct.name || "",
                description: editProduct.description || "",
                unitType: (editProduct.unitType as UnitType) || "kg",
                productCategory: editProduct.productCategory || "Vegetables",
                price: String(Number(editProduct.price)),
                stock: String(Number(editProduct.stock)),
                imageId: editProduct.imageId,
              }}
              onSave={handleEdit}
              onCancel={() => setEditProduct(null)}
              isSaving={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div data-ocid="admin.products.loading_state" className="space-y-2">
          {["p1", "p2", "p3"].map((k) => (
            <Skeleton key={k} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !products?.length ? (
        <div
          data-ocid="admin.products.empty_state"
          className="text-center py-12"
        >
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            No products yet. Add your first product!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product: Product, idx: number) => (
            <div
              key={product.id.toString()}
              data-ocid={`admin.products.item.${idx + 1}`}
              className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-xs"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                <ProductThumb imageId={product.imageId} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm truncate">
                  {product.name}
                </p>
                {product.description && (
                  <p className="text-xs text-muted-foreground italic truncate">
                    {product.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  ₹{Number(product.price)}/{product.unitType || "kg"} •{" "}
                  {product.productCategory} • Stock: {Number(product.stock)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="icon"
                  variant="outline"
                  data-ocid={`admin.products.edit_button.${idx + 1}`}
                  className="w-8 h-8"
                  onClick={() => setEditProduct(product)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      data-ocid={`admin.products.delete_button.${idx + 1}`}
                      className="w-8 h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.name}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="admin.products.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid="admin.products.confirm_button"
                        onClick={() => {
                          deleteProduct.mutate(product.id);
                          toast.success("Product deleted");
                        }}
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
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function formatOrderDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isSameDay(ts: bigint, ref: Date): boolean {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderCard({ order, idx }: { order: Order; idx: number }) {
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const statusColor =
    STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800";

  return (
    <div
      data-ocid={`admin.orders.item.${idx + 1}`}
      className="bg-card rounded-xl p-4 shadow-xs space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-bold text-sm">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
        >
          {order.status}
        </span>
      </div>

      <div className="text-xs text-muted-foreground">
        {order.customerAddress}
      </div>

      {/* Order items */}
      <div className="space-y-1">
        {order.items.map((item) => (
          <div
            key={`${String(item.productId)}-${item.productName}`}
            className="text-xs flex items-center justify-between"
          >
            <span className="font-medium">{item.productName}</span>
            {item.quantityLabel && (
              <span className="font-bold text-foreground ml-2">
                {item.quantityLabel}
              </span>
            )}
            <span className="ml-auto pl-2">₹{Number(item.itemTotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
          {Number(order.discountAmount) > 0 && (
            <p className="text-xs text-green-600">
              Discount: -₹{Number(order.discountAmount)}
            </p>
          )}
          <p className="font-bold text-sm">
            Total: ₹{Number(order.totalAmount)}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatOrderDate(order.createdAt)}
        </div>
      </div>

      <div className="flex gap-2">
        <Select
          value={order.status}
          onValueChange={(s) =>
            updateStatus.mutate({ orderId: order.id, status: s })
          }
        >
          <SelectTrigger
            data-ocid={`admin.orders.select.${idx + 1}`}
            className="h-8 text-xs flex-1"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["pending", "processing", "delivered", "cancelled"].map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {order.status === "delivered" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                data-ocid={`admin.orders.delete_button.${idx + 1}`}
                className="h-8"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete this delivered order from {order.customerName}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="admin.orders.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="admin.orders.confirm_button"
                  onClick={() => deleteOrder.mutate(order.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useOrders();

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders = (orders ?? []).filter((o: Order) =>
    isSameDay(o.createdAt, now),
  );
  const yesterdayOrders = (orders ?? []).filter((o: Order) =>
    isSameDay(o.createdAt, yesterday),
  );
  const pastOrders = (orders ?? []).filter(
    (o: Order) =>
      !isSameDay(o.createdAt, now) && !isSameDay(o.createdAt, yesterday),
  );

  const renderGroup = (title: string, group: Order[], startIdx: number) => {
    if (group.length === 0) return null;
    return (
      <div className="space-y-2">
        <h3 className="font-display font-bold text-sm text-foreground/70 uppercase tracking-wide">
          {title}
        </h3>
        {group.map((order: Order, i: number) => (
          <OrderCard
            key={order.id.toString()}
            order={order}
            idx={startIdx + i}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div data-ocid="admin.orders.loading_state" className="space-y-2">
        {["o1", "o2", "o3"].map((k) => (
          <Skeleton key={k} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div data-ocid="admin.orders.empty_state" className="text-center py-12">
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderGroup("Today", todayOrders, 0)}
      {renderGroup("Yesterday", yesterdayOrders, todayOrders.length)}
      {renderGroup(
        "Past",
        pastOrders,
        todayOrders.length + yesterdayOrders.length,
      )}
    </div>
  );
}

// ─── Delivery Tab ─────────────────────────────────────────────────────────────
function DeliveryTab() {
  const { data: currentTiming } = useDeliveryTiming();
  const setTiming = useSetDeliveryTiming();
  const [value, setValue] = useState("");

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error("Please enter delivery timing");
      return;
    }
    try {
      await setTiming.mutateAsync(value.trim());
      toast.success("Delivery timing updated!");
      setValue("");
    } catch {
      toast.error("Failed to update timing");
    }
  };

  return (
    <div className="space-y-4">
      {currentTiming && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Current Timing
          </p>
          <p className="font-display font-bold text-foreground">
            {currentTiming}
          </p>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">New Delivery Timing</Label>
        <Input
          data-ocid="admin.delivery.input"
          placeholder="e.g. 9 AM - 1 PM"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button
        data-ocid="admin.delivery.save_button"
        className="w-full font-bold"
        onClick={handleSave}
        disabled={setTiming.isPending}
      >
        {setTiming.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          "Save Timing"
        )}
      </Button>
    </div>
  );
}

// ─── Discount Tab ─────────────────────────────────────────────────────────────
function DiscountTab() {
  const { data: discountRaw } = useDiscount();
  const setDiscount = useSetDiscount();

  const parsed = parseDiscount(discountRaw ?? "");
  const [percentage, setPercentage] = useState("");
  const [minimumAmount, setMinimumAmount] = useState("");
  const [flatAmount, setFlatAmount] = useState("");
  const [flatMinimum, setFlatMinimum] = useState("");
  const [freeItem, setFreeItem] = useState("");
  const [freeItemMinimum, setFreeItemMinimum] = useState("");

  const handleSave = async () => {
    const pct = Number(percentage);
    const min = Number(minimumAmount);
    const flat = Number(flatAmount);
    const flatMin = Number(flatMinimum);
    const freeItemValue = freeItem;
    const freeItemMinValue = freeItemMinimum;
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a valid percentage (0-100)");
      return;
    }
    if (Number.isNaN(min) || min < 0) {
      toast.error("Enter a valid minimum amount");
      return;
    }
    if (Number.isNaN(flat) || flat < 0) {
      toast.error("Enter a valid flat amount");
      return;
    }
    if (Number.isNaN(flatMin) || flatMin < 0) {
      toast.error("Enter a valid flat discount minimum");
      return;
    }
    if (freeItemMinValue && Number.isNaN(Number(freeItemMinValue))) {
      toast.error("Enter a valid minimum amount for free item");
      return;
    }
    try {
      await setDiscount.mutateAsync(
        JSON.stringify({
          percentage: pct,
          minimumAmount: min,
          flatAmount: flat,
          flatMinimum: flatMin,
          freeItem: freeItemValue.trim(),
          freeItemMinimum: Number(freeItemMinValue),
        }),
      );
      toast.success("Discount updated!");
      setPercentage("");
      setMinimumAmount("");
      setFlatAmount("");
      setFlatMinimum("");
      setFreeItem("");
      setFreeItemMinimum("");
    } catch {
      toast.error("Failed to update discount");
    }
  };

  return (
    <div className="space-y-4">
      {parsed &&
        (parsed.percentage > 0 || parsed.flatAmount > 0 || parsed.freeItem) && (
          <div className="bg-accent/20 border border-accent/40 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Current Discount
            </p>
            {parsed.percentage > 0 && (
              <p className="font-display font-bold text-accent-foreground">
                {parsed.percentage}% off on orders above ₹{parsed.minimumAmount}
              </p>
            )}
            {parsed.flatAmount > 0 && (
              <p className="font-display font-bold text-accent-foreground">
                ₹{parsed.flatAmount} off on orders above ₹{parsed.flatMinimum}
              </p>
            )}
            {parsed.freeItem && (
              <p className="font-display font-bold text-accent-foreground">
                FREE {parsed.freeItem} on orders above ₹{parsed.freeItemMinimum}
              </p>
            )}
          </div>
        )}

      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Percentage Discount
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Discount Percentage (%)</Label>
        <Input
          data-ocid="admin.discount.input"
          type="number"
          placeholder={parsed ? String(parsed.percentage) : "e.g. 10"}
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          min="0"
          max="100"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Minimum Order Amount (₹)
        </Label>
        <Input
          data-ocid="admin.discount.input"
          type="number"
          placeholder={parsed ? String(parsed.minimumAmount) : "e.g. 300"}
          value={minimumAmount}
          onChange={(e) => setMinimumAmount(e.target.value)}
          min="0"
        />
      </div>

      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Flat Amount Discount
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Flat Amount Off (₹)</Label>
        <Input
          data-ocid="admin.discount.input"
          type="number"
          placeholder={parsed ? String(parsed.flatAmount) : "e.g. 50"}
          value={flatAmount}
          onChange={(e) => setFlatAmount(e.target.value)}
          min="0"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Minimum Order for Flat Discount (₹)
        </Label>
        <Input
          data-ocid="admin.discount.input"
          type="number"
          placeholder={parsed ? String(parsed.flatMinimum) : "e.g. 300"}
          value={flatMinimum}
          onChange={(e) => setFlatMinimum(e.target.value)}
          min="0"
        />
      </div>

      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
        Free Item Offer
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Free Item Description</Label>
        <Input
          data-ocid="admin.discount.input"
          placeholder={parsed?.freeItem ? parsed.freeItem : "e.g. 1 kg Tomato"}
          value={freeItem}
          onChange={(e) => setFreeItem(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Minimum Order for Free Item (₹)
        </Label>
        <Input
          data-ocid="admin.discount.input"
          type="number"
          placeholder={
            parsed
              ? String(parsed.freeItemMinimum || "") || "e.g. 500"
              : "e.g. 500"
          }
          value={freeItemMinimum}
          onChange={(e) => setFreeItemMinimum(e.target.value)}
          min="0"
        />
      </div>

      {(percentage || flatAmount || freeItem) && (
        <div className="bg-secondary/60 rounded-lg px-3 py-2 text-xs text-muted-foreground space-y-0.5">
          {percentage && minimumAmount && (
            <p>
              Preview: Customers get <strong>{percentage}%</strong> off on
              orders above ₹{minimumAmount}
            </p>
          )}
          {flatAmount && flatMinimum && (
            <p>
              Preview: Customers get <strong>₹{flatAmount}</strong> off on
              orders above ₹{flatMinimum}
            </p>
          )}
          {freeItem && freeItemMinimum && (
            <p>
              Preview: Customers get <strong>FREE {freeItem}</strong> on orders
              above ₹{freeItemMinimum}
            </p>
          )}
        </div>
      )}

      <Button
        data-ocid="admin.discount.save_button"
        className="w-full font-bold"
        onClick={handleSave}
        disabled={setDiscount.isPending}
      >
        {setDiscount.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          "Save Discount"
        )}
      </Button>
    </div>
  );
}

// ─── Profiles Tab ─────────────────────────────────────────────────────────────
function ProfilesTab() {
  const { data: profiles, isLoading } = useProfiles();

  if (isLoading) {
    return (
      <div data-ocid="admin.profiles.loading_state" className="space-y-2">
        {["pr1", "pr2", "pr3"].map((k) => (
          <Skeleton key={k} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!profiles?.length) {
    return (
      <div data-ocid="admin.profiles.empty_state" className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          No customer profiles yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {profiles.map((profile: CustomerProfile, idx: number) => (
        <div
          key={profile.phone}
          data-ocid={`admin.profiles.item.${idx + 1}`}
          className="bg-card rounded-xl p-3 shadow-xs"
        >
          <p className="font-display font-bold text-sm">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.phone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile.address}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const { data: bannerEnabled } = useBannerEnabled();
  const { data: bannerText } = useBannerText();
  const { data: minimumOrderData } = useMinimumOrder();

  const setBannerEnabled = useSetBannerEnabled();
  const setBannerText = useSetBannerText();
  const setMinimumOrder = useSetMinimumOrder();

  const [bannerHeadline, setBannerHeadline] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");

  // Sync input when data loads
  useEffect(() => {
    if (bannerText && !bannerHeadline) {
      setBannerHeadline(bannerText);
    }
  }, [bannerText, bannerHeadline]);

  useEffect(() => {
    if (minimumOrderData !== undefined && !minOrderAmount) {
      setMinOrderAmount(String(minimumOrderData));
    }
  }, [minimumOrderData, minOrderAmount]);

  const handleSaveBannerText = async () => {
    if (!bannerHeadline.trim()) {
      toast.error("Please enter banner headline text");
      return;
    }
    try {
      await setBannerText.mutateAsync(bannerHeadline.trim());
      toast.success("Banner text updated!");
    } catch {
      toast.error("Failed to update banner text");
    }
  };

  const handleBannerToggle = async (checked: boolean) => {
    try {
      await setBannerEnabled.mutateAsync(checked);
      toast.success(checked ? "Hero banner enabled" : "Hero banner hidden");
    } catch {
      toast.error("Failed to update setting");
    }
  };

  const handleSaveMinimumOrder = async () => {
    const amount = Number.parseInt(minOrderAmount, 10);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount (0 or more)");
      return;
    }
    try {
      await setMinimumOrder.mutateAsync(amount);
      toast.success("Minimum order updated!");
    } catch {
      toast.error("Failed to update minimum order");
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-xl p-4 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-sm text-foreground">
          Homepage Display
        </h3>

        {/* Hero Banner Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Show Hero Banner
            </p>
            <p className="text-xs text-muted-foreground">
              Sliding banner at the top of the homepage
            </p>
          </div>
          <Switch
            data-ocid="admin.settings.toggle"
            checked={bannerEnabled !== false}
            onCheckedChange={handleBannerToggle}
            disabled={setBannerEnabled.isPending}
          />
        </div>
      </div>

      {/* Banner Headline Text */}
      <div className="bg-card rounded-xl p-4 shadow-xs space-y-3">
        <h3 className="font-display font-bold text-sm text-foreground">
          Banner Headline Text
        </h3>
        <p className="text-xs text-muted-foreground">
          Custom text shown on the first slide of the hero banner
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Headline Text</Label>
          <Input
            data-ocid="admin.settings.input"
            placeholder="e.g. Fresh Vegetables Daily"
            value={bannerHeadline}
            onChange={(e) => setBannerHeadline(e.target.value)}
            maxLength={50}
          />
        </div>
        <Button
          data-ocid="admin.settings.save_button"
          className="w-full font-bold"
          onClick={handleSaveBannerText}
          disabled={setBannerText.isPending}
        >
          {setBannerText.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Banner Text"
          )}
        </Button>
      </div>

      {/* Minimum Order Amount */}
      <div className="bg-card rounded-xl p-4 shadow-xs space-y-3">
        <h3 className="font-display font-bold text-sm text-foreground">
          Minimum Order Amount
        </h3>
        <p className="text-xs text-muted-foreground">
          Set a minimum order amount. Set to 0 to disable.
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Amount (₹)</Label>
          <Input
            data-ocid="admin.settings.input"
            type="number"
            placeholder="e.g. 99"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            min={0}
          />
        </div>
        <Button
          data-ocid="admin.settings.save_button"
          className="w-full font-bold"
          onClick={handleSaveMinimumOrder}
          disabled={setMinimumOrder.isPending}
        >
          {setMinimumOrder.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Minimum Order"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
interface AdminPageProps {
  onClose: () => void;
}

export default function AdminPage({ onClose }: AdminPageProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center px-3 py-3 border-b border-gray-100">
          <button
            type="button"
            data-ocid="admin.close_button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <PasswordGate onSuccess={() => setIsAdmin(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-3 border-b border-gray-100 bg-white">
        <button
          type="button"
          data-ocid="admin.close_button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h2 className="font-display text-base font-bold text-foreground">
          Admin Panel
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => setIsAdmin(false)}
        >
          Logout
        </Button>
      </div>

      <div className="px-3 py-4">
        <Tabs defaultValue="products">
          <TabsList className="w-full grid grid-cols-6 mb-4">
            <TabsTrigger
              data-ocid="admin.products.tab"
              value="products"
              className="text-[10px]"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.orders.tab"
              value="orders"
              className="text-[10px]"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.delivery.tab"
              value="delivery"
              className="text-[10px]"
            >
              Delivery
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.discount.tab"
              value="discount"
              className="text-[10px]"
            >
              Discount
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.profiles.tab"
              value="profiles"
              className="text-[10px]"
            >
              Profiles
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.settings.tab"
              value="settings"
              className="text-[10px]"
            >
              <Settings className="w-3 h-3 mr-0.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="delivery">
            <DeliveryTab />
          </TabsContent>
          <TabsContent value="discount">
            <DiscountTab />
          </TabsContent>
          <TabsContent value="profiles">
            <ProfilesTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
