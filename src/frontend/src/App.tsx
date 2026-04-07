import { Toaster } from "@/components/ui/sonner";
import {
  Home,
  LayoutGrid,
  type LucideIcon,
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

export type Tab = "home" | "categories" | "cart" | "orders" | "account";

interface NavItem {
  key: Tab;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAdmin, setShowAdmin] = useState(false);
  const { totalItems, totalAmount } = useKart();

  const navItems: NavItem[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "categories", label: "Categories", icon: LayoutGrid },
    { key: "cart", label: "Cart", icon: ShoppingCart, badge: totalItems },
    { key: "orders", label: "Order", icon: Package },
    { key: "account", label: "Account", icon: User },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Compact Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background:
            "linear-gradient(135deg, #14532d 0%, #166534 40%, #16a34a 100%)",
          minHeight: 50,
          maxHeight: 56,
        }}
      >
        <div className="flex items-center justify-between px-3 h-[50px]">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="flex flex-col leading-tight"
          >
            <span
              className="font-display font-black leading-none tracking-tight"
              style={{ fontSize: "0.78rem", color: "#ffffff" }}
            >
              Brinjal
              <span style={{ color: "#bbf7d0" }}>.fresh</span>
            </span>
            <span
              className="font-body font-semibold text-white/65"
              style={{ fontSize: "0.5rem", letterSpacing: "0.05em" }}
            >
              Vegetables &amp; Fruits
            </span>
          </button>

          <button
            type="button"
            data-ocid="header.cart.button"
            aria-label="Cart"
            onClick={() => setActiveTab("cart")}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
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
      </header>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: totalItems > 0 ? "8rem" : "5rem",
          minHeight: 0,
        }}
      >
        {activeTab === "home" && (
          <ShopPage onOpenAdmin={() => setShowAdmin(true)} />
        )}
        {activeTab === "categories" && <CategoriesPage />}
        {activeTab === "cart" && <KartPage />}
        {activeTab === "orders" && <OrderPage />}
        {activeTab === "account" && <ProfilePage />}
      </main>

      {/* Floating cart bar */}
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
            style={{ background: "#14532d" }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                {totalItems} item{totalItems !== 1 ? "s" : ""} &middot; ₹
                {Number(totalAmount) / 100}
              </span>
            </div>
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
              View Cart ›
            </span>
          </button>
        </div>
      )}

      {/* Admin overlay */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <AdminPage onClose={() => setShowAdmin(false)} />
        </div>
      )}

      {/* Bottom Navigation — FIXED */}
      {!showAdmin && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-600/20"
          style={{ backgroundColor: "#f97316" }}
        >
          <div
            className="flex items-stretch"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {navItems.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                type="button"
                data-ocid={`nav.${key}.tab`}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                  activeTab === key ? "text-white bg-white/20" : "text-white/80"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-white text-orange-500 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-display font-bold">
                  {label}
                </span>
              </button>
            ))}
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
