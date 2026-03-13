import { Toaster } from "@/components/ui/sonner";
import { Settings, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { KartProvider, useKart } from "./context/KartContext";
import AdminPage from "./pages/AdminPage";
import KartPage from "./pages/KartPage";
import ShopPage from "./pages/ShopPage";

type Tab = "shop" | "kart" | "admin";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const { totalItems } = useKart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary shadow-card">
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          <span className="text-2xl">🥦</span>
          <h1 className="font-display text-xl font-bold text-primary-foreground tracking-tight">
            Brinjal<span className="opacity-80">.fresh</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bottom-safe">
        {activeTab === "shop" && <ShopPage />}
        {activeTab === "kart" && <KartPage />}
        {activeTab === "admin" && <AdminPage />}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-600/30 shadow-card-lg"
        style={{ backgroundColor: "#f97316" }}
      >
        <div className="flex items-stretch">
          <button
            type="button"
            data-ocid="nav.shop.tab"
            onClick={() => setActiveTab("shop")}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-2 transition-colors ${
              activeTab === "shop"
                ? "text-white bg-white/20"
                : "text-white/80 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Shop</span>
          </button>

          <button
            type="button"
            data-ocid="nav.kart.tab"
            onClick={() => setActiveTab("kart")}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-2 relative transition-colors ${
              activeTab === "kart"
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
            <span className="text-xs font-display font-semibold">Kart</span>
          </button>

          <button
            type="button"
            data-ocid="nav.admin.tab"
            onClick={() => setActiveTab("admin")}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-2 transition-colors ${
              activeTab === "admin"
                ? "text-white bg-white/20"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-display font-semibold">Admin</span>
          </button>
        </div>
      </nav>

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
