export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderTransactionResponse {
  id: number;
  provider: string;
  externalId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface OrderResponse {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponse[];
  transactions?: OrderTransactionResponse[];
}