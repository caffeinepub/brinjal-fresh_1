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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Lock,
  Package,
  Pencil,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, Product } from "../backend";
import {
  useAddProduct,
  useDeleteOrder,
  useDeleteProduct,
  useDeliveryTiming,
  useDiscount,
  useOrders,
  useProducts,
  useSetDeliveryTiming,
  useSetDiscount,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "adita96319";
const ADMIN_KEY = "brinjal_admin";

function groupOrders(orders: Order[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayOrders: Order[] = [];
  const yesterdayOrders: Order[] = [];
  const pastGroups: Record<string, Order[]> = {};

  for (const order of orders) {
    const d = new Date(Number(order.createdAt) / 1_000_000);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) {
      todayOrders.push(order);
    } else if (d.getTime() === yesterday.getTime()) {
      yesterdayOrders.push(order);
    } else {
      const key = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!pastGroups[key]) pastGroups[key] = [];
      pastGroups[key].push(order);
    }
  }
  return { todayOrders, yesterdayOrders, pastGroups };
}

function parseDiscount(discountText: string): {
  pct: string;
  minOrder: string;
} {
  if (!discountText) return { pct: "", minOrder: "" };
  const parts = discountText.split("|");
  if (parts.length === 2) return { pct: parts[0], minOrder: parts[1] };
  return { pct: "", minOrder: "" };
}

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const handleStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const statusColor =
    order.status === "Delivered"
      ? "#16a34a"
      : order.status === "Processing"
        ? "#d97706"
        : "#6b7280";

  return (
    <div className="bg-white rounded-xl p-3 shadow-card space-y-2 border border-border">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
          <p className="text-xs text-muted-foreground">
            {order.customerAddress}
          </p>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-sm" style={{ color: "#15803d" }}>
            ₹{String(order.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {order.items.map((item) => (
          <span key={item.productName}>
            {item.productName} ×{String(item.quantity)}
            {""}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Badge
          style={{
            backgroundColor: statusColor,
            color: "white",
            fontSize: "11px",
          }}
        >
          {order.status}
        </Badge>
        <Select value={order.status} onValueChange={handleStatus}>
          <SelectTrigger
            data-ocid="admin.order.select"
            className="h-7 text-xs w-auto flex-1"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        {order.status === "Delivered" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                data-ocid="admin.order.delete_button"
                size="icon"
                variant="destructive"
                className="h-7 w-7 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete order for {order.customerName}? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="admin.order.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="admin.order.confirm_button"
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
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
      </div>
    </div>
  );
}

function ProductForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Product;
  onSave: (data: {
    name: string;
    price: bigint;
    stock: bigint;
    imageId: string;
  }) => void;
  onCancel?: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "");
  const [imageId, setImageId] = useState(initial?.imageId ?? "");

  return (
    <div className="space-y-3">
      <div>
        <Label className="font-bold">Product Name</Label>
        <Input
          data-ocid="admin.product.input"
          placeholder="e.g. Tomatoes"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="font-bold">Price per kg (₹)</Label>
        <Input
          data-ocid="admin.product.input"
          type="number"
          placeholder="e.g. 60"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="font-bold">Stock (kg)</Label>
        <Input
          data-ocid="admin.product.input"
          type="number"
          placeholder="e.g. 50"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="font-bold">Image URL</Label>
        <Input
          data-ocid="admin.product.input"
          placeholder="https://... or /assets/..."
          value={imageId}
          onChange={(e) => setImageId(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <Button
            data-ocid="admin.product.cancel_button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          data-ocid="admin.product.save_button"
          className="flex-1 font-bold"
          style={{ backgroundColor: "#4d7c0f", color: "white" }}
          disabled={isPending}
          onClick={() => {
            if (!name || !price || !stock) {
              toast.error("Please fill name, price, and stock");
              return;
            }
            onSave({
              name,
              price: BigInt(Math.round(Number.parseFloat(price))),
              stock: BigInt(Math.round(Number.parseFloat(stock))),
              imageId,
            });
          }}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(ADMIN_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deliveryInput, setDeliveryInput] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [discountMin, setDiscountMin] = useState("");

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountText } = useDiscount();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setDeliveryTiming = useSetDeliveryTiming();
  const setDiscount = useSetDiscount();

  useEffect(() => {
    if (deliveryTiming) setDeliveryInput(deliveryTiming);
  }, [deliveryTiming]);

  useEffect(() => {
    if (discountText) {
      const parsed = parseDiscount(discountText);
      setDiscountPct(parsed.pct);
      setDiscountMin(parsed.minOrder);
    }
  }, [discountText]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "true");
      setIsAdmin(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  };

  const handleAddProduct = async (data: {
    name: string;
    price: bigint;
    stock: bigint;
    imageId: string;
  }) => {
    try {
      await addProduct.mutateAsync({ ...data, category: "vegetables" });
      toast.success("Product added!");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (
    id: bigint,
    data: { name: string; price: bigint; stock: bigint; imageId: string },
  ) => {
    try {
      await updateProduct.mutateAsync({ id, ...data, category: "vegetables" });
      toast.success("Product updated!");
      setEditingId(null);
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleSaveDelivery = async () => {
    try {
      await setDeliveryTiming.mutateAsync(deliveryInput);
      toast.success("Delivery timing updated!");
    } catch {
      toast.error("Failed to save delivery timing");
    }
  };

  const handleSaveDiscount = async () => {
    const pct = Number.parseFloat(discountPct);
    const min = Number.parseFloat(discountMin);
    if (Number.isNaN(pct) || Number.isNaN(min) || pct < 0 || min < 0) {
      toast.error("Please enter valid discount values");
      return;
    }
    try {
      await setDiscount.mutateAsync(`${pct}|${min}`);
      toast.success("Discount saved!");
    } catch {
      toast.error("Failed to save discount");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-6 w-full max-w-sm space-y-4">
          <div className="text-center">
            <Lock
              className="w-10 h-10 mx-auto mb-2"
              style={{ color: "#4d7c0f" }}
            />
            <h2 className="text-xl font-bold">Admin Login</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter password to continue
            </p>
          </div>
          <div>
            <Input
              data-ocid="admin.login.input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={loginError ? "border-red-500" : ""}
            />
            {loginError && (
              <p
                data-ocid="admin.login.error_state"
                className="text-xs text-red-500 mt-1"
              >
                Incorrect password
              </p>
            )}
          </div>
          <Button
            data-ocid="admin.login.submit_button"
            className="w-full font-bold"
            style={{ backgroundColor: "#f97316", color: "white" }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  const { todayOrders, yesterdayOrders, pastGroups } = groupOrders(
    orders ?? [],
  );

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <Button
          data-ocid="admin.logout.button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="w-full mb-4 grid grid-cols-4 h-auto">
          <TabsTrigger
            data-ocid="admin.products.tab"
            value="products"
            className="text-xs py-2"
          >
            <Package className="w-3.5 h-3.5 mr-1" />
            Products
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.orders.tab"
            value="orders"
            className="text-xs py-2"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.delivery.tab"
            value="delivery"
            className="text-xs py-2"
          >
            Delivery
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.discount.tab"
            value="discount"
            className="text-xs py-2"
          >
            Discount
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-3">
          <Button
            data-ocid="admin.product.open_modal_button"
            className="w-full font-bold"
            style={{ backgroundColor: "#4d7c0f", color: "white" }}
            onClick={() => setShowAddForm((v) => !v)}
          >
            {showAddForm ? "Cancel" : "+ Add Product"}
          </Button>

          {showAddForm && (
            <div className="bg-white rounded-xl p-4 shadow-card border border-border">
              <h3 className="font-bold mb-3">Add New Product</h3>
              <ProductForm
                onSave={handleAddProduct}
                onCancel={() => setShowAddForm(false)}
                isPending={addProduct.isPending}
              />
            </div>
          )}

          {productsLoading ? (
            <div
              data-ocid="admin.products.loading_state"
              className="text-center py-8 text-muted-foreground"
            >
              Loading products...
            </div>
          ) : (products ?? []).length === 0 ? (
            <div
              data-ocid="admin.products.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              No products yet. Add your first product!
            </div>
          ) : (
            <div className="space-y-2">
              {(products ?? []).map((product, idx) => (
                <div
                  key={String(product.id)}
                  data-ocid={`admin.product.item.${idx + 1}`}
                  className="bg-white rounded-xl p-3 shadow-card border border-border"
                >
                  {editingId === product.id ? (
                    <>
                      <p className="font-bold text-sm mb-3">
                        Editing: {product.name}
                      </p>
                      <ProductForm
                        initial={product}
                        onSave={(data) => handleUpdateProduct(product.id, data)}
                        onCancel={() => setEditingId(null)}
                        isPending={updateProduct.isPending}
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      {product.imageId && (
                        <img
                          src={product.imageId}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs" style={{ color: "#15803d" }}>
                          <span className="font-extrabold">
                            ₹{String(product.price)}/kg
                          </span>
                          {" · "}
                          Stock: {String(product.stock)}kg
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          data-ocid={`admin.product.edit_button.${idx + 1}`}
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setEditingId(product.id)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              data-ocid={`admin.product.delete_button.${idx + 1}`}
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete "{product.name}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <div
              data-ocid="admin.orders.loading_state"
              className="text-center py-8 text-muted-foreground"
            >
              Loading orders...
            </div>
          ) : (orders ?? []).length === 0 ? (
            <div
              data-ocid="admin.orders.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              No orders yet.
            </div>
          ) : (
            <>
              {todayOrders.length > 0 && (
                <section>
                  <h3 className="font-bold text-sm mb-2 text-foreground">
                    Today
                  </h3>
                  <div className="space-y-2">
                    {todayOrders.map((o) => (
                      <OrderCard key={String(o.id)} order={o} />
                    ))}
                  </div>
                </section>
              )}
              {yesterdayOrders.length > 0 && (
                <section>
                  <h3 className="font-bold text-sm mb-2 text-foreground">
                    Yesterday
                  </h3>
                  <div className="space-y-2">
                    {yesterdayOrders.map((o) => (
                      <OrderCard key={String(o.id)} order={o} />
                    ))}
                  </div>
                </section>
              )}
              {Object.entries(pastGroups)
                .sort(
                  (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
                )
                .map(([date, dateOrders]) => (
                  <section key={date}>
                    <h3 className="font-bold text-sm mb-2 text-foreground">
                      {date}
                    </h3>
                    <div className="space-y-2">
                      {dateOrders.map((o) => (
                        <OrderCard key={String(o.id)} order={o} />
                      ))}
                    </div>
                  </section>
                ))}
            </>
          )}
        </TabsContent>

        {/* Delivery Timing Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-card border border-border space-y-3">
            <h3 className="font-bold">Delivery Timing</h3>
            <p className="text-sm text-muted-foreground">
              Set the delivery time message shown to customers.
            </p>
            <Input
              data-ocid="admin.delivery.input"
              placeholder="e.g. Delivery between 6am - 9am"
              value={deliveryInput}
              onChange={(e) => setDeliveryInput(e.target.value)}
            />
            <Button
              data-ocid="admin.delivery.save_button"
              className="w-full font-bold"
              style={{ backgroundColor: "#4d7c0f", color: "white" }}
              disabled={setDeliveryTiming.isPending}
              onClick={handleSaveDelivery}
            >
              {setDeliveryTiming.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Timing"
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Discount Tab */}
        <TabsContent value="discount" className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-card border border-border space-y-3">
            <h3 className="font-bold">Store Discount</h3>
            <p className="text-sm text-muted-foreground">
              Set a discount for customers who meet a minimum order amount.
            </p>
            <div>
              <Label className="font-bold">Discount %</Label>
              <Input
                data-ocid="admin.discount.input"
                type="number"
                placeholder="e.g. 10"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-bold">Minimum Order Amount (₹)</Label>
              <Input
                data-ocid="admin.discount.input"
                type="number"
                placeholder="e.g. 300"
                value={discountMin}
                onChange={(e) => setDiscountMin(e.target.value)}
                className="mt-1"
              />
            </div>
            {discountPct && discountMin && (
              <div
                className="px-3 py-2 rounded-lg text-sm font-bold"
                style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}
              >
                Preview: {discountPct}% off on orders of ₹{discountMin} and
                above
              </div>
            )}
            <Button
              data-ocid="admin.discount.save_button"
              className="w-full font-bold"
              style={{ backgroundColor: "#4d7c0f", color: "white" }}
              disabled={setDiscount.isPending}
              onClick={handleSaveDiscount}
            >
              {setDiscount.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Discount"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
