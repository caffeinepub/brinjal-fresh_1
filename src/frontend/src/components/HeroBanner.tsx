import { useEffect, useMemo, useState } from "react";
import {
  parseDiscount,
  useDeliveryTiming,
  useDiscount,
  useGetCustomSlides,
} from "../hooks/useQueries";

interface HeroBannerProps {
  bannerHeadline: string;
}

interface Slide {
  emoji: string;
  headline: string;
  sub: string;
  tint: string;
}

const SLIDE_INTERVAL = 3000;

export function HeroBanner({ bannerHeadline }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const { data: deliveryTiming } = useDeliveryTiming();
  const { data: discountRaw } = useDiscount();
  const { data: customSlidesRaw } = useGetCustomSlides();
  const discount = parseDiscount(discountRaw ?? null);

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = [
      {
        emoji: "🛒",
        headline: "Minimum Order ₹99",
        sub: "Place orders above ₹99 to checkout",
        tint: "linear-gradient(120deg, rgba(180,83,9,0.82) 0%, rgba(120,53,15,0.65) 60%, rgba(0,0,0,0.25) 100%)",
      },
      {
        emoji: "🚚",
        headline: "Free Delivery",
        sub: "On every order, always",
        tint: "linear-gradient(120deg, rgba(21,128,61,0.82) 0%, rgba(13,74,26,0.65) 60%, rgba(0,0,0,0.25) 100%)",
      },
    ];

    if (deliveryTiming) {
      list.push({
        emoji: "⏰",
        headline: deliveryTiming,
        sub: "Fresh to your doorstep",
        tint: "linear-gradient(120deg, rgba(29,78,216,0.82) 0%, rgba(30,58,138,0.65) 60%, rgba(0,0,0,0.25) 100%)",
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
          headline = `${discount.percentage}% OFF above ₹${discount.minimumAmount}`;
        } else if (discount.flatAmount > 0) {
          headline = `₹${discount.flatAmount} OFF above ₹${discount.flatMinimum}`;
        }
        list.push({
          emoji: "🎉",
          headline,
          sub: "Special offer just for you!",
          tint: "linear-gradient(120deg, rgba(109,40,217,0.82) 0%, rgba(76,29,149,0.65) 60%, rgba(0,0,0,0.25) 100%)",
        });
      }
    }

    if (customSlidesRaw && customSlidesRaw.length > 0) {
      for (const [, text] of customSlidesRaw) {
        list.push({
          emoji: "🥬",
          headline: text,
          sub: "Brinjal Fresh Store",
          tint: "linear-gradient(120deg, rgba(15,118,110,0.82) 0%, rgba(19,78,74,0.65) 60%, rgba(0,0,0,0.25) 100%)",
        });
      }
    }

    return list;
  }, [deliveryTiming, discount, bannerHeadline, customSlidesRaw]);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 260);
  };

  useEffect(() => {
    const advanceSlide = () => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFading(false);
      }, 260);
    };
    const timer = setInterval(advanceSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeIdx = current % slides.length;
  const activeSlide = slides[activeIdx];

  return (
    <div
      data-ocid="shop.hero.panel"
      className="mx-3 mb-2 rounded-2xl overflow-hidden shadow-hero relative select-none"
      style={{ height: 192 }}
    >
      {/* Full-width background vegetable image */}
      <img
        src="/assets/generated/hero-vegetables-group.dim_600x200.jpg"
        alt="Fresh Vegetables"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Base dark overlay for contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.12) 100%)",
        }}
      />

      {/* Colored tint overlay — changes per slide */}
      <div
        className="absolute inset-0 transition-slide"
        style={{
          background: activeSlide.tint,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.28s ease-in-out",
        }}
      />

      {/* Text content */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-4 pb-6 pt-3"
        style={{
          opacity: fading ? 0 : 1,
          transition: "opacity 0.22s ease-in-out",
        }}
      >
        {/* Emoji badge */}
        <span
          className="text-2xl mb-1.5 leading-none drop-shadow-md"
          aria-hidden="true"
        >
          {activeSlide.emoji}
        </span>

        {/* Headline */}
        <h2
          className="text-white font-extrabold leading-tight drop-shadow-md"
          style={{
            fontSize: "clamp(1rem, 4.5vw, 1.25rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            maxWidth: "62%",
          }}
        >
          {activeSlide.headline}
        </h2>

        {/* Sub-text */}
        <p
          className="font-semibold mt-1 drop-shadow"
          style={{
            fontSize: "clamp(0.68rem, 3vw, 0.8rem)",
            color: "rgba(255,255,255,0.88)",
            textShadow: "0 1px 4px rgba(0,0,0,0.45)",
            maxWidth: "58%",
          }}
        >
          {activeSlide.sub}
        </p>

        {/* Orange pill accent */}
        <div className="mt-2.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-white font-bold text-[10px] shadow"
            style={{
              background: "rgba(251,146,60,0.92)",
              letterSpacing: "0.01em",
            }}
          >
            🛍️ Order Now
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2.5 left-4 flex gap-1.5 z-10">
        {slides.map((s, i) => (
          <button
            key={`dot-${i}-${s.headline.slice(0, 8)}`}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width: activeIdx === i ? 20 : 7,
              height: 7,
              background:
                activeIdx === i
                  ? "rgba(251,146,60,1)"
                  : "rgba(255,255,255,0.55)",
              boxShadow:
                activeIdx === i ? "0 1px 4px rgba(0,0,0,0.35)" : "none",
            }}
          />
        ))}
      </div>

      {/* Slide count badge (top-right) */}
      <div className="absolute top-2.5 right-3 z-10">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.4)",
            color: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
          }}
        >
          {activeIdx + 1}/{slides.length}
        </span>
      </div>
    </div>
  );
}
