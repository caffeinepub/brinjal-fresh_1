import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, Product } from "../backend";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useDeliveryTiming() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["deliveryTiming"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getDeliveryTiming();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useDiscount() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["discount"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getDiscount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrdersByPhone(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["ordersByPhone", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      return actor.getOrdersByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBannerEnabled() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["bannerEnabled"],
    queryFn: async () => {
      if (!actor) return true;
      try {
        return await (actor as any).getBannerEnabled();
      } catch {
        return true;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useTrustBadgesEnabled() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["trustBadgesEnabled"],
    queryFn: async () => {
      if (!actor) return true;
      try {
        return await (actor as any).getTrustBadgesEnabled();
      } catch {
        return true;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useBannerText() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["bannerText"],
    queryFn: async () => {
      if (!actor) return "Fresh Vegetables Daily";
      try {
        const text = await (actor as any).getBannerText();
        return text || "Fresh Vegetables Daily";
      } catch {
        return "Fresh Vegetables Daily";
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSetBannerEnabled() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).setBannerEnabled(enabled);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bannerEnabled"] });
    },
  });
}

export function useSetTrustBadgesEnabled() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).setTrustBadgesEnabled(enabled);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trustBadgesEnabled"] });
    },
  });
}

export function useSetBannerText() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).setBannerText(text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bannerText"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      paymentMethod: string;
      items: Array<{
        productId: bigint;
        productName: string;
        quantityLabel: string;
        unitPrice: bigint;
        itemTotal: bigint;
      }>;
      subtotal: bigint;
      discountAmount: bigint;
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        params.customerAddress,
        params.paymentMethod,
        params.items,
        params.subtotal,
        params.discountAmount,
        params.totalAmount,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["ordersByPhone"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      price: bigint;
      stock: bigint;
      imageId: string;
      unitType: string;
      productCategory: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(
        params.name,
        params.price,
        params.stock,
        params.imageId,
        params.unitType,
        params.productCategory,
        params.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      stock: bigint;
      imageId: string;
      unitType: string;
      productCategory: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(
        params.id,
        params.name,
        params.price,
        params.stock,
        params.imageId,
        params.unitType,
        params.productCategory,
        params.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["ordersByPhone"] });
    },
  });
}

export function useDeleteOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteOrder(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSetDeliveryTiming() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (timing: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setDeliveryTiming(timing);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveryTiming"] });
    },
  });
}

export function useSetDiscount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (discountText: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setDiscount(discountText);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discount"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      phone: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveProfile(params.name, params.phone, params.address);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

/** Parse discount stored as JSON string */
export function parseDiscount(raw: string): {
  percentage: number;
  minimumAmount: number;
  flatAmount: number;
  flatMinimum: number;
  freeItem: string;
  freeItemMinimum: number;
} | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.percentage === "number" &&
      typeof parsed.minimumAmount === "number"
    ) {
      return {
        percentage: parsed.percentage,
        minimumAmount: parsed.minimumAmount,
        flatAmount:
          typeof parsed.flatAmount === "number" ? parsed.flatAmount : 0,
        flatMinimum:
          typeof parsed.flatMinimum === "number" ? parsed.flatMinimum : 0,
        freeItem: typeof parsed.freeItem === "string" ? parsed.freeItem : "",
        freeItemMinimum:
          typeof parsed.freeItemMinimum === "number"
            ? parsed.freeItemMinimum
            : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}
