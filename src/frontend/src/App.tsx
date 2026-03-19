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
        className="sticky top-0 z-40 shadow-md"
        style={{ backgroundColor: "#1a5c2a" }}
      >
        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
          {/* Left: logo */}
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-1.5 shrink-0"
          >
            <span className="text-xl">🥦</span>
            <span className="text-white font-bold text-base tracking-tight font-display">
              Brinjal<span className="opacity-75">.fresh</span>
            </span>
          </button>

          {/* Center: location pill */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1">
              <MapPin className="w-3 h-3 text-orange-300" />
              <span className="text-white text-xs font-medium">
                Deliver to: Store
              </span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </div>
          </div>

          {/* Right: bell + cart */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              type="button"
              data-ocid="header.cart.button"
              aria-label="Cart"
              onClick={() => setActiveTab("cart")}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
