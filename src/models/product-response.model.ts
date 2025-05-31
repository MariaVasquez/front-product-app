export interface ProductImageResponse {
  id: number | null;
  url: string;
  isMain: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductColors {
  color: string;
  hexadecimalRgb: string;
}

export interface ProductResponse {
  id: number | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  images: ProductImageResponse[];
  productColor: ProductColors[];
}

export interface Product {
  id: number;
  title: string;
  price: string;
  imageUrl: string;
}