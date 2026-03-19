import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  ChevronDown,
  Home,
  LayoutGrid,
  MapPin,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { useState } from "react";
import { KartProvider, useKart } from "./context/KartContext";
import AdminPage from "./pages/AdminPage";
import CategoriesPage from "./pages/CategoriesPage";
import KartPage from "./pages/KartPage";
import OrderPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";

export type Tab = "home" | "categories" | "cart" | "orders" | "profile";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAdmin, setShowAdmin] = useState(false);
  const { totalItems, totalAmount } = useKart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #0a3d1a 0%, #1a5c2a 40%, #22c55e 100%)",
        }}
      >
        {/* Top glow bar */}
        <div
          className="h-0.5 w-full"
          style={{
            background: "linear-gradient(90deg, #4ade80, #a3e635, #4ade80)",
          }}
        />
        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
          {/* Left: logo — bold and attractive */}
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 shrink-0"
          >
            {/* Basket icon with glow ring */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0"
              style={{
                background: "linear-gradient(135deg, #16a34a, #4ade80)",
                boxShadow: "0 0 10px rgba(74,222,128,0.5)",
              }}
            >
              <span className="text-lg leading-none">🧺</span>
            </div>
            {/* Brand name */}
            <div className="flex flex-col leading-tight">
              <span
                className="font-black tracking-tight leading-none"
                style={{
                  fontSize: "1.2rem",
                  color: "#ffffff",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  letterSpacing: "-0.5px",
                }}
              >
                Brinjal
                <span
                  className="font-black"
                  style={{
                    color: "#a3e635",
                    textShadow: "0 0 8px rgba(163,230,53,0.6)",
                  }}
                >
                  .fresh
                </span>
              </span>
              <span
                className="text-white/60 font-medium"
                style={{ fontSize: "0.55rem", letterSpacing: "0.08em" }}
              >
                FRESH VEGETABLES & MORE
              </span>
            </div>
          </button>

          {/* Center: location pill */}
          <div className="flex-1 flex justify-center">
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1.5 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <MapPin className="w-3 h-3 text-lime-300" />
              <span className="text-white text-[11px] font-semibold">
                Deliver to: Store
              </span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </div>
          </div>

          {/* Right: bell + cart in rounded square buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <Bell className="w-4 h-4 text-white" />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full"
                style={{ boxShadow: "0 0 4px rgba(248,113,113,0.8)" }}
              />
            </button>
            <button
              type="button"
              data-ocid="header.cart.button"
              aria-label="Cart"
              onClick={() => setActiveTab("cart")}
              className="relative w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: totalItems > 0 ? "8rem" : "4.5rem" }}
      >
        {activeTab === "home" && (
          <ShopPage onOpenAdmin={() => setShowAdmin(true)} />
        )}
        {activeTab === "categories" && <CategoriesPage />}
        {activeTab === "cart" && <KartPage />}
        {activeTab === "orders" && <OrderPage />}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      {/* Admin Overlay */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <AdminPage onClose={() => setShowAdmin(false)} />
        </div>
      )}

      {/* Floating Cart Bar */}
      {totalItems > 0 && activeTab !== "cart" && !showAdmin && (
        <div
          className="fixed left-0 right-0 z-40 px-3"
          style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            data-ocid="cart.floating.button"
            onClick={() => setActiveTab("cart")}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 shadow-card-lg"
            style={{ backgroundColor: "#1a5c2a" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">
                {totalItems} Item{totalItems !== 1 ? "s" : ""} · ₹
                {Number(totalAmount)}
              </span>
            </div>
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
              View Cart ›
            </span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      {!showAdmin && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-600/30"
          style={{ backgroundColor: "#f97316" }}
        >
          <div className="flex items-stretch">
            <button
              type="button"
              data-ocid="nav.home.tab"
              onClick={() => setActiveTab("home")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
                activeTab === "home"
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-display font-semibold">
                Home
              </span>
            </button>

            <button
              type="button"
              data-ocid="nav.categories.tab"
              onClick={() => setActiveTab("categories")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
                activeTab === "categories"
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] font-display font-semibold">
                Categories
              </span>
            </button>

            <button
              type="button"
              data-ocid="nav.cart.tab"
              onClick={() => setActiveTab("cart")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 relative transition-colors ${
                activeTab === "cart"
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-white text-orange-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-display font-semibold">
                Cart
              </span>
            </button>

            <button
              type="button"
              data-ocid="nav.orders.tab"
              onClick={() => setActiveTab("orders")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
                activeTab === "orders"
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-display font-semibold">
                Orders
              </span>
            </button>

            <button
              type="button"
              data-ocid="nav.profile.tab"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
                activeTab === "profile"
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-display font-semibold">
                Profile
              </span>
            </button>
          </div>
        </nav>
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <KartProvider>
      <AppContent />
    </KartProvider>
  );
}
