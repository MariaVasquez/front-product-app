import type { ProductResponse } from "../../models/product-response.model";
import type { Result } from "../../models/result.model";
import { ProductService } from "../products-service";


const productService = new ProductService();

export const fetchProducts = async (): Promise<ProductResponse[]> => {
  const result: Result<ProductResponse[]> = await productService.getProducts();
  return result.data || [];
};