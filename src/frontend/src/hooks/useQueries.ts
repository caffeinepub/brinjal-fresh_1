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
    refetchInterval: 60_000,
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
    refetchInterval: 60_000,
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
        quantity: bigint;
        price: bigint;
      }>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        params.customerName,
        params.customerPhone,
        params.customerAddress,
        params.paymentMethod,
        params.items,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      price: bigint;
      stock: bigint;
      imageId: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(
        params.name,
        params.price,
        params.stock,
        params.imageId,
        params.category,
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
      price: bigint;
      stock: bigint;
      imageId: string;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(
        params.id,
        params.name,
        params.price,
        params.stock,
        params.imageId,
        params.category,
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
