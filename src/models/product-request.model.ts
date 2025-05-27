export interface ProductImageRequest {
  filename: string;
  content: string;
  mimeType: string;
  isMain: boolean;
  order: number;
  productId: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  isActive?: boolean;
  images?: ProductImageRequest[];
}