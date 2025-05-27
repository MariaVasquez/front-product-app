import axios, { type AxiosInstance } from 'axios';
import type { ProductResponse } from '../models/product-response.model';
import type { ProductRequest } from '../models/product-request.model';
import type { Result } from '../models/result.model';

export class ProductService {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL
    });
  }

  async getProducts(): Promise<Result<ProductResponse[]>>{
    const response = await this.http.get<Result<ProductResponse[]>>('/products');
    return response.data;
  }
  async getProductById(id: number): Promise<Result<ProductResponse>>{
    const response = await this.http.get<Result<ProductResponse>>(`/products/${id}`);
    return response.data;
  }

  async saveProduct(product: ProductRequest): Promise<Result<ProductResponse>> {
    const response = await this.http.post<Result<ProductResponse>>('/products', product);
    return response.data;
  }

  async uploadProductImage(
    productId: number,
    file: File,
    isMain: boolean,
    order: number
  ): Promise<Result<ProductResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isMain', String(isMain));
    formData.append('order', String(order));

    const response = await this.http.post<Result<ProductResponse>>(
      `/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }
}