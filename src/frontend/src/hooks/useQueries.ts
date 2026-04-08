import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DiscountSettings, Order, Product } from "../backend";
import { createActor } from "../backend";

export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
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
  const { actor, isFetching } = useActor(createActor);
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
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DiscountSettings | null>({
    queryKey: ["discount"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDiscountSettings();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useOrdersByPhone(phone: string) {
  const { actor, isFetching } = useActor(createActor);
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
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor(createActor);
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
      discountType: string;
      freeItem: string;
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
        params.discountType,
        params.freeItem,
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
  const { actor } = useActor(createActor);
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
  const { actor } = useActor(createActor);
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
  const { actor } = useActor(createActor);
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
  const { actor } = useActor(createActor);
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
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteOrder(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSetDeliveryTiming() {
  const { actor } = useActor(createActor);
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
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      percentageOff: bigint;
      percentageMinOrder: bigint;
      flatOff: bigint;
      flatMinOrder: bigint;
      freeItemName: string;
      freeItemMinOrder: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setDiscountSettings(
        params.percentageOff,
        params.percentageMinOrder,
        params.flatOff,
        params.flatMinOrder,
        params.freeItemName,
        params.freeItemMinOrder,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discount"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor(createActor);
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

export function useGetCustomSlides() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Array<[bigint, string]>>({
    queryKey: ["customSlides"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomSlides();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAddCustomSlide() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCustomSlide(text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customSlides"] });
    },
  });
}

export function useDeleteCustomSlide() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCustomSlide(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customSlides"] });
    },
  });
}

/** Parse discount from DiscountSettings object into a simple numeric shape */
export function parseDiscount(raw: DiscountSettings | null | undefined): {
  percentage: number;
  minimumAmount: number;
  flatAmount: number;
  flatMinimum: number;
  freeItem: string;
  freeItemMinimum: number;
} | null {
  if (!raw) return null;
  return {
    percentage: Number(raw.percentageOff),
    minimumAmount: Number(raw.percentageMinOrder),
    flatAmount: Number(raw.flatOff),
    flatMinimum: Number(raw.flatMinOrder),
    freeItem: raw.freeItemName,
    freeItemMinimum: Number(raw.freeItemMinOrder),
  };
}
