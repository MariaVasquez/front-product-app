import { useQueries, useQuery } from "@tanstack/react-query";
import { ProductService } from "../api/products-service";

const productService = new ProductService();

export const useProduct = (productId: number) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId).then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductsByIds = (productIds: number[]) => {
  return useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productService.getProductById(id).then(res => res.data),
      staleTime: 1000 * 60 * 5,
    })),
  });
};