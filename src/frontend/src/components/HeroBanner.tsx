import { useEffect, useMemo, useState } from "react";
import {
  parseDiscount,
  useDeliveryTiming,
  useDiscount,
} from "../hooks/useQueries";

interface HeroBannerProps {
  bannerHeadline: string;
}

export function HeroBanner({ bannerHeadline }: HeroBannerProps) {
  const [slide, setSlide] = useState(0);
  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();
  const discount = parseDiscount(discountRaw ?? "");

  const slides = useMemo(() => {
    const list: Array<{
      emoji: string;
      headline: string;
      sub: string;
      bg: string;
    }> = [
      {
        emoji: "🛒",
        headline: "Minimum order up to ₹99",
        sub: "Order worth ₹99 or more to checkout",
        bg: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
      },
      {
        emoji: "🚚",
        headline: "Free Delivery on Every Order",
        sub: "No extra charges, ever!",
        bg: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
      },
    ];

    if (deliveryTiming) {
      list.push({
        emoji: "⏰",
        headline: deliveryTiming,
        sub: "Today's delivery schedule",
        bg: "linear-gradient(135deg, #0d4a1a 0%, #15803d 100%)",
      });
    }

    if (discount) {
      const hasDiscount =
        discount.percentage > 0 || discount.flatAmount > 0 || discount.freeItem;
      if (hasDiscount) {
        let headline = bannerHeadline || "Fresh Vegetables Daily";
        if (discount.freeItem && discount.freeItemMinimum > 0) {
          headline = `FREE ${discount.freeItem} on orders above ₹${discount.freeItemMinimum}`;
        } else if (discount.percentage > 0) {
          headline = `${discount.percentage}% OFF on orders above ₹${discount.minimumAmount}`;
        } else if (discount.flatAmount > 0) {
          headline = `₹${discount.flatAmount} OFF on orders above ₹${discount.flatMinimum}`;
        }
        list.push({
          emoji: "🎉",
          headline,
          sub: "Special offer just for you!",
          bg: "linear-gradient(135deg, #581c87 0%, #7c3aed 100%)",
        });
      }
    }

    list.push({
      emoji: "🥦",
      headline: bannerHeadline || "Fresh Vegetables Daily",
      sub: "Farm fresh to your door",
      bg: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
    });

    return list;
  }, [deliveryTiming, discount, bannerHeadline]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentIdx = slide % slides.length;
  const current = slides[currentIdx];

  return (
    <div
      data-ocid="shop.hero.panel"
      className="mx-3 mb-2 rounded-2xl overflow-hidden shadow-card relative"
      style={{ height: 100 }}
    >
      <div
        className="absolute inset-0 flex items-stretch transition-all duration-500"
        style={{ background: current.bg }}
      >
        {/* Left half: text */}
        <div className="w-1/2 flex items-center gap-1.5 pl-3 pr-1">
          <span className="text-xl shrink-0">{current.emoji}</span>
          <div className="min-w-0">
            <p className="text-white font-black text-xs leading-snug drop-shadow line-clamp-2">
              {current.headline}
            </p>
            <p className="text-white/75 text-[9px] font-semibold mt-0.5">
              {current.sub}
            </p>
          </div>
        </div>
        {/* Right half: vegetables image */}
        <div className="w-1/2 relative overflow-hidden">
          <img
            src="/assets/generated/hero-vegetables-group.dim_600x200.jpg"
            alt="Fresh Vegetables"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 right-2 flex gap-1 z-10">
        {slides.map((s, i) => (
          <button
            key={s.headline}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setSlide(i)}
            className={`rounded-full transition-all duration-300 ${
              currentIdx === i
                ? "w-3.5 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
